type ManualModalProps = {
  onClose: () => void;
};

const SECTIONS: { title: string; rows: [string, string][] }[] = [
  {
    title: "Headings",
    rows: [
      ["# Heading 1", "Largest heading"],
      ["## Heading 2", ""],
      ["### Heading 3", "...through ###### Heading 6"],
    ],
  },
  {
    title: "Emphasis",
    rows: [
      ["**bold**", "Bold text"],
      ["*italic*", "Italic text"],
      ["~~strikethrough~~", "Strikethrough text (GFM)"],
      ["`inline code`", "Inline code"],
    ],
  },
  {
    title: "Lists",
    rows: [
      ["- item", "Bullet list"],
      ["1. item", "Ordered list"],
      ["- [ ] todo", "Task list (unchecked, GFM)"],
      ["- [x] done", "Task list (checked, GFM)"],
    ],
  },
  {
    title: "Links, images & tables",
    rows: [
      ["[text](https://example.com)", "Link"],
      ["[Section](#section-id)", "Internal link — click to jump to a heading"],
      ["![alt](path/to/image.png)", "Image"],
      ["| A | B |\\n| --- | --- |\\n| 1 | 2 |", "GFM table"],
      ["https://example.com", "Autolink (GFM)"],
    ],
  },
  {
    title: "Code blocks",
    rows: [
      ["```js\\nconst x = 1;\\n```", "Fenced code block with language, line numbers, and language picker"],
    ],
  },
  {
    title: "Other blocks",
    rows: [
      ["> quote", "Blockquote"],
      ["---", "Horizontal rule"],
    ],
  },
  {
    title: "rtmk extensions",
    rows: [
      ["Toolbar → TOC", "Insert a live table of contents (auto-updates as headings change)"],
      ["Toolbar → Table", "Insert a table by dragging to pick rows × columns"],
    ],
  },
];

export function ManualModal({ onClose }: ManualModalProps) {
  return (
    <div className="rtmk-modal-overlay" onClick={onClose}>
      <div className="rtmk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rtmk-modal-header">
          <span>Markdown Syntax Reference</span>
          <button type="button" className="rtmk-icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="rtmk-modal-body">
          {SECTIONS.map((section) => (
            <div key={section.title} className="rtmk-manual-section">
              <h3>{section.title}</h3>
              <table className="rtmk-manual-table">
                <tbody>
                  {section.rows.map(([syntax, desc]) => (
                    <tr key={syntax}>
                      <td>
                        <code>{syntax}</code>
                      </td>
                      <td>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
