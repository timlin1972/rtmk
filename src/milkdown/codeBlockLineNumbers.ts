import { codeBlockSchema } from "@milkdown/kit/preset/commonmark";
import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import type { Node as ProseNode } from "@milkdown/kit/prose/model";

const codeBlockWithLineNumbers = codeBlockSchema.extendSchema((prev) => (ctx) => {
  const base = prev(ctx);
  return {
    ...base,
    attrs: {
      ...base.attrs,
      showLineNumbers: { default: true, validate: "boolean" },
    },
    parseMarkdown: {
      match: base.parseMarkdown.match,
      runner: (state, node, type) => {
        const rawLang = (node.lang as string | null) ?? "";
        const showLineNumbers = !rawLang.endsWith("=");
        const language = showLineNumbers ? rawLang : rawLang.slice(0, -1);
        const value = node.value as string | null;
        state.openNode(type, { language, showLineNumbers });
        if (value) state.addText(value);
        state.closeNode();
      },
    },
    toMarkdown: {
      match: base.toMarkdown.match,
      runner: (state, node) => {
        const lang = node.attrs.showLineNumbers === false ? `${node.attrs.language}=` : node.attrs.language;
        state.addNode("code", undefined, node.content.firstChild?.text || "", { lang });
      },
    },
  };
});

function computeCodeBlockDecorationsUnsafe(doc: ProseNode): DecorationSet {
  const decos: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === "code_block") {
      const value = node.attrs.showLineNumbers === false ? "off" : "on";
      decos.push(Decoration.node(pos, pos + node.nodeSize, { "data-line-numbers": value }));
    }
  });
  return DecorationSet.create(doc, decos);
}

function computeCodeBlockDecorations(doc: ProseNode): DecorationSet {
  try {
    return computeCodeBlockDecorationsUnsafe(doc);
  } catch (err) {
    console.error("[rtmk] codeBlockLineNumbers decoration error", err);
    return DecorationSet.empty;
  }
}

const codeBlockLineNumbersKey = new PluginKey("rtmk-code-block-line-numbers");

const codeBlockLineNumbersDecorationPlugin = $prose(() => {
  return new Plugin({
    key: codeBlockLineNumbersKey,
    state: {
      init: (_, state) => computeCodeBlockDecorations(state.doc),
      apply: (tr, old) => (tr.docChanged ? computeCodeBlockDecorations(tr.doc) : old),
    },
    props: {
      decorations: (state) => codeBlockLineNumbersKey.getState(state),
    },
  });
});

export const codeBlockLineNumbersPlugins = [...codeBlockWithLineNumbers, codeBlockLineNumbersDecorationPlugin];
