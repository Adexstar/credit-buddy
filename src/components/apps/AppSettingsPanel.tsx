import { useEffect, useState } from "react";
import { AlertTriangle, Eye, EyeOff, KeyRound, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/policies/ui";
import { ConnectionHistory } from "./ConnectionHistory";
import {
  APP_STATUS_META,
  SYNC_FREQUENCIES,
  type AppMeta,
  type ManagedApp,
  type SyncFrequency,
} from "@/lib/apps";
import { relativeTime } from "@/lib/sync";
import { POLICY_TYPES } from "@/lib/policies";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-vault-faint">{title}</h3>
      <div className="vault-raised space-y-4 p-4">{children}</div>
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-sm text-vault-foreground"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-vault-teal" : "bg-vault-border"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-vault-bg transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

export function AppSettingsPanel({
  app,
  busy,
  onClose,
  onSave,
  onRotateKey,
  onDisconnect,
}: {
  app: ManagedApp;
  busy: boolean;
  onClose: () => void;
  onSave: (patch: Partial<AppMeta>) => Promise<void> | void;
  onRotateKey: () => void;
  onDisconnect: () => void;
}) {
  const [displayName, setDisplayName] = useState(app.displayName);
  const [description, setDescription] = useState(app.description);
  const [color, setColor] = useState(app.color);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>(app.syncFrequency);
  const [autoSync, setAutoSync] = useState(app.autoSync);
  const [peakRestrictions, setPeakRestrictions] = useState(app.peakRestrictions);
  const [offPeakRouting, setOffPeakRouting] = useState(app.offPeakRouting);
  const [policies, setPolicies] = useState<string[]>(app.policies);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const statusMeta = APP_STATUS_META[app.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close settings" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`App settings for ${app.displayName}`}
        className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-vault-border bg-vault-panel p-5 sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${color}1f` }}>
              {app.emoji}
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-vault-foreground">App Settings — {app.name}</h2>
              <p className="text-xs text-vault-faint">
                Connected {new Date(app.connectedAt).toLocaleDateString()} · Last sync {relativeTime(app.lastSync)}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            <X size={18} />
          </button>
        </header>

        <div className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${statusMeta.className}`}>
          <span className={`size-1.5 rounded-full ${statusMeta.dot}`} />
          {statusMeta.label} · {app.credits.toFixed(2)} credits
        </div>

        <Section title="API key management">
          <div className="flex items-center justify-between rounded-xl bg-vault-bg/60 p-3">
            <code className="font-mono text-sm text-vault-muted">
              {showKey ? `sk-live-${app.keyTail}` : `sk-•••••••${app.keyTail.slice(-4)}`}
            </code>
            <div className="flex items-center gap-2">
              <span className={app.keyValid ? "text-xs text-vault-teal" : "text-xs text-vault-danger"}>
                {app.keyValid ? "Valid" : "Invalid"}
              </span>
              <button
                type="button"
                aria-label={showKey ? "Hide key" : "Reveal key"}
                onClick={() => setShowKey((v) => !v)}
                className="rounded-lg p-1.5 text-vault-faint transition hover:text-vault-foreground"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-vault-amber/30 bg-vault-amber/10 p-3 text-xs text-vault-amber">
            <p className="flex items-center gap-1.5 font-medium">
              <AlertTriangle size={13} /> Rotating your API key will:
            </p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
              <li>Deactivate the current key immediately</li>
              <li>Require you to update your applications</li>
              <li>Preserve all existing credits and buckets</li>
            </ul>
          </div>
          <GhostButton onClick={onRotateKey}>
            <KeyRound size={14} /> Rotate key
          </GhostButton>
        </Section>

        <Section title="App settings">
          <Field label="Display name">
            <input className={inputClass} value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Field label="Description">
            <input className={inputClass} value={description} maxLength={120} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Color theme">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                aria-label="Color theme"
                onChange={(e) => setColor(e.target.value)}
                className="size-9 cursor-pointer rounded-lg border border-vault-border bg-transparent"
              />
              <span className="font-mono text-xs text-vault-muted">{color}</span>
            </div>
          </Field>
          <Field label="Sync frequency">
            <select
              className={inputClass}
              value={syncFrequency}
              onChange={(e) => setSyncFrequency(e.target.value as SyncFrequency)}
            >
              {SYNC_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <Toggle label="Auto-sync" checked={autoSync} onChange={setAutoSync} />
          <Toggle label="Peak restrictions" checked={peakRestrictions} onChange={setPeakRestrictions} />
          <Toggle label="Off-peak routing" checked={offPeakRouting} onChange={setOffPeakRouting} />
        </Section>

        <Section title="App-specific policies">
          {POLICY_TYPES.map((p) => {
            const on = policies.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPolicies((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                className="flex w-full items-start gap-2.5 text-left"
              >
                <span className={`mt-0.5 text-sm ${on ? "text-vault-teal" : "text-vault-faint"}`}>{on ? "✓" : "○"}</span>
                <span>
                  <span className="block text-sm text-vault-foreground">{p.label}</span>
                  <span className="block text-xs text-vault-faint">{p.blurb}</span>
                </span>
              </button>
            );
          })}
        </Section>

        <Section title="Connection history">
          <ConnectionHistory app={app} />
        </Section>

        <Section title="Danger zone">
          <div className="rounded-xl border border-vault-danger/30 bg-vault-danger/10 p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-vault-danger">
              <AlertTriangle size={14} /> Disconnect app
            </p>
            <p className="mt-1 text-xs text-vault-muted">
              This removes all credits and settings for this app. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={onDisconnect}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-vault-danger px-3 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
            >
              <Trash2 size={14} /> Disconnect {app.name}
            </button>
          </div>
        </Section>

        <footer className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t border-vault-border bg-vault-panel py-4">
          <GhostButton onClick={onClose}>Close</GhostButton>
          <PrimaryButton
            disabled={busy || displayName.trim().length === 0}
            onClick={() => {
              if (!displayName.trim()) {
                toast.error("Display name cannot be empty");
                return;
              }
              void onSave({
                displayName: displayName.trim(),
                description: description.trim(),
                color,
                syncFrequency,
                autoSync,
                peakRestrictions,
                offPeakRouting,
                policies,
              });
            }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            Save changes
          </PrimaryButton>
        </footer>
      </aside>
    </div>
  );
}
