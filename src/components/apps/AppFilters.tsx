import { Search, X } from "lucide-react";
import { forwardRef } from "react";
import { PROVIDERS } from "@/lib/mock-data";
import { APP_STATUS_META, type AppFilters, type AppUiStatus } from "@/lib/apps";
import { LayoutGrid, List } from "lucide-react";

const selectClass =
  "rounded-xl border border-vault-border bg-vault-bg px-3 py-2 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60";

export const AppFiltersBar = forwardRef<
  HTMLInputElement,
  {
    filters: AppFilters;
    setFilter: <K extends keyof AppFilters>(key: K, value: AppFilters[K]) => void;
    clearFilters: () => void;
    view: "grid" | "list";
    setView: (v: "grid" | "list") => void;
    resultCount: number;
  }
>(function AppFiltersBar({ filters, setFilter, clearFilters, view, setView, resultCount }, ref) {
  const active = filters.search !== "" || filters.status !== "all" || filters.provider !== "all";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-faint" />
        <input
          ref={ref}
          type="text"
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          placeholder="Search apps…"
          aria-label="Search apps"
          className="w-full rounded-xl border border-vault-border bg-vault-bg py-2 pl-9 pr-3 text-sm text-vault-foreground outline-none transition focus:border-vault-teal/60"
        />
      </div>

      <select
        value={filters.status}
        aria-label="Filter by status"
        onChange={(e) => setFilter("status", e.target.value as AppUiStatus | "all")}
        className={selectClass}
      >
        <option value="all">All status</option>
        {(Object.keys(APP_STATUS_META) as AppUiStatus[]).map((s) => (
          <option key={s} value={s}>
            {APP_STATUS_META[s].label}
          </option>
        ))}
      </select>

      <select
        value={filters.provider}
        aria-label="Filter by provider"
        onChange={(e) => setFilter("provider", e.target.value)}
        className={selectClass}
      >
        <option value="all">All providers</option>
        {PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {active && (
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 rounded-xl border border-vault-border px-3 py-2 text-xs text-vault-muted transition hover:text-vault-foreground"
        >
          <X size={13} />
          Clear filters
        </button>
      )}

      <span className="text-xs text-vault-faint">{resultCount} shown</span>

      <div className="ml-auto flex overflow-hidden rounded-xl border border-vault-border">
        {([
          ["grid", LayoutGrid],
          ["list", List],
        ] as const).map(([mode, Icon]) => (
          <button
            key={mode}
            type="button"
            aria-label={`${mode} view`}
            aria-pressed={view === mode}
            onClick={() => setView(mode)}
            className={`px-3 py-2 transition ${
              view === mode ? "bg-vault-teal/15 text-vault-teal" : "text-vault-faint hover:text-vault-foreground"
            }`}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
    </div>
  );
});
