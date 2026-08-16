import { $node, $view, $prose, $remark, outline } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import type { NodeViewConstructor } from "@milkdown/kit/prose/view";
import { buildTocMarkdownList } from "../lib/toc";

const TOC_NODE_ID = "rtmk_toc";
const TOC_MDAST_TYPE = "rtmkToc";
const LANG_PREFIX = "rtmk-toc:";

type MdastNode = {
  type: string;
  lang?: string | null;
  tocDepth?: number;
  children?: MdastNode[];
};

function renameTocCodeBlocks(node: MdastNode) {
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      if (child.type === "code" && typeof child.lang === "string" && child.lang.startsWith(LANG_PREFIX)) {
        const depth = Number(child.lang.slice(LANG_PREFIX.length)) || 3;
        child.type = TOC_MDAST_TYPE;
        child.tocDepth = depth;
      }
      renameTocCodeBlocks(child);
    });
  }
}

export const tocRemark = $remark("rtmkTocRemark", () => () => (tree: MdastNode) => {
  renameTocCodeBlocks(tree);
});

export const tocNode = $node(TOC_NODE_ID, (ctx) => ({
  atom: true,
  group: "block",
  attrs: {
    depth: { default: 3, validate: "number" },
  },
  parseDOM: [
    {
      tag: `div[data-type="${TOC_NODE_ID}"]`,
      getAttrs: (dom) => ({
        depth: Number((dom as HTMLElement).dataset.depth) || 3,
      }),
    },
  ],
  toDOM: (node) => [
    "div",
    {
      "data-type": TOC_NODE_ID,
      "data-depth": String(node.attrs.depth),
      class: "rtmk-toc-block",
    },
  ],
  parseMarkdown: {
    match: (node) => node.type === TOC_MDAST_TYPE,
    runner: (state, node, type) => {
      state.addNode(type, { depth: (node as MdastNode).tocDepth ?? 3 });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === TOC_NODE_ID,
    runner: (state, node) => {
      const headings = outline()(ctx);
      const list = buildTocMarkdownList(headings, node.attrs.depth);
      state.addNode("code", undefined, list, { lang: `${LANG_PREFIX}${node.attrs.depth}` });
    },
  },
}));

const mountedTocViews = new Set<{ render: () => void }>();

export const tocNodeView = $view(tocNode, (ctx): NodeViewConstructor => {
  return (node) => {
    const dom = document.createElement("div");
    dom.className = "rtmk-toc-block";
    dom.contentEditable = "false";

    const label = document.createElement("div");
    label.className = "rtmk-toc-label";
    label.textContent = "Table of Contents";
    dom.appendChild(label);

    const list = document.createElement("div");
    list.className = "rtmk-toc-list";
    dom.appendChild(list);

    let currentDepth = node.attrs.depth;

    const render = () => {
      const headings = outline()(ctx).filter((h) => h.level <= currentDepth);
      list.innerHTML = "";
      if (headings.length === 0) {
        const empty = document.createElement("div");
        empty.className = "rtmk-toc-empty";
        empty.textContent = "No headings found.";
        list.appendChild(empty);
        return;
      }
      const minLevel = Math.min(...headings.map((h) => h.level));
      const ul = document.createElement("ul");
      headings.forEach((h) => {
        const li = document.createElement("li");
        li.style.marginLeft = `${(h.level - minLevel) * 16}px`;
        const a = document.createElement("a");
        a.href = `#${h.id}`;
        a.textContent = h.text || "Untitled";
        li.appendChild(a);
        ul.appendChild(li);
      });
      list.appendChild(ul);
    };

    const self = { render };
    mountedTocViews.add(self);
    render();

    return {
      dom,
      update: (updatedNode) => {
        if (updatedNode.type !== node.type) return false;
        currentDepth = updatedNode.attrs.depth;
        render();
        return true;
      },
      stopEvent: () => true,
      ignoreMutation: () => true,
      destroy: () => {
        mountedTocViews.delete(self);
      },
    };
  };
});

const tocRefreshKey = new PluginKey("rtmk-toc-refresh");

export const tocRefreshPlugin = $prose(() => {
  return new Plugin({
    key: tocRefreshKey,
    view: () => ({
      update: () => {
        mountedTocViews.forEach((v) => v.render());
      },
    }),
  });
});

export const tocPlugins = [...tocRemark, tocNode, tocNodeView, tocRefreshPlugin];

export function tocInsertMarkdown(depth: number): string {
  return `\n\`\`\`${LANG_PREFIX}${depth}\nToC\n\`\`\`\n`;
}
