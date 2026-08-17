import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { TocButton } from "./Toolbar/TocButton";
import { TableGridPicker } from "./Toolbar/TableGridPicker";
import { ManualModal } from "./Toolbar/ManualModal";
import { VersionModal } from "./Toolbar/VersionModal";
import { APP_VERSION } from "../version";
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
  onToggleLineNumbers: () => void;
  sourceMode: boolean;
  onToggleSourceMode: () => void;
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
  onToggleLineNumbers,
  sourceMode,
  onToggleSourceMode,
}: AppToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [manualOpen, setManualOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);

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

      <TocButton onInsert={onInsertToc} disabled={sourceMode} />
      <TableGridPicker onInsert={onInsertTable} disabled={sourceMode} />

      <span className="rtmk-toolbar-sep" />

      <button type="button" className="rtmk-toolbar-btn" onClick={() => setManualOpen(true)}>
        Manual
      </button>
      <button
        type="button"
        className="rtmk-toolbar-btn"
        title="Toggle line numbers for the code block the cursor is in"
        onClick={onToggleLineNumbers}
        disabled={sourceMode}
      >
        Toggle Line #
      </button>

      <span className="rtmk-toolbar-sep" />

      <button
        type="button"
        className={sourceMode ? "rtmk-toolbar-btn rtmk-toolbar-btn-active" : "rtmk-toolbar-btn"}
        title="Toggle raw markdown source view"
        onClick={onToggleSourceMode}
        disabled={!hasActiveDoc}
      >
        {sourceMode ? "Rendered" : "Raw"}
      </button>

      <span className="rtmk-toolbar-title">
        {isDirty && <span className="rtmk-dirty-dot" />}
        {title}
      </span>

      <button
        type="button"
        className="rtmk-toolbar-btn rtmk-toolbar-btn-right"
        onClick={() => setVersionOpen(true)}
        title="Version"
      >
        v{APP_VERSION}
      </button>
      <button type="button" className="rtmk-toolbar-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? "☀" : "☾"}
      </button>

      {manualOpen && <ManualModal onClose={() => setManualOpen(false)} />}
      {versionOpen && <VersionModal onClose={() => setVersionOpen(false)} />}
    </div>
  );
}
