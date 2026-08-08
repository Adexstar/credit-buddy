import { AlertTriangle, ArrowRight, Lock, Sparkles, Zap } from "lucide-react";
import { appIdFromName, getConversionRate, getRateSource } from "@/lib/conversions";
import type { ConversionController } from "@/hooks/useConversion";

function expiryStatus(softExpiry: string) {
  const days = (new Date(softExpiry).getTime() - Date.now()) / 86400_000;
  if (days <= 3) return { label: "Expiring soon", className: "text-vault-danger", icon: <AlertTriangle size={12} /> };
  if (days <= 7) return { label: "Expires in a week", className: "text-vault-amber", icon: <AlertTriangle size={12} /> };
  return { label: "Active", className: "text-vault-teal", icon: <Zap size={12} /> };
}

export function Step1Selection({ c }: { c: ConversionController }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-medium tracking-wide text-vault-muted uppercase">Source bucket</h3>
        <div role="radiogroup" aria-label="Source bucket" className="mt-3 space-y-2">
          {c.eligible.map((bucket) => {
            const status = expiryStatus(bucket.softExpiry);
            const selected = c.bucketId === bucket.id;
            return (
              <button
                key={bucket.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => c.setBucketId(bucket.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  selected
                    ? "border-vault-teal/60 bg-vault-teal/10"
                    : "border-vault-border bg-vault-raised hover:border-vault-teal/30"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-vault-teal" : "border-vault-faint"
                  }`}
                >
                  {selected && <span className="size-2 rounded-full bg-vault-teal" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-semibold text-vault-foreground">
                      {bucket.appName} — {bucket.sourceType}
                    </span>
                    {bucket.peakRestricted && (
                      <span className="rounded-full border border-vault-teal/30 px-2 py-0.5 text-[10px] text-vault-teal">
                        Off-peak
                      </span>
                    )}
                  </span>
                  <span className="vault-mono mt-1.5 flex flex-wrap gap-x-3 text-xs text-vault-muted">
                    <span>
                      {bucket.remaining.toFixed(2)} / {bucket.original.toFixed(2)} credits
                    </span>
                    <span>expires {new Date(bucket.softExpiry).toLocaleDateString()}</span>
                  </span>
                  <span className={`mt-1 flex items-center gap-1.5 text-xs ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </span>
              </button>
            );
          })}

          {c.eligible.length === 0 && (
            <p className="rounded-xl border border-vault-border bg-vault-raised p-4 text-sm text-vault-muted">
              All credit buckets are empty or frozen.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-medium tracking-wide text-vault-muted uppercase">Target app</h3>
        {c.targets.length === 0 ? (
          <p className="mt-3 rounded-xl border border-vault-border bg-vault-raised p-4 text-sm text-vault-muted">
            Connect at least one other provider to convert credits.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {c.targets.map((name) => {
              const rate = getConversionRate(
                c.bucket ? appIdFromName(c.bucket.appName) : undefined,
                appIdFromName(name),
              );
              const selected = c.targetApp === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => c.setTargetApp(name)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-vault-teal/60 bg-vault-teal/10"
                      : "border-vault-border bg-vault-raised hover:border-vault-teal/30"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-vault-panel font-display text-xs font-semibold text-vault-teal">
                      {name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-display text-sm font-semibold text-vault-foreground">{name}</span>
                  </span>
                  <span className="vault-mono mt-2 block text-xs text-vault-muted">1:{rate.toFixed(2)}</span>
                  {rate >= 0.8 && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-vault-amber/30 bg-vault-amber/10 px-2 py-0.5 text-[10px] text-vault-amber">
                      <Sparkles size={10} /> Popular
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {c.bucket && c.targetApp && (
        <div className="rounded-xl border border-vault-border bg-vault-bg p-4 text-sm">
          <p className="flex flex-wrap items-center gap-2 text-vault-foreground">
            <span className="vault-mono">1 {c.bucket.appName}</span>
            <ArrowRight size={14} className="text-vault-teal" />
            <span className="vault-mono text-vault-teal">
              {c.rate.toFixed(4)} {c.targetApp}
            </span>
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-xs text-vault-faint">
            <Lock size={12} />
            {getRateSource(appIdFromName(c.bucket.appName), appIdFromName(c.targetApp))} · updated{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
