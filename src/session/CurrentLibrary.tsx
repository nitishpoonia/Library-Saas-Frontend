import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LibrarySummary } from "@/api/types";
import { useMe } from "@/features/account/queries";
import { sessionStorage } from "./storage";

/**
 * The branch the app is showing (REVIEW FA5). Every screen reads the branch from here
 * and every query key starts with its id, so switching branch refreshes everything.
 */
type CurrentLibraryValue = {
  library: LibrarySummary | null;
  libraries: LibrarySummary[];
  isLoading: boolean;
  select(id: number): void;
};

const CurrentLibraryContext = createContext<CurrentLibraryValue | null>(null);

export function CurrentLibraryProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    sessionStorage.getLibraryId().then((id) => {
      setSelectedId(id);
      setRestored(true);
    });
  }, []);

  const libraries = me.data?.libraries ?? [];
  // The stored branch if the user still has access to it, otherwise the first one.
  const library = libraries.find((l) => l.id === selectedId) ?? libraries[0] ?? null;

  const select = useCallback((id: number) => {
    setSelectedId(id);
    void sessionStorage.setLibraryId(id);
  }, []);

  const value = useMemo(
    () => ({ library, libraries, isLoading: me.isLoading || !restored, select }),
    [library, libraries, me.isLoading, restored, select],
  );
  return <CurrentLibraryContext.Provider value={value}>{children}</CurrentLibraryContext.Provider>;
}

export function useCurrentLibrary() {
  const value = useContext(CurrentLibraryContext);
  if (!value) throw new Error("useCurrentLibrary must be used inside CurrentLibraryProvider");
  return value;
}

/** For screens that only render once a branch is chosen. */
export function useLibrary(): LibrarySummary {
  const { library } = useCurrentLibrary();
  if (!library) throw new Error("No branch selected");
  return library;
}

/** Owner and Manager see money and settings; Staff don't (backend enforces the same). */
export function useCanManage() {
  const { library } = useCurrentLibrary();
  return library?.role === "OWNER" || library?.role === "MANAGER";
}
