import { useEffect, useState } from "react";
import { Repeat, Snowflake, Trash2, X } from "lucide-react";
import {
  STATUS_LABEL,
  bucketStatus,
  daysUntil,
  formatDate,
  progressPct,
  usedAmount,
  type CreditBucket,
} from "@/lib/credits";
import { StatusPill } from "./CreditsViews";
import { CreditsHistory } from "./CreditsHistory";

export function BucketDetailPanel({
  bucket,
  onClose,
  onConvert,
  onFreeze,
  onDelete,
}: {
  bucket: CreditBucket;
  onClose: () => void;
  onConvert: (bucket: CreditBucket) => void;
  onFreeze: (bucket: CreditBucket) => void;
  onDelete: (bucket: CreditBucket) => void;
}) {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const days = daysUntil(bucket.softExpiry);
  const used = usedAmount(bucket);
  const usedPct = bucket.original ? (used / bucket.original) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close details" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Bucket details"
        className="relative z-10 h-full w-full max-w-md overflow-y-auto border-l border-vault-border bg-vault-panel p-5 shadow-lg sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-vault-foreground">Bucket details</h2>
            <p className="vault-mono mt-1 text-xs text-vault-faint">{bucket.id}</p>
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

        <section className="vault-raised mt-5 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold text-vault-foreground">
                {bucket.appName} — {bucket.sourceType}
              </p>
              <p className="mt-1 text-xs text-vault-faint">Status: {STATUS_LABEL[bucketStatus(bucket)]}</p>
            </div>
            <StatusPill bucket={bucket} />
          </div>

          <p className="vault-mono mt-4 text-2xl font-semibold text-vault-foreground">
            {bucket.remaining.toFixed(2)}
            <span className="text-base text-vault-faint"> / {bucket.original.toFixed(2)} credits</span>
          </p>
          <p className="mt-1 text-xs text-vault-muted">
            Used {used.toFixed(2)} credits ({usedPct.toFixed(1)}%)
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-vault-border">
            <div className="h-full rounded-full bg-vault-teal" style={{ width: `${progressPct(bucket)}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-vault-faint">{progressPct(bucket).toFixed(1)}% remaining</p>

          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Expires", `${formatDate(bucket.softExpiry)} (${days < 0 ? "expired" : `${days} days`})`],
              ["Source", bucket.sourceType],
              ["Created", bucket.createdAt ? formatDate(bucket.createdAt) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <dt className="text-vault-muted">{label}</dt>
                <dd className="text-vault-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 border-t border-vault-border pt-3">
            <p className="text-[11px] tracking-[0.14em] text-vault-faint uppercase">Restrictions</p>
            <ul className="mt-2 space-y-1.5 text-sm text-vault-muted">
              <li>{bucket.peakRestricted ? "☑" : "☐"} Peak-restricted (off-peak only)</li>
              <li>{bucket.frozen ? "☑" : "☐"} Frozen</li>
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onConvert(bucket)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-vault-teal px-3 py-2 text-xs font-medium text-vault-bg transition hover:bg-vault-teal-deep"
            >
              <Repeat size={13} /> Convert
            </button>
            <button
              type="button"
              onClick={() => onFreeze(bucket)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-vault-border bg-vault-panel px-3 py-2 text-xs text-vault-muted transition hover:text-vault-foreground"
            >
              <Snowflake size={13} /> {bucket.frozen ? "Unfreeze" : "Freeze"}
            </button>
            <button
              type="button"
              onClick={() => onDelete(bucket)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-vault-danger/30 bg-vault-danger/10 px-3 py-2 text-xs text-vault-danger transition hover:bg-vault-danger/20"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-display text-sm font-semibold text-vault-foreground">Usage history</h3>
          <div className="mt-3">
            <CreditsHistory bucketId={bucket.id} compact={!showAll} />
          </div>
          {!showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 w-full rounded-xl border border-vault-border bg-vault-panel py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
            >
              View all history
            </button>
          )}
        </section>
      </aside>
    </div>
  );
}
