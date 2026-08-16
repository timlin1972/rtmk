import { basename } from "../../lib/fileOps";

type RecentsSectionProps = {
  recents: string[];
  onOpenPath: (path: string) => void;
};

export function RecentsSection({ recents, onOpenPath }: RecentsSectionProps) {
  if (recents.length === 0) {
    return <div className="rtmk-sidebar-empty">No recent files.</div>;
  }

  return (
    <ul className="rtmk-sidebar-list">
      {recents.map((path) => (
        <li key={path} className="rtmk-sidebar-row">
          <button type="button" className="rtmk-sidebar-row-main" onClick={() => onOpenPath(path)} title={path}>
            <span className="rtmk-sidebar-row-title">{basename(path)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
