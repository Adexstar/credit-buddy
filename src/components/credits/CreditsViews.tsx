import { Snowflake } from "lucide-react";
import {
  STATUS_LABEL,
  STATUS_TONE,
  bucketStatus,
  daysUntil,
  formatDate,
  progressPct,
  usedAmount,
  type CreditBucket,
} from "@/lib/credits";

export function StatusPill({ bucket }: { bucket: CreditBucket }) {
  const status = bucketStatus(bucket);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${STATUS_TONE[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function CreditsTable({
  rows,
  selected,
  onToggle,
  onSelectAll,
  onOpen,
}: {
  rows: CreditBucket[];
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onOpen: (bucket: CreditBucket) => void;
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-left text-[11px] tracking-[0.14em] text-vault-faint uppercase">
            <th className="w-10 pb-3">
              <input
                type="checkbox"
                aria-label="Select all buckets"
                checked={allSelected}
                onChange={onSelectAll}
                className="size-4 accent-vault-teal"
              />
            </th>
            <th className="pb-3">App</th>
            <th className="pb-3">Source</th>
            <th className="pb-3">Balance</th>
            <th className="pb-3">Used</th>
            <th className="pb-3">Expiry</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((bucket) => (
            <tr
              key={bucket.id}
              tabIndex={0}
              onClick={() => onOpen(bucket)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onOpen(bucket);
              }}
              className="cursor-pointer border-t border-vault-border/70 outline-none transition hover:bg-vault-raised/60 focus:bg-vault-raised/60"
            >
              <td className="py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  aria-label={`Select ${bucket.appName} ${bucket.sourceType} bucket`}
                  checked={selected.includes(bucket.id)}
                  onChange={() => onToggle(bucket.id)}
                  className="size-4 accent-vault-teal"
                />
              </td>
              <td className="py-3 font-medium text-vault-foreground">
                <span className="flex items-center gap-2">
                  {bucket.appName}
                  {bucket.frozen && <Snowflake size={13} className="text-vault-blue" />}
                </span>
              </td>
              <td className="py-3 text-vault-muted">{bucket.sourceType}</td>
              <td className="vault-mono py-3 text-vault-foreground">
                {bucket.remaining.toFixed(2)}
                <span className="text-vault-faint">/{bucket.original.toFixed(0)}</span>
                <span className="mt-1.5 block h-1 w-24 overflow-hidden rounded-full bg-vault-border">
                  <span className="block h-full rounded-full bg-vault-teal" style={{ width: `${progressPct(bucket)}%` }} />
                </span>
              </td>
              <td className="vault-mono py-3 text-vault-muted">{usedAmount(bucket).toFixed(2)}</td>
              <td className="py-3 text-vault-muted">
                {formatDate(bucket.softExpiry)}
                <span className="block text-xs text-vault-faint">
                  {daysUntil(bucket.softExpiry) < 0 ? "expired" : `${daysUntil(bucket.softExpiry)}d left`}
                </span>
              </td>
              <td className="py-3">
                <StatusPill bucket={bucket} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CreditsGrid({
  rows,
  selected,
  onToggle,
  onOpen,
}: {
  rows: CreditBucket[];
  selected: string[];
  onToggle: (id: string) => void;
  onOpen: (bucket: CreditBucket) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((bucket) => (
        <div key={bucket.id} className="vault-raised rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-vault-foreground">{bucket.appName}</p>
              <p className="text-xs text-vault-faint">{bucket.sourceType}</p>
            </div>
            <input
              type="checkbox"
              aria-label={`Select ${bucket.appName} ${bucket.sourceType} bucket`}
              checked={selected.includes(bucket.id)}
              onChange={() => onToggle(bucket.id)}
              className="size-4 accent-vault-teal"
            />
          </div>
          <p className="vault-mono mt-3 text-lg font-semibold text-vault-foreground">
            {bucket.remaining.toFixed(2)}
            <span className="text-sm text-vault-faint">/{bucket.original.toFixed(0)}</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-vault-border">
            <div className="h-full rounded-full bg-vault-teal" style={{ width: `${progressPct(bucket)}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <StatusPill bucket={bucket} />
            <span className="text-xs text-vault-faint">Exp {formatDate(bucket.softExpiry)}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpen(bucket)}
            className="mt-4 w-full rounded-xl border border-vault-border bg-vault-panel py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
          >
            Details
          </button>
        </div>
      ))}
    </div>
  );
}
