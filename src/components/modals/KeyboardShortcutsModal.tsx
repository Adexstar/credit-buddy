import { Keyboard, X } from "lucide-react";
import { SHORTCUTS, SHORTCUT_GROUPS } from "@/utils/shortcuts";

export function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-vault-bg/80 p-4 backdrop-blur-sm animate-[vault-fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-vault-border bg-vault-panel p-6 shadow-2xl animate-[vault-scale-in_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-vault-teal/30 bg-vault-teal/10 text-vault-teal">
              <Keyboard size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-vault-foreground">Keyboard shortcuts</h2>
              <p className="text-sm text-vault-muted">Speed up your workflow</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close shortcuts dialog"
            onClick={onClose}
            className="rounded-md p-1 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-2 text-xs font-medium tracking-wide text-vault-faint uppercase">{group}</p>
              <ul className="divide-y divide-vault-border rounded-xl border border-vault-border bg-vault-bg/40">
                {SHORTCUTS.filter((s) => s.group === group).map((s) => (
                  <li key={s.hotkey} className="flex items-center justify-between gap-4 px-3 py-2.5">
                    <span className="text-sm text-vault-muted">{s.description}</span>
                    <span className="flex shrink-0 gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-vault-border bg-vault-raised px-2 py-0.5 font-mono text-xs text-vault-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
