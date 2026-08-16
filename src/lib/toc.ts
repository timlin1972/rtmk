export type HeadingInfo = {
  text: string;
  level: number;
  id: string;
};

export function buildTocMarkdownList(headings: HeadingInfo[], maxDepth: number): string {
  const filtered = headings.filter((h) => h.level <= maxDepth);
  if (filtered.length === 0) return "_No headings found._";

  const minLevel = Math.min(...filtered.map((h) => h.level));
  return filtered
    .map((h) => {
      const indent = "  ".repeat(Math.max(0, h.level - minLevel));
      const text = h.text.trim() || "Untitled";
      return `${indent}- [${text}](#${h.id})`;
    })
    .join("\n");
}
