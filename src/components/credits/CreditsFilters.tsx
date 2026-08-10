import { Search, X } from "lucide-react";
import { SORT_OPTIONS, SOURCE_TYPES, STATUS_LABEL, type CreditFilters } from "@/lib/credits";

const selectClass =
  "h-9 rounded-lg border border-vault-border bg-vault-raised px-3 text-xs text-vault-foreground outline-none focus:border-vault-teal/60";

export function CreditsFilters({
  filters,
  apps,
  searchRef,
  onChange,
  onReset,
}: {
  filters: CreditFilters;
  apps: string[];
  searchRef?: React.RefObject<HTMLInputElement | null>;
  onChange: <K extends keyof CreditFilters>(key: K, value: CreditFilters[K]) => void;
  onReset: () => void;
}) {
  const chips: Array<{ label: string; clear: () => void }> = [];
  if (filters.app !== "all") chips.push({ label: filters.app, clear: () => onChange("app", "all") });
  if (filters.status !== "all")
    chips.push({ label: STATUS_LABEL[filters.status as keyof typeof STATUS_LABEL] ?? filters.status, clear: () => onChange("status", "all") });
  if (filters.source !== "all") chips.push({ label: filters.source, clear: () => onChange("source", "all") });
  if (filters.expiry !== "all") chips.push({ label: filters.expiry, clear: () => onChange("expiry", "all") });
  if (filters.search) chips.push({ label: `"${filters.search}"`, clear: () => onChange("search", "") });

  return (
    <div className="vault-panel space-y-4 p-4 sm:p-5">
      <div className="relative">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-vault-faint" />
        <input
          ref={searchRef}
          value={filters.search}
          onChange={(e) => onChange("search", e.target.value)}
          placeholder="Search buckets by app, source or ID…"
          aria-label="Search buckets"
          className="h-10 w-full rounded-xl border border-vault-border bg-vault-bg pr-3 pl-9 text-sm text-vault-foreground outline-none focus:border-vault-teal/60"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className={selectClass} value={filters.app} onChange={(e) => onChange("app", e.target.value)} aria-label="Filter by app">
          <option value="all">All apps</option>
          {apps.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select className={selectClass} value={filters.status} onChange={(e) => onChange("status", e.target.value)} aria-label="Filter by status">
          <option value="all">All status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select className={selectClass} value={filters.source} onChange={(e) => onChange("source", e.target.value)} aria-label="Filter by source">
          <option value="all">All sources</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-vault-border bg-vault-raised p-1">
          {(["all", "expiring", "expired"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("expiry", value)}
              className={`rounded-md px-2.5 py-1 text-xs capitalize transition ${
                filters.expiry === value ? "bg-vault-teal/15 text-vault-teal" : "text-vault-muted hover:text-vault-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <select
          className={selectClass}
          value={filters.sort}
          onChange={(e) => onChange("sort", e.target.value as CreditFilters["sort"])}
          aria-label="Sort buckets"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-vault-border pt-3">
          <span className="text-[11px] tracking-[0.14em] text-vault-faint uppercase">Active filters</span>
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1 rounded-full border border-vault-teal/30 bg-vault-teal/10 px-2.5 py-1 text-xs text-vault-teal"
            >
              <X size={12} />
              {chip.label}
            </button>
          ))}
          <button type="button" onClick={onReset} className="text-xs text-vault-muted underline hover:text-vault-foreground">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
