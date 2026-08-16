type EmptyStateProps = {
  onNew: () => void;
  onOpen: () => void;
};

export function EmptyState({ onNew, onOpen }: EmptyStateProps) {
  return (
    <div className="rtmk-empty-state">
      <p>Open a file or create a new one to get started.</p>
      <div className="rtmk-empty-state-actions">
        <button type="button" className="rtmk-toolbar-btn" onClick={onNew}>
          New
        </button>
        <button type="button" className="rtmk-toolbar-btn" onClick={onOpen}>
          Open
        </button>
      </div>
    </div>
  );
}
