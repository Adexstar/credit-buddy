import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, FileText, Repeat, Undo2, BarChart3 } from "lucide-react";
import { creditsApi, type CreditTransaction } from "@/lib/credits";

const PAGE_SIZE = 8;

const ICONS = {
  usage: BarChart3,
  addition: ArrowUpRight,
  conversion: Repeat,
  reconciliation: FileText,
  refund: Undo2,
} as const;

const RANGES: Record<string, number | null> = {
  "Last 30 days": 30,
  "Last 90 days": 90,
  "This month": -1,
  "All time": null,
};

export function CreditsHistory({ bucketId, compact = false }: { bucketId?: string; compact?: boolean }) {
  const [rows, setRows] = useState<CreditTransaction[]>([]);
  const [type, setType] = useState("all");
  const [range, setRange] = useState("Last 30 days");
  const [page, setPage] = useState(0);

  useEffect(() => {
    void creditsApi.getHistory(bucketId).then(setRows);
  }, [bucketId]);

  const filtered = useMemo(() => {
    const limit = RANGES[range];
    return rows.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      const ts = new Date(r.timestamp);
      if (limit === -1) {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return ts >= start;
      }
      if (typeof limit === "number") return ts.getTime() >= Date.now() - limit * 86_400_000;
      return true;
    });
  }, [rows, type, range]);

  const pageRows = compact ? filtered.slice(0, 4) : filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const selectClass =
    "h-8 rounded-lg border border-vault-border bg-vault-raised px-2 text-xs text-vault-foreground outline-none focus:border-vault-teal/60";

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select className={selectClass} value={type} onChange={(e) => { setType(e.target.value); setPage(0); }} aria-label="Filter by type">
            <option value="all">All types</option>
            <option value="usage">Usage</option>
            <option value="addition">Addition</option>
            <option value="conversion">Conversion</option>
            <option value="reconciliation">Reconciliation</option>
            <option value="refund">Refund</option>
          </select>
          <select className={selectClass} value={range} onChange={(e) => { setRange(e.target.value); setPage(0); }} aria-label="Filter by date range">
            {Object.keys(RANGES).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {pageRows.length === 0 ? (
        <p className="py-6 text-center text-sm text-vault-faint">No transactions in this window.</p>
      ) : (
        <ul className="space-y-2">
          {pageRows.map((entry) => {
            const Icon = ICONS[entry.type] ?? BarChart3;
            const positive = entry.amount > 0;
            return (
              <li key={entry.id} className="vault-raised flex items-center justify-between gap-3 rounded-xl p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                      positive
                        ? "border-vault-green/25 bg-vault-green/10 text-vault-green"
                        : "border-vault-border bg-vault-panel text-vault-muted"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-vault-foreground">{entry.description}</p>
                    <p className="text-xs text-vault-faint">
                      {entry.appName} · {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`vault-mono text-sm ${positive ? "text-vault-green" : "text-vault-danger"}`}>
                  {positive ? "+" : ""}
                  {entry.amount.toFixed(2)}
                  {positive ? <ArrowUpRight className="ml-1 inline" size={12} /> : <ArrowDownRight className="ml-1 inline" size={12} />}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!compact && filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-vault-border pt-3">
          <span className="text-xs text-vault-faint">
            Showing {pageRows.length} of {filtered.length} transactions
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-vault-border px-3 py-1 text-xs text-vault-muted disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg bg-vault-teal px-3 py-1 text-xs font-medium text-vault-bg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
