import { useCallback, useEffect, useState } from "react";

function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function usePersistedList(key: string, cap?: number) {
  const [items, setItems] = useState<string[]>(() => load(key));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const add = useCallback(
    (path: string) => {
      setItems((prev) => {
        const next = [path, ...prev.filter((p) => p !== path)];
        return cap ? next.slice(0, cap) : next;
      });
    },
    [cap],
  );

  const remove = useCallback((path: string) => {
    setItems((prev) => prev.filter((p) => p !== path));
  }, []);

  const has = useCallback((path: string) => items.includes(path), [items]);

  return [items, { add, remove, has }] as const;
}
