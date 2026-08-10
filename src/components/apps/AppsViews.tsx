import { RefreshCw, Settings, Trash2 } from "lucide-react";
import { APP_STATUS_META, type ManagedApp } from "@/lib/apps";
import { relativeTime } from "@/lib/sync";
import { Spinner } from "@/components/dashboard/SyncProgressBar";

function StatusPill({ app, syncing }: { app: ManagedApp; syncing: boolean }) {
  const meta = APP_STATUS_META[syncing ? "syncing" : app.status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${meta.className}`}>
      <span className={`size-1.5 rounded-full ${meta.dot} ${syncing ? "animate-pulse" : ""}`} />
      {meta.label}
    </span>
  );
}

function ActionButtons({
  app,
  syncing,
  onSync,
  onSettings,
  onDisconnect,
}: {
  app: ManagedApp;
  syncing: boolean;
  onSync: () => void;
  onSettings: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={onSettings}
        title="Settings"
        aria-label={`Settings for ${app.displayName}`}
        className="rounded-lg p-2 text-vault-muted transition hover:bg-vault-raised hover:text-vault-foreground"
      >
        <Settings size={15} />
      </button>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        title="Sync now"
        aria-label={`Sync ${app.displayName}`}
        className="rounded-lg p-2 text-vault-muted transition hover:bg-vault-raised hover:text-vault-teal disabled:opacity-50"
      >
        {syncing ? <Spinner /> : <RefreshCw size={15} />}
      </button>
      <button
        type="button"
        onClick={onDisconnect}
        title="Disconnect"
        aria-label={`Disconnect ${app.displayName}`}
        className="rounded-lg p-2 text-vault-danger/80 transition hover:bg-vault-danger/10 hover:text-vault-danger"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export interface AppViewProps {
  apps: ManagedApp[];
  syncingApps: Record<string, boolean>;
  selected: string[];
  onToggleSelect: (id: string) => void;
  onSync: (app: ManagedApp) => void;
  onSettings: (app: ManagedApp) => void;
  onDisconnect: (app: ManagedApp) => void;
}

export function AppsGrid({ apps, syncingApps, selected, onToggleSelect, onSync, onSettings, onDisconnect }: AppViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {apps.map((app) => {
        const syncing = Boolean(syncingApps[app.id]);
        return (
          <article
            key={app.id}
            className={`vault-raised p-5 transition ${
              selected.includes(app.id) ? "border-vault-teal/50 ring-1 ring-vault-teal/30" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(app.id)}
                  onChange={() => onToggleSelect(app.id)}
                  aria-label={`Select ${app.displayName}`}
                  className="size-4 accent-[var(--color-vault-teal)]"
                />
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${app.color}1f` }}
                >
                  {app.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold text-vault-foreground">
                    {app.displayName}
                  </h3>
                  <p className="truncate text-xs text-vault-faint">{app.name}</p>
                </div>
              </div>
              <StatusPill app={app} syncing={syncing} />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="font-display text-2xl font-semibold text-vault-foreground">{app.credits.toFixed(2)}</p>
                <p className="text-xs text-vault-faint">credits · {app.bucketCount} buckets</p>
              </div>
              <ActionButtons
                app={app}
                syncing={syncing}
                onSync={() => onSync(app)}
                onSettings={() => onSettings(app)}
                onDisconnect={() => onDisconnect(app)}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-vault-border pt-3 text-xs text-vault-faint">
              <span>Last sync: {relativeTime(app.lastSync)}</span>
              <span>Connected {new Date(app.connectedAt).toLocaleDateString()}</span>
            </div>
            {app.policies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {app.policies.map((p) => (
                  <span key={p} className="rounded-full bg-vault-blue/10 px-2 py-0.5 text-xs text-vault-blue">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function AppsList({ apps, syncingApps, selected, onToggleSelect, onSync, onSettings, onDisconnect }: AppViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-vault-border text-left text-xs uppercase tracking-wide text-vault-faint">
            <th className="w-10 py-2" />
            <th className="py-2">App</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Credits</th>
            <th className="py-2">Last sync</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => {
            const syncing = Boolean(syncingApps[app.id]);
            return (
              <tr key={app.id} className="border-b border-vault-border/60 last:border-0">
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(app.id)}
                    onChange={() => onToggleSelect(app.id)}
                    aria-label={`Select ${app.displayName}`}
                    className="size-4 accent-[var(--color-vault-teal)]"
                  />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-8 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: `${app.color}1f` }}
                    >
                      {app.emoji}
                    </span>
                    <div>
                      <p className="font-medium text-vault-foreground">{app.displayName}</p>
                      <p className="text-xs text-vault-faint">{app.bucketCount} buckets</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <StatusPill app={app} syncing={syncing} />
                </td>
                <td className="py-3 text-right font-mono text-vault-foreground">{app.credits.toFixed(2)}</td>
                <td className="py-3 text-vault-muted">{relativeTime(app.lastSync)}</td>
                <td className="py-3">
                  <div className="flex justify-end">
                    <ActionButtons
                      app={app}
                      syncing={syncing}
                      onSync={() => onSync(app)}
                      onSettings={() => onSettings(app)}
                      onDisconnect={() => onDisconnect(app)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
