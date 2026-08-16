import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { TocButton } from "./Toolbar/TocButton";
import { TableGridPicker } from "./Toolbar/TableGridPicker";
import { ManualModal } from "./Toolbar/ManualModal";
import "./Toolbar/toolbar.css";

type AppToolbarProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  title: string;
  isDirty: boolean;
  hasActiveDoc: boolean;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onInsertToc: (depth: number) => void;
  onInsertTable: (rows: number, cols: number) => void;
};

export function AppToolbar({
  sidebarCollapsed,
  onToggleSidebar,
  title,
  isDirty,
  hasActiveDoc,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onInsertToc,
  onInsertTable,
}: AppToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="rtmk-toolbar">
      <button type="button" className="rtmk-toolbar-btn" onClick={onToggleSidebar} title="Toggle sidebar">
        {sidebarCollapsed ? "▶" : "◀"}
      </button>
      <button type="button" className="rtmk-toolbar-btn" onClick={onNew}>
        New
      </button>
      <button type="button" className="rtmk-toolbar-btn" onClick={onOpen}>
        Open
      </button>
      <button type="button" className="rtmk-toolbar-btn" onClick={onSave} disabled={!hasActiveDoc}>
        Save
      </button>
      <button type="button" className="rtmk-toolbar-btn" onClick={onSaveAs} disabled={!hasActiveDoc}>
        Save As
      </button>

      <span className="rtmk-toolbar-sep" />

      <TocButton onInsert={onInsertToc} />
      <TableGridPicker onInsert={onInsertTable} />

      <span className="rtmk-toolbar-sep" />

      <button type="button" className="rtmk-toolbar-btn" onClick={() => setManualOpen(true)}>
        Manual
      </button>

      <span className="rtmk-toolbar-title">
        {isDirty && <span className="rtmk-dirty-dot" />}
        {title}
      </span>

      <button type="button" className="rtmk-toolbar-btn rtmk-toolbar-btn-right" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {manualOpen && <ManualModal onClose={() => setManualOpen(false)} />}
    </div>
  );
}
