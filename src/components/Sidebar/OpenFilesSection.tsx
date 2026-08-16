import type { OpenDoc } from "../../hooks/useWorkspace";
import { isDirty } from "../../hooks/useWorkspace";

type OpenFilesSectionProps = {
  docs: OpenDoc[];
  activeId: string | null;
  favorites: string[];
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onToggleFavorite: (path: string) => void;
};

export function OpenFilesSection({ docs, activeId, favorites, onSwitchTab, onCloseTab, onToggleFavorite }: OpenFilesSectionProps) {
  if (docs.length === 0) {
    return <div className="rtmk-sidebar-empty">No files open.</div>;
  }

  return (
    <ul className="rtmk-sidebar-list">
      {docs.map((doc) => (
        <li key={doc.id} className={`rtmk-sidebar-row ${doc.id === activeId ? "active" : ""}`}>
          <button type="button" className="rtmk-sidebar-row-main" onClick={() => onSwitchTab(doc.id)} title={doc.filePath ?? doc.title}>
            {isDirty(doc) && <span className="rtmk-dirty-dot" />}
            <span className="rtmk-sidebar-row-title">{doc.title}</span>
          </button>
          <span className="rtmk-sidebar-row-actions">
            {doc.filePath && (
              <button
                type="button"
                className="rtmk-icon-btn"
                title={favorites.includes(doc.filePath) ? "Unfavorite" : "Favorite"}
                onClick={() => onToggleFavorite(doc.filePath!)}
              >
                {favorites.includes(doc.filePath) ? "★" : "☆"}
              </button>
            )}
            <button type="button" className="rtmk-icon-btn" title="Close" onClick={() => onCloseTab(doc.id)}>
              ×
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
