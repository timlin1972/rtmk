export function buildTableMarkdown(rows: number, cols: number): string {
  const header = `| ${Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(" | ")} |`;
  const divider = `| ${Array.from({ length: cols }, () => "---").join(" | ")} |`;
  const bodyRow = `| ${Array.from({ length: cols }, () => " ").join(" | ")} |`;
  const bodyRows = Array.from({ length: Math.max(rows - 1, 1) }, () => bodyRow);
  return [header, divider, ...bodyRows].join("\n");
}
