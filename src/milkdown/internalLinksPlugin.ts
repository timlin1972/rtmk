import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";

const internalLinksKey = new PluginKey("rtmk-internal-links");

function findHeadingDom(root: HTMLElement, id: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
}

export const internalLinksPlugin = $prose(() => {
  return new Plugin({
    key: internalLinksKey,
    props: {
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement | null;
          const anchor = target?.closest?.("a");
          if (!anchor) return false;
          const href = anchor.getAttribute("href") ?? "";
          if (!href.startsWith("#")) return false;

          event.preventDefault();
          const id = decodeURIComponent(href.slice(1));
          const heading = findHeadingDom(view.dom as HTMLElement, id);
          heading?.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        },
      },
    },
  });
});
