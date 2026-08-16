import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import { insert, replaceAll } from "@milkdown/kit/utils";
import "@milkdown/crepe/theme/common/style.css";
import "../theme/crepe-theme.css";
import { tocPlugins, tocInsertMarkdown } from "../milkdown/tocPlugin";
import { internalLinksPlugin } from "../milkdown/internalLinksPlugin";
import { buildTableMarkdown } from "../lib/tableMarkdown";

export type EditorHandle = {
  insertToc: (depth: number) => void;
  insertTable: (rows: number, cols: number) => void;
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
    crepe.editor.use(tocPlugins).use(internalLinksPlugin);
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
      getMarkdown: () => crepeRef.current?.getMarkdown() ?? "",
    }),
    [],
  );

  return <div ref={containerRef} className="rtmk-editor" />;
});
