import { APP_VERSION } from "../../version";

type VersionModalProps = {
  onClose: () => void;
};

export function VersionModal({ onClose }: VersionModalProps) {
  return (
    <div className="rtmk-modal-overlay" onClick={onClose}>
      <div className="rtmk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rtmk-modal-header">
          <span>About rtmk</span>
          <button type="button" className="rtmk-icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="rtmk-modal-body">
          <p>rtmk</p>
          <p>Version {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
