import { X } from "lucide-react";

export type ActiveFilter = { id: string; label: string };

export function ActiveFilters({
  filters,
  onClear,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onClear: (id: string) => void;
  onClearAll?: () => void;
}) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      <span className="text-[11px] uppercase tracking-[0.14em] text-vault-faint">Active filters</span>
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onClear(filter.id)}
          className="inline-flex items-center gap-1 rounded-full border border-vault-teal/30 bg-vault-teal/10 px-2.5 py-1 text-xs text-vault-teal transition hover:bg-vault-teal/20"
        >
          {filter.label}
          <X size={12} />
        </button>
      ))}
      {filters.length > 1 && onClearAll && (
        <button type="button" onClick={onClearAll} className="text-xs text-vault-muted underline transition hover:text-vault-foreground">
          Clear all
        </button>
      )}
    </div>
  );
}
