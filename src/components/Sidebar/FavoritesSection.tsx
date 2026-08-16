import { basename } from "../../lib/fileOps";

type FavoritesSectionProps = {
  favorites: string[];
  onOpenPath: (path: string) => void;
  onUnfavorite: (path: string) => void;
};

export function FavoritesSection({ favorites, onOpenPath, onUnfavorite }: FavoritesSectionProps) {
  if (favorites.length === 0) {
    return <div className="rtmk-sidebar-empty">No favorites yet.</div>;
  }

  return (
    <ul className="rtmk-sidebar-list">
      {favorites.map((path) => (
        <li key={path} className="rtmk-sidebar-row">
          <button type="button" className="rtmk-sidebar-row-main" onClick={() => onOpenPath(path)} title={path}>
            <span className="rtmk-sidebar-row-title">{basename(path)}</span>
          </button>
          <span className="rtmk-sidebar-row-actions">
            <button type="button" className="rtmk-icon-btn" title="Unfavorite" onClick={() => onUnfavorite(path)}>
              ★
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
