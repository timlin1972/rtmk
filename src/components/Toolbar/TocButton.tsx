import { useEffect, useRef, useState } from "react";

type TocButtonProps = {
  onInsert: (depth: number) => void;
};

export function TocButton({ onInsert }: TocButtonProps) {
  const [open, setOpen] = useState(false);
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
      <button type="button" className="rtmk-toolbar-btn" title="Insert Table of Contents" onClick={() => setOpen((o) => !o)}>
        TOC
      </button>
      {open && (
        <div className="rtmk-toolbar-popover">
          <div className="rtmk-toolbar-popover-label">Include headings up to level:</div>
          <div className="rtmk-toc-depth-options">
            {[1, 2, 3, 4, 5].map((depth) => (
              <button
                key={depth}
                type="button"
                className="rtmk-toolbar-btn"
                onClick={() => {
                  onInsert(depth);
                  setOpen(false);
                }}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
