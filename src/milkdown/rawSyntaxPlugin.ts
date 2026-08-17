import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import type { Node as ProseNode, Mark, ResolvedPos } from "@milkdown/kit/prose/model";
import type { EditorState } from "@milkdown/kit/prose/state";

const MARK_CLASS: Record<string, string> = {
  strong: "rtmk-mark-strong",
  emphasis: "rtmk-mark-emphasis",
  strike_through: "rtmk-mark-strike",
  inlineCode: "rtmk-mark-code",
  link: "rtmk-mark-link",
};

function computeBlockPrefix($pos: ResolvedPos): string {
  const parts: string[] = [];
  for (let d = 1; d <= $pos.depth; d++) {
    if ($pos.node(d).type.name === "blockquote") parts.push("> ");
  }

  const parent = $pos.parent;
  if (parent.type.name === "heading") {
    parts.push(`${"#".repeat(parent.attrs.level as number)} `);
    return parts.join("");
  }

  const depth = $pos.depth;
  if (depth >= 1) {
    const listItem = $pos.node(depth - 1);
    if (listItem && listItem.type.name === "list_item" && $pos.index(depth - 1) === 0) {
      const checked = listItem.attrs.checked as boolean | null;
      if (checked != null) {
        parts.push(`- [${checked ? "x" : " "}] `);
      } else if (depth >= 2 && $pos.node(depth - 2).type.name === "ordered_list") {
        const orderedList = $pos.node(depth - 2);
        const order = (orderedList.attrs.order as number) ?? 1;
        parts.push(`${order + $pos.index(depth - 2)}. `);
      } else {
        parts.push("- ");
      }
    }
  }

  return parts.join("");
}

type MarkRange = { from: number; to: number; type: string; mark: Mark };

function collectMarkRanges(doc: ProseNode, start: number, end: number): MarkRange[] {
  const ranges: MarkRange[] = [];
  const active = new Map<string, { from: number; mark: Mark }>();

  doc.nodesBetween(start, end, (node, pos) => {
    if (!node.isText) return;
    const nodeStart = Math.max(pos, start);
    const marksHere = new Map(node.marks.filter((m) => MARK_CLASS[m.type.name]).map((m) => [m.type.name, m]));

    for (const [type, info] of active) {
      if (!marksHere.has(type)) {
        ranges.push({ from: info.from, to: nodeStart, type, mark: info.mark });
        active.delete(type);
      }
    }
    for (const [type, mark] of marksHere) {
      if (!active.has(type)) active.set(type, { from: nodeStart, mark });
    }
  });

  for (const [type, info] of active) {
    ranges.push({ from: info.from, to: end, type, mark: info.mark });
  }
  return ranges;
}

function computeDecorationsUnsafe(state: EditorState): DecorationSet {
  const { $from, $to } = state.selection;
  if (!$from.sameParent($to)) return DecorationSet.empty;
  if (!$from.parent.isTextblock) return DecorationSet.empty;
  if ($from.parent.type.name === "code_block") return DecorationSet.empty;
  if ($from.depth < 1) return DecorationSet.empty;

  const start = $from.start();
  const end = $from.end();
  const decos: Decoration[] = [];
  const depth = $from.depth;

  const blockFrom = $from.before(depth);
  const blockTo = $from.after(depth);
  const prefix = computeBlockPrefix($from);
  decos.push(
    Decoration.node(blockFrom, blockTo, {
      class: "rtmk-source-line",
      ...(prefix ? { "data-rtmk-prefix": prefix } : {}),
    }),
  );

  for (const range of collectMarkRanges(state.doc, start, end)) {
    const attrs: Record<string, string> = { class: MARK_CLASS[range.type] };
    if (range.type === "link") attrs["data-href"] = String(range.mark.attrs.href ?? "");
    decos.push(Decoration.inline(range.from, range.to, attrs));
  }

  return DecorationSet.create(state.doc, decos);
}

function computeDecorations(state: EditorState): DecorationSet {
  try {
    return computeDecorationsUnsafe(state);
  } catch (err) {
    console.error("[rtmk] rawSyntaxPlugin decoration error", err);
    return DecorationSet.empty;
  }
}

const rawSyntaxKey = new PluginKey("rtmk-raw-syntax");

export const rawSyntaxPlugin = $prose(() => {
  return new Plugin({
    key: rawSyntaxKey,
    state: {
      init: (_, state) => computeDecorations(state),
      apply: (_tr, old, _oldState, newState) => computeDecorations(newState) ?? old,
    },
    props: {
      decorations: (state) => rawSyntaxKey.getState(state),
    },
  });
});
