import { Keyboard } from "lucide-react";
import { useShortcuts } from "@/context/ShortcutsContext";

export function KeyboardShortcutsHelp({ className = "" }: { className?: string }) {
  const { openShortcuts } = useShortcuts();
  return (
    <button
      type="button"
      onClick={openShortcuts}
      title="Keyboard shortcuts (?)"
      className={`inline-flex items-center gap-2 rounded-full border border-vault-border bg-vault-panel px-3 py-2 text-sm text-vault-muted transition hover:text-vault-foreground ${className}`}
    >
      <Keyboard size={15} />
      <span className="hidden sm:inline">Shortcuts</span>
      <kbd className="rounded border border-vault-border bg-vault-raised px-1.5 py-0.5 text-xs">?</kbd>
    </button>
  );
}
