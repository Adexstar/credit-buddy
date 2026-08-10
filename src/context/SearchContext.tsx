import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface SearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  const toggleSearch = useCallback(() => setIsOpen((v) => !v), []);
  const value = useMemo(
    () => ({ isOpen, openSearch, closeSearch, toggleSearch }),
    [isOpen, openSearch, closeSearch, toggleSearch],
  );
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
