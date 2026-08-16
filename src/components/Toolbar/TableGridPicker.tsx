import { useEffect, useRef, useState } from "react";

const MAX_ROWS = 8;
const MAX_COLS = 8;

type TableGridPickerProps = {
  onInsert: (rows: number, cols: number) => void;
};

export function TableGridPicker({ onInsert }: TableGridPickerProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="rtmk-toolbar-popover-root" ref={rootRef}>
      <button type="button" className="rtmk-toolbar-btn" title="Insert Table" onClick={() => setOpen((o) => !o)}>
        Table
      </button>
      {open && (
        <div className="rtmk-toolbar-popover">
          <div className="rtmk-toolbar-popover-label">
            {hover.rows > 0 ? `${hover.rows} x ${hover.cols}` : "Select table size"}
          </div>
          <div className="rtmk-table-grid" onMouseLeave={() => setHover({ rows: 0, cols: 0 })}>
            {Array.from({ length: MAX_ROWS }, (_, r) => (
              <div key={r} className="rtmk-table-grid-row">
                {Array.from({ length: MAX_COLS }, (_, c) => (
                  <div
                    key={c}
                    className={`rtmk-table-grid-cell ${r < hover.rows && c < hover.cols ? "hovered" : ""}`}
                    onMouseEnter={() => setHover({ rows: r + 1, cols: c + 1 })}
                    onClick={() => {
                      onInsert(r + 1, c + 1);
                      setOpen(false);
                      setHover({ rows: 0, cols: 0 });
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
