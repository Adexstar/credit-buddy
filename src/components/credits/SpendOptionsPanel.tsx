import { useEffect } from "react";
import { ArrowUpRight, Info, X } from "lucide-react";
import { daysUntil, formatDate, type CreditBucket } from "@/lib/credits";
import { PROVIDERS } from "@/lib/mock-data";

function providerFor(appName: string) {
  const key = appName.toLowerCase();
  return PROVIDERS.find((p) => p.name.toLowerCase().startsWith(key) || key.startsWith(p.id));
}

function suggestions(bucket: CreditBucket, days: number): string[] {
  const list: string[] = [];
  if (days <= 0) {
    list.push("These credits have passed their soft expiry — check the provider console to confirm the current balance.");
  } else if (days <= 7) {
    list.push(`Spend inside ${bucket.appName} within ${days} day${days === 1 ? "" : "s"}: batch queued jobs, run evaluations, or pre-generate assets you already planned.`);
  } else {
    list.push(`Plan recurring ${bucket.appName} workloads so this balance is used before ${formatDate(bucket.softExpiry)}.`);
  }
  if (bucket.peakRestricted) {
    list.push("This balance is off-peak only — schedule long batch jobs overnight to use it.");
  }
  list.push(`Shift new ${bucket.appName}-compatible work here first, and keep other providers for what only they can do.`);
  list.push("Lower your next top-up or subscription tier at this provider so you stop accumulating unused balance.");
  return list;
}

export function SpendOptionsPanel({ bucket, onClose }: { bucket: CreditBucket; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const days = daysUntil(bucket.softExpiry);
  const provider = providerFor(bucket.appName);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close spend options" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Spend options"
        className="relative z-10 h-full w-full max-w-md overflow-y-auto border-l border-vault-border bg-vault-panel p-5 shadow-lg sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-vault-foreground">Spend options</h2>
            <p className="mt-1 text-xs text-vault-faint">
              {bucket.appName} — {bucket.sourceType} · {bucket.remaining.toFixed(2)} credits left
            </p>
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

        <p className="mt-5 flex items-start gap-2 rounded-xl border border-vault-border bg-vault-raised p-4 text-xs text-vault-muted">
          <Info size={14} className="mt-0.5 shrink-0 text-vault-teal" />
          Provider credits are non-transferable. They can only be spent inside {bucket.appName}, so the only way to
          recover value is to use them there before they expire — or to buy less next cycle.
        </p>

        <section className="mt-5">
          <h3 className="text-[11px] font-medium tracking-[0.14em] text-vault-faint uppercase">Ways to use this balance</h3>
          <ul className="mt-3 space-y-2.5">
            {suggestions(bucket, days).map((s) => (
              <li key={s} className="rounded-xl border border-vault-border bg-vault-bg p-3 text-sm text-vault-muted">
                {s}
              </li>
            ))}
          </ul>
        </section>

        {provider && (
          <a
            href={provider.docs}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-vault-teal px-3 py-2 text-xs font-medium text-vault-bg transition hover:bg-vault-teal-deep"
          >
            Open {provider.name} console <ArrowUpRight size={13} />
          </a>
        )}
      </aside>
    </div>
  );
}
