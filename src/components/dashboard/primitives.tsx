import type { ReactNode } from "react";
import { ArrowRight, Check, History, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { SyncProgressBar, Spinner } from "./SyncProgressBar";
import { relativeTime, type SyncUiStatus } from "@/lib/sync";
import type { Activity, ConnectedApp, CreditBucket } from "@/lib/api";


export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`vault-panel p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-semibold text-vault-foreground">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  tone = "teal",
}: {
  label: string;
  value: string;
  subtext: string;
  icon: ReactNode;
  trend?: number;
  tone?: "teal" | "amber" | "danger";
}) {
  const toneClass = {
    teal: "border-vault-teal/25 bg-vault-teal/10 text-vault-teal",
    amber: "border-vault-amber/25 bg-vault-amber/10 text-vault-amber",
    danger: "border-vault-danger/25 bg-vault-danger/10 text-vault-danger",
  }[tone];

  return (
    <div className="vault-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.14em] text-vault-faint uppercase">{label}</p>
          <p className="vault-mono mt-2 text-2xl font-semibold text-vault-foreground">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-vault-muted">{subtext}</p>
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${toneClass}`}>{icon}</div>
      </div>
      {typeof trend === "number" && (
        <p
          className={`mt-3 flex items-center gap-1.5 text-xs ${
            trend >= 0 ? "text-vault-teal" : "text-vault-danger"
          }`}
        >
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  );
}

export function AppRow({
  app,
  isSyncing = false,
  onSync,
  onHistory,
  errorMessage,
}: {
  app: ConnectedApp;
  isSyncing?: boolean;
  onSync?: () => void;
  onHistory?: () => void;
  errorMessage?: string;
}) {
  const status: SyncUiStatus = isSyncing ? "syncing" : app.syncStatus;
  return (
    <div
      tabIndex={onSync ? 0 : -1}
      onKeyDown={(e) => {
        if (!onSync) return;
        if (e.key.toLowerCase() === "r" && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          onSync();
        }
      }}
      className={`vault-raised p-4 outline-none transition focus-visible:border-vault-teal/50 ${
        isSyncing ? "animate-pulse border-vault-blue/40" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-vault-teal/10 font-display text-sm font-semibold text-vault-teal">
          {app.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold text-vault-foreground">{app.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <SyncStatusBadge status={status} />
            <span className="vault-mono text-vault-muted">{app.credits.toFixed(2)} credits</span>
            {app.lastSync && (
              <span className="vault-mono text-vault-faint">· synced {relativeTime(app.lastSync)}</span>
            )}
            {onHistory && (
              <button
                type="button"
                onClick={onHistory}
                className="flex items-center gap-1 text-vault-teal transition hover:opacity-80"
              >
                <History size={12} />
                History
              </button>
            )}
          </div>
        </div>
        {onSync && (
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            aria-label={`Sync ${app.name} credits`}
            title={isSyncing ? "Syncing…" : "Sync now"}
            className="shrink-0 rounded-lg border border-vault-border bg-vault-panel p-2 text-vault-muted transition hover:border-vault-teal/40 hover:text-vault-teal disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSyncing ? <Spinner /> : <RefreshCw size={15} />}
          </button>
        )}
      </div>
      {isSyncing && <SyncProgressBar />}
      {!isSyncing && errorMessage && (
        <p className="mt-2 text-xs text-vault-danger">{errorMessage} — click sync to retry.</p>
      )}
      {!isSyncing && app.lastSync && (
        <p className="vault-mono mt-2 text-xs text-vault-faint">
          Last sync: {new Date(app.lastSync).toLocaleString()}
        </p>
      )}
    </div>
  );
}


function expiryTone(softExpiry: string) {
  const days = (new Date(softExpiry).getTime() - Date.now()) / 86400_000;
  if (days <= 3) return { label: "Expiring soon", bar: "bg-vault-danger", text: "text-vault-danger" };
  if (days <= 7) return { label: "Expires in a week", bar: "bg-vault-amber", text: "text-vault-amber" };
  return { label: "Active", bar: "bg-vault-teal", text: "text-vault-teal" };
}

export function BucketCard({ bucket, onConvert }: { bucket: CreditBucket; onConvert?: () => void }) {
  const tone = expiryTone(bucket.softExpiry);
  const pct = Math.max(2, Math.min(100, (bucket.remaining / bucket.original) * 100));

  return (
    <div className="vault-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-vault-foreground">{bucket.sourceType}</h3>
            <span className="rounded-full bg-vault-panel px-2 py-0.5 text-xs text-vault-muted">{bucket.appName}</span>
            {bucket.peakRestricted && (
              <span className="rounded-full border border-vault-teal/30 px-2 py-0.5 text-xs text-vault-teal">
                Off-peak only
              </span>
            )}
          </div>
          <p className="vault-mono mt-2 flex flex-wrap gap-x-3 text-xs text-vault-muted">
            <span>
              {bucket.remaining.toFixed(2)} / {bucket.original.toFixed(2)} credits
            </span>
            <span>expires {new Date(bucket.softExpiry).toLocaleDateString()}</span>
            <span className={tone.text}>{tone.label}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onConvert}
          className="shrink-0 rounded-lg border border-vault-border bg-vault-panel px-3 py-1.5 text-xs text-vault-muted transition hover:border-vault-teal/40 hover:text-vault-teal"
        >
          Convert
        </button>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-vault-panel">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const kindLabels: Record<Activity["kind"], string> = {
  usage: "USA",
  conversion: "CON",
  sync: "SYN",
  expiry: "EXP",
  topup: "ADD",
};

export function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <ul className="space-y-5">
      {activities.map((item) => (
        <li key={item.id} className="flex gap-3">
          <span className="vault-mono mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-vault-raised text-[10px] text-vault-teal">
            {kindLabels[item.kind]}
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-snug text-vault-foreground">{item.message}</p>
            <p className="vault-mono mt-1 text-xs text-vault-faint">
              {item.appName} · {new Date(item.timestamp).toLocaleString()}
            </p>
            {typeof item.amount === "number" && (
              <p
                className={`vault-mono mt-1 text-xs ${
                  item.amount >= 0 ? "text-vault-teal" : "text-vault-danger"
                }`}
              >
                {item.amount >= 0 ? "+" : ""}
                {item.amount.toFixed(2)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Milestones({
  steps,
}: {
  steps: { label: string; hint: string; done: boolean; onClick?: () => void }[];
}) {
  const complete = steps.filter((s) => s.done).length;
  return (
    <Panel
      title="Setup progress"
      action={
        <span className="vault-mono text-xs text-vault-faint">
          {complete}/{steps.length} complete
        </span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <button
            key={step.label}
            type="button"
            onClick={step.onClick}
            className={`vault-raised flex flex-col items-start gap-1 p-4 text-left transition ${
              step.done ? "border-vault-teal/30" : "hover:border-vault-teal/30"
            }`}
          >
            <span className="flex items-center gap-2">
              {step.done ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-vault-teal/15 text-vault-teal">
                  <Check size={12} />
                </span>
              ) : (
                <span className="vault-mono flex size-5 items-center justify-center rounded-full bg-vault-panel text-[10px] text-vault-faint">
                  {i + 1}
                </span>
              )}
              <span className="font-display text-sm font-semibold text-vault-foreground">{step.label}</span>
            </span>
            <span className="text-xs text-vault-muted">{step.hint}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export function ManageLink({ to, children }: { to: "/apps" | "/credits" | "/policies"; children: ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 text-sm text-vault-teal transition hover:opacity-80">
      {children}
      <ArrowRight size={14} />
    </Link>
  );
}
