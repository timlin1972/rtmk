import { useCallback, useState } from "react";
import { pickOpen, pickSaveAs, readMarkdown, writeMarkdown, basename, confirmDiscard } from "../lib/fileOps";

export type OpenDoc = {
  id: string;
  filePath: string | null;
  title: string;
  content: string;
  savedContent: string;
};

let untitledCounter = 0;

function makeUntitled(): OpenDoc {
  untitledCounter += 1;
  const id = `untitled-${untitledCounter}`;
  return { id, filePath: null, title: "Untitled", content: "", savedContent: "" };
}

export function isDirty(doc: OpenDoc): boolean {
  return doc.content !== doc.savedContent;
}

export function useWorkspace(onFileTouched?: (path: string) => void) {
  const [openDocs, setOpenDocs] = useState<OpenDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDoc = openDocs.find((d) => d.id === activeId) ?? null;

  const newFile = useCallback(() => {
    const doc = makeUntitled();
    setOpenDocs((prev) => [...prev, doc]);
    setActiveId(doc.id);
  }, []);

  const switchTab = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const openPath = useCallback(
    async (path: string) => {
      const alreadyOpen = openDocs.find((d) => d.filePath === path);
      if (alreadyOpen) {
        setActiveId(alreadyOpen.id);
        return;
      }

      const content = await readMarkdown(path);
      const doc: OpenDoc = {
        id: path,
        filePath: path,
        title: basename(path),
        content,
        savedContent: content,
      };
      setOpenDocs((prev) => [...prev, doc]);
      setActiveId(doc.id);
      onFileTouched?.(path);
    },
    [openDocs, onFileTouched],
  );

  const openFile = useCallback(async () => {
    const path = await pickOpen();
    if (!path) return;
    await openPath(path);
  }, [openPath]);

  const updateActiveContent = useCallback(
    (markdown: string) => {
      if (!activeId) return;
      setOpenDocs((prev) => prev.map((d) => (d.id === activeId ? { ...d, content: markdown } : d)));
    },
    [activeId],
  );

  const saveDoc = useCallback(
    async (doc: OpenDoc, forcePickPath: boolean): Promise<OpenDoc | null> => {
      let targetPath = doc.filePath;
      if (forcePickPath || !targetPath) {
        const picked = await pickSaveAs(targetPath ?? undefined);
        if (!picked) return null;
        targetPath = picked;
      }
      await writeMarkdown(targetPath, doc.content);
      onFileTouched?.(targetPath);
      const updated: OpenDoc = {
        ...doc,
        id: targetPath,
        filePath: targetPath,
        title: basename(targetPath),
        savedContent: doc.content,
      };
      setOpenDocs((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
      setActiveId((current) => (current === doc.id ? updated.id : current));
      return updated;
    },
    [onFileTouched],
  );

  const saveActive = useCallback(async () => {
    if (!activeDoc) return;
    await saveDoc(activeDoc, false);
  }, [activeDoc, saveDoc]);

  const saveActiveAs = useCallback(async () => {
    if (!activeDoc) return;
    await saveDoc(activeDoc, true);
  }, [activeDoc, saveDoc]);

  const closeTab = useCallback(
    async (id: string) => {
      const doc = openDocs.find((d) => d.id === id);
      if (!doc) return;
      if (isDirty(doc)) {
        const discard = await confirmDiscard(`"${doc.title}" has unsaved changes. Discard them?`);
        if (!discard) return;
      }
      setOpenDocs((prev) => {
        const next = prev.filter((d) => d.id !== id);
        setActiveId((current) => {
          if (current !== id) return current;
          const idx = prev.findIndex((d) => d.id === id);
          const fallback = next[idx] ?? next[idx - 1] ?? null;
          return fallback?.id ?? null;
        });
        return next;
      });
    },
    [openDocs],
  );

  const anyDirty = openDocs.some(isDirty);

  const confirmDiscardAll = useCallback(async () => {
    if (!anyDirty) return true;
    const count = openDocs.filter(isDirty).length;
    return confirmDiscard(`You have unsaved changes in ${count} file(s). Discard and quit?`);
  }, [anyDirty, openDocs]);

  return {
    openDocs,
    activeId,
    activeDoc,
    anyDirty,
    newFile,
    switchTab,
    openFile,
    openPath,
    updateActiveContent,
    saveActive,
    saveActiveAs,
    closeTab,
    confirmDiscardAll,
  };
}
