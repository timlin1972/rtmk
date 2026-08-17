import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import { insert, replaceAll } from "@milkdown/kit/utils";
import { editorViewCtx } from "@milkdown/kit/core";
import { NodeSelection } from "@milkdown/kit/prose/state";
import "@milkdown/crepe/theme/common/style.css";
import "../theme/crepe-theme.css";
import { tocPlugins, tocInsertMarkdown } from "../milkdown/tocPlugin";
import { internalLinksPlugin } from "../milkdown/internalLinksPlugin";
import { rawSyntaxPlugin } from "../milkdown/rawSyntaxPlugin";
import { codeBlockLineNumbersPlugins } from "../milkdown/codeBlockLineNumbers";
import { buildTableMarkdown } from "../lib/tableMarkdown";

export type EditorHandle = {
  insertToc: (depth: number) => void;
  insertTable: (rows: number, cols: number) => void;
  toggleLineNumbers: () => void;
  getMarkdown: () => string;
};

type EditorProps = {
  docId: string;
  initialContent: string;
  onMarkdownChange: (markdown: string) => void;
};

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { docId, initialContent, onMarkdownChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const onChangeRef = useRef(onMarkdownChange);
  const activeDocIdRef = useRef(docId);
  onChangeRef.current = onMarkdownChange;

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: initialContent,
      features: {
        [Crepe.Feature.Latex]: false,
      },
    });
    crepe.editor
      .use(tocPlugins)
      .use(internalLinksPlugin)
      .use(rawSyntaxPlugin)
      .use(codeBlockLineNumbersPlugins);
    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown) => {
        onChangeRef.current(markdown);
      });
    });
    crepe.create();
    crepeRef.current = crepe;

    return () => {
      crepe.destroy();
      crepeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeDocIdRef.current === docId) return;
    activeDocIdRef.current = docId;
    crepeRef.current?.editor.action(replaceAll(initialContent, false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  useImperativeHandle(
    ref,
    () => ({
      insertToc: (depth) => {
        crepeRef.current?.editor.action(insert(tocInsertMarkdown(depth)));
      },
      insertTable: (rows, cols) => {
        crepeRef.current?.editor.action(insert(`\n${buildTableMarkdown(rows, cols)}\n`));
      },
      toggleLineNumbers: () => {
        crepeRef.current?.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const { selection } = view.state;

          if (selection instanceof NodeSelection && selection.node.type.name === "code_block") {
            const current = selection.node.attrs.showLineNumbers !== false;
            view.dispatch(view.state.tr.setNodeAttribute(selection.from, "showLineNumbers", !current));
            return;
          }

          const { $from } = selection;
          for (let d = $from.depth; d >= 0; d--) {
            const node = $from.node(d);
            if (node.type.name === "code_block") {
              const pos = $from.before(d);
              const current = node.attrs.showLineNumbers !== false;
              view.dispatch(view.state.tr.setNodeAttribute(pos, "showLineNumbers", !current));
              return;
            }
          }
        });
      },
      getMarkdown: () => crepeRef.current?.getMarkdown() ?? "",
    }),
    [],
  );

  return <div ref={containerRef} className="rtmk-editor" />;
});
