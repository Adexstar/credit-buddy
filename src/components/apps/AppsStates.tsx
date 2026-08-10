import { Plug, RefreshCw, Trash2, Download } from "lucide-react";

export function AppsEmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="py-14 text-center">
      <div className="mb-4 text-5xl">🔌</div>
      <h3 className="font-display text-lg font-semibold text-vault-foreground">No apps connected</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-vault-muted">
        Connect your first AI provider to start managing credits across platforms.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center gap-2 rounded-full bg-vault-teal px-5 py-2.5 text-sm font-medium text-vault-bg transition hover:opacity-90"
        >
          <Plug size={15} /> Connect App
        </button>
        <a
          href="https://docs.lovable.dev"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-vault-border px-5 py-2.5 text-sm text-vault-muted transition hover:text-vault-foreground"
        >
          View documentation
        </a>
      </div>
    </div>
  );
}

export function AppsLoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="vault-raised animate-pulse space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-vault-raised" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded bg-vault-raised" />
              <div className="h-2 w-1/3 rounded bg-vault-raised" />
            </div>
          </div>
          <div className="h-6 w-1/2 rounded bg-vault-raised" />
          <div className="h-2 w-full rounded bg-vault-raised" />
        </div>
      ))}
    </div>
  );
}

export function AppsBulkActions({
  count,
  onClear,
  onSync,
  onDisconnect,
  onExport,
}: {
  count: number;
  onClear: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onExport: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-vault-border bg-vault-panel/95 p-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-vault-foreground">
            {count} app{count === 1 ? "" : "s"} selected
          </span>
          <button type="button" onClick={onClear} className="text-xs text-vault-faint transition hover:text-vault-foreground">
            Clear selection
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSync}
            className="inline-flex items-center gap-1.5 rounded-xl bg-vault-teal px-3.5 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
          >
            <RefreshCw size={14} /> Sync selected
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            className="inline-flex items-center gap-1.5 rounded-xl bg-vault-danger px-3.5 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
          >
            <Trash2 size={14} /> Disconnect selected
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-vault-border px-3.5 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
          >
            <Download size={14} /> Export data
          </button>
        </div>
      </div>
    </div>
  );
}
