import { SearchBar } from "./SearchBar";
import { FilterDropdown, type FilterOption } from "./FilterDropdown";
import { SortDropdown } from "./SortDropdown";
import { DateRangePicker } from "./DateRangePicker";
import { ActiveFilters, type ActiveFilter } from "./ActiveFilters";

export type FilterBarField = {
  key: string;
  label: string;
  options: FilterOption[];
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  fields = [],
  values = {},
  onFieldChange,
  sortValue,
  sortOptions,
  onSortChange,
  dateRange,
  onDateRangeChange,
  activeFilters = [],
  onClearFilter,
  onClearAll,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  fields?: FilterBarField[];
  values?: Record<string, string>;
  onFieldChange?: (key: string, value: string) => void;
  sortValue?: string;
  sortOptions?: FilterOption[];
  onSortChange?: (v: string) => void;
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (key: "start" | "end", value: string) => void;
  activeFilters?: ActiveFilter[];
  onClearFilter?: (id: string) => void;
  onClearAll?: () => void;
}) {
  return (
    <div className="vault-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-3">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="min-w-[200px] flex-1"
        />
        {fields.map((field) => (
          <FilterDropdown
            key={field.key}
            label={field.label}
            options={field.options}
            value={values[field.key] ?? field.options[0]?.value ?? ""}
            onChange={(v) => onFieldChange?.(field.key, v)}
            className="w-40"
          />
        ))}
        {sortOptions && sortValue !== undefined && onSortChange && (
          <SortDropdown options={sortOptions} value={sortValue} onChange={onSortChange} />
        )}
      </div>

      {dateRange && onDateRangeChange && (
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onStartChange={(v) => onDateRangeChange("start", v)}
          onEndChange={(v) => onDateRangeChange("end", v)}
          className="max-w-md"
        />
      )}

      {activeFilters.length > 0 && (
        <div className="border-t border-vault-border pt-3">
          <ActiveFilters filters={activeFilters} onClear={(id) => onClearFilter?.(id)} onClearAll={onClearAll} />
        </div>
      )}
    </div>
  );
}
