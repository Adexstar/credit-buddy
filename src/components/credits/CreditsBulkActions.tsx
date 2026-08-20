import { Download, Snowflake, Trash2, X, CheckCheck } from "lucide-react";
import type { CreditBucket } from "@/lib/credits";

const btn =
  "inline-flex items-center gap-1.5 rounded-lg border border-vault-border bg-vault-panel px-3 py-1.5 text-xs text-vault-muted transition hover:text-vault-foreground disabled:opacity-40";

export function CreditsBulkActions({
  selected,
  onFreeze,
  onDelete,
  onExport,
  onMarkUsed,
  onClear,
  busy,
}: {
  selected: CreditBucket[];
  onFreeze: () => void;
  onDelete: () => void;
  onExport: () => void;
  onMarkUsed: () => void;
  onClear: () => void;
  busy: boolean;
}) {
  if (selected.length === 0) return null;
  const allFrozen = selected.every((b) => b.frozen);

  return (
    <div className="sticky bottom-4 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-vault-teal/30 bg-vault-panel/95 p-3 shadow-lg backdrop-blur">
      <span className="mr-1 text-sm font-medium text-vault-teal">
        {selected.length} bucket{selected.length === 1 ? "" : "s"} selected
      </span>
      <button type="button" className={btn} onClick={onFreeze} disabled={busy}>
        <Snowflake size={13} /> {allFrozen ? "Unfreeze" : "Freeze"} selected
      </button>
      <button type="button" className={btn} onClick={onMarkUsed} disabled={busy}>
        <CheckCheck size={13} /> Mark as used
      </button>
      <button type="button" className={btn} onClick={onExport} disabled={busy}>
        <Download size={13} /> Export selected
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-vault-danger/30 bg-vault-danger/10 px-3 py-1.5 text-xs text-vault-danger transition hover:bg-vault-danger/20 disabled:opacity-40"
      >
        <Trash2 size={13} /> Delete selected
      </button>
      <button type="button" onClick={onClear} className="ml-auto inline-flex items-center gap-1 text-xs text-vault-faint hover:text-vault-foreground">
        <X size={13} /> Clear selection
      </button>
    </div>
  );
}
