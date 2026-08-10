import { Link } from "@tanstack/react-router";
import { ChevronDown, Download, Plug, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

export function AppsHeaderStats({
  stats,
}: {
  stats: {
    connected: number;
    pending: number;
    disconnected: number;
    validKeys: number;
    expiredKeys: number;
    errors: number;
    recent: number;
    credits: number;
  };
}) {
  const tiles = [
    { label: "Connected apps", value: stats.connected },
    { label: "Valid keys", value: stats.validKeys },
    { label: "Expired keys", value: stats.expiredKeys },
    { label: "Sync errors", value: stats.errors },
    { label: "New (30 days)", value: stats.recent },
    { label: "Credits managed", value: stats.credits.toFixed(2) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className="vault-raised p-4">
          <p className="text-xs text-vault-faint">{t.label}</p>
          <p className="mt-1 font-display text-xl font-semibold text-vault-foreground">{t.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-vault-faint">
      <Link to="/" className="transition hover:text-vault-teal">
        Dashboard
      </Link>
      <span className="mx-1.5">/</span>
      <span className="text-vault-muted">App Management</span>
    </nav>
  );
}

export function StatusSummary({
  connected,
  pending,
  disconnected,
}: {
  connected: number;
  pending: number;
  disconnected: number;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-vault-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-vault-teal" />
        {connected} Connected
      </span>
      <span className="text-vault-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-vault-purple" />
        {pending} Pending
      </span>
      <span className="text-vault-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-vault-faint" />
        {disconnected} Disconnected
      </span>
    </div>
  );
}

export function AppsHeaderActions({
  onConnect,
  onSyncAll,
  onDisconnectSelected,
  onExport,
  selectedCount,
}: {
  onConnect: () => void;
  onSyncAll: () => void;
  onDisconnectSelected: () => void;
  onExport: () => void;
  selectedCount: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={onConnect}
        className="flex items-center gap-2 rounded-full bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
      >
        <Plus size={15} />
        Connect New App
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full border border-vault-border bg-vault-panel px-4 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
        >
          <Plug size={15} />
          Bulk Actions
          <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
        </button>
        {open && (
          <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-vault-border bg-vault-panel p-1 shadow-lg">
            {[
              { label: `Sync selected (${selectedCount})`, icon: RefreshCw, run: onSyncAll },
              { label: `Disconnect selected (${selectedCount})`, icon: Trash2, run: onDisconnectSelected, danger: true },
              { label: "Export data (CSV)", icon: Download, run: onExport },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.run();
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-vault-raised ${
                  item.danger ? "text-vault-danger" : "text-vault-muted"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
