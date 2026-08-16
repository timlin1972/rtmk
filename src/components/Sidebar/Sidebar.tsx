import { usePersistedState } from "../../hooks/usePersistedState";
import type { OpenDoc } from "../../hooks/useWorkspace";
import { CollapsibleSection } from "./CollapsibleSection";
import { OpenFilesSection } from "./OpenFilesSection";
import { FavoritesSection } from "./FavoritesSection";
import { RecentsSection } from "./RecentsSection";
import "./sidebar.css";

type SidebarProps = {
  collapsed: boolean;
  docs: OpenDoc[];
  activeId: string | null;
  favorites: string[];
  recents: string[];
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onToggleFavorite: (path: string) => void;
  onOpenPath: (path: string) => void;
};

type SectionState = { open: boolean; favorite: boolean; recently: boolean };

export function Sidebar({ collapsed, docs, activeId, favorites, recents, onSwitchTab, onCloseTab, onToggleFavorite, onOpenPath }: SidebarProps) {
  const [sections, setSections] = usePersistedState<SectionState>("rtmk:sidebar:sections", {
    open: true,
    favorite: true,
    recently: true,
  });

  if (collapsed) return null;

  const toggle = (key: keyof SectionState) => setSections((s) => ({ ...s, [key]: !s[key] }));

  return (
    <aside className="rtmk-sidebar">
      <CollapsibleSection title="Open" expanded={sections.open} onToggle={() => toggle("open")}>
        <OpenFilesSection docs={docs} activeId={activeId} favorites={favorites} onSwitchTab={onSwitchTab} onCloseTab={onCloseTab} onToggleFavorite={onToggleFavorite} />
      </CollapsibleSection>
      <CollapsibleSection title="Favorite" expanded={sections.favorite} onToggle={() => toggle("favorite")}>
        <FavoritesSection favorites={favorites} onOpenPath={onOpenPath} onUnfavorite={onToggleFavorite} />
      </CollapsibleSection>
      <CollapsibleSection title="Recently" expanded={sections.recently} onToggle={() => toggle("recently")}>
        <RecentsSection recents={recents} onOpenPath={onOpenPath} />
      </CollapsibleSection>
    </aside>
  );
}
