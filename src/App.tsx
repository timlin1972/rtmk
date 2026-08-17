import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ThemeProvider } from "./theme/ThemeProvider";
import { usePersistedState } from "./hooks/usePersistedState";
import { usePersistedList } from "./hooks/usePersistedList";
import { useWorkspace, isDirty } from "./hooks/useWorkspace";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { AppToolbar } from "./components/AppToolbar";
import { Editor, type EditorHandle } from "./components/Editor";
import { EmptyState } from "./components/EmptyState";

function AppInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistedState("rtmk:sidebar:collapsed", false);
  const [recents, recentsApi] = usePersistedList("rtmk:recents", 20);
  const [favorites, favoritesApi] = usePersistedList("rtmk:favorites");

  const workspace = useWorkspace(recentsApi.add);
  const editorRef = useRef<EditorHandle>(null);

  useEffect(() => {
    const win = getCurrentWindow();
    let unlisten: (() => void) | undefined;
    win
      .onCloseRequested(async (event) => {
        if (!workspace.anyDirty) return;
        event.preventDefault();
        const discard = await workspace.confirmDiscardAll();
        if (discard) await win.destroy();
      })
      .then((fn) => {
        unlisten = fn;
      });
    return () => unlisten?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.anyDirty]);

  const toggleFavorite = (path: string) => {
    if (favoritesApi.has(path)) favoritesApi.remove(path);
    else favoritesApi.add(path);
  };

  const activeDoc = workspace.activeDoc;

  return (
    <div className="rtmk-app">
      <AppToolbar
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        title={activeDoc ? activeDoc.title : "rtmk"}
        isDirty={activeDoc ? isDirty(activeDoc) : false}
        hasActiveDoc={!!activeDoc}
        onNew={workspace.newFile}
        onOpen={workspace.openFile}
        onSave={workspace.saveActive}
        onSaveAs={workspace.saveActiveAs}
        onInsertToc={(depth) => editorRef.current?.insertToc(depth)}
        onInsertTable={(rows, cols) => editorRef.current?.insertTable(rows, cols)}
        onToggleLineNumbers={() => editorRef.current?.toggleLineNumbers()}
      />
      <div className="rtmk-body">
        <Sidebar
          collapsed={sidebarCollapsed}
          docs={workspace.openDocs}
          activeId={workspace.activeId}
          favorites={favorites}
          recents={recents}
          onSwitchTab={workspace.switchTab}
          onCloseTab={workspace.closeTab}
          onToggleFavorite={toggleFavorite}
          onOpenPath={workspace.openPath}
        />
        <div className="rtmk-main">
          {activeDoc ? (
            <Editor
              key="editor"
              ref={editorRef}
              docId={activeDoc.id}
              initialContent={activeDoc.content}
              onMarkdownChange={workspace.updateActiveContent}
            />
          ) : (
            <EmptyState onNew={workspace.newFile} onOpen={workspace.openFile} />
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
