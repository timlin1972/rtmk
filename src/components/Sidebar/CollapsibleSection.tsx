import type { ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function CollapsibleSection({ title, expanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="rtmk-sidebar-section">
      <button type="button" className="rtmk-sidebar-section-header" onClick={onToggle}>
        <span className={`rtmk-chevron ${expanded ? "expanded" : ""}`}>▸</span>
        <span>{title}</span>
      </button>
      {expanded && <div className="rtmk-sidebar-section-body">{children}</div>}
    </div>
  );
}
