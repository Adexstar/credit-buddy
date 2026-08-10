import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useSearchContext } from "@/context/SearchContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { KeyboardShortcutsModal } from "@/components/modals/KeyboardShortcutsModal";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

/** Pages listen for these to run their own refresh / export handlers. */
export const REFRESH_EVENT = "vault:refresh";
export const EXPORT_EVENT = "vault:export";

interface ShortcutsContextValue {
  openShortcuts: () => void;
  closeShortcuts: () => void;
  startTour: () => void;
  resetTour: () => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const { isOpen: searchOpen, openSearch, closeSearch, toggleSearch } = useSearchContext();
  const { isTourOpen, startTour, closeTour, resetTour } = useOnboarding();
  const navigate = useNavigate();

  const go = useCallback((to: string) => void navigate({ to }), [navigate]);

  useHotkeys("cmd+k", toggleSearch, { allowInInput: true });
  useHotkeys("cmd+d", () => go("/"));
  useHotkeys("cmd+1", () => go("/apps"));
  useHotkeys("cmd+2", () => go("/credits"));
  useHotkeys("cmd+3", () => go("/policies"));
  useHotkeys("cmd+,", () => go("/settings"));
  useHotkeys("shift+?", () => setHelpOpen((v) => !v));
  useHotkeys("cmd+shift+r", () => {
    document.dispatchEvent(new CustomEvent(REFRESH_EVENT));
    toast.info("Refreshing data…");
  });
  useHotkeys("cmd+shift+e", () => document.dispatchEvent(new CustomEvent(EXPORT_EVENT)));
  useHotkeys("cmd+shift+t", () => resetTour());
  useHotkeys("escape", () => {
    setHelpOpen(false);
    document.dispatchEvent(new CustomEvent("close-modals"));
  }, { allowInInput: true, preventDefault: false });

  const value = useMemo(
    () => ({
      openShortcuts: () => setHelpOpen(true),
      closeShortcuts: () => setHelpOpen(false),
      startTour,
      resetTour,
    }),
    [startTour, resetTour],
  );

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <GlobalSearch isOpen={searchOpen} onClose={closeSearch} />
      <KeyboardShortcutsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <OnboardingTour isOpen={isTourOpen} onClose={closeTour} onOpenSearch={openSearch} />
    </ShortcutsContext.Provider>
  );
}

export function useShortcuts() {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error("useShortcuts must be used within ShortcutsProvider");
  return ctx;
}
