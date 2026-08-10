import { useCallback, useMemo, useState } from "react";
import type { ActiveFilter } from "@/components/common/ActiveFilters";

export type FilterState = {
  search: string;
  values: Record<string, string>;
  sort: string;
  dateRange: { start: string; end: string };
};

export type UseFiltersOptions = {
  initialValues?: Record<string, string>;
  initialSort?: string;
  labels?: Record<string, string>;
  neutral?: string;
};

export function useFilters({
  initialValues = {},
  initialSort = "newest",
  labels = {},
  neutral = "all",
}: UseFiltersOptions = {}) {
  const initial = useMemo<FilterState>(
    () => ({ search: "", values: { ...initialValues }, sort: initialSort, dateRange: { start: "", end: "" } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [state, setState] = useState<FilterState>(initial);

  const setSearch = useCallback((search: string) => setState((p) => ({ ...p, search })), []);
  const setSort = useCallback((sort: string) => setState((p) => ({ ...p, sort })), []);
  const setValue = useCallback(
    (key: string, value: string) => setState((p) => ({ ...p, values: { ...p.values, [key]: value } })),
    [],
  );
  const setDateRange = useCallback(
    (key: "start" | "end", value: string) => setState((p) => ({ ...p, dateRange: { ...p.dateRange, [key]: value } })),
    [],
  );

  const clearFilter = useCallback(
    (id: string) =>
      setState((p) => {
        if (id === "search") return { ...p, search: "" };
        if (id === "dateRange") return { ...p, dateRange: { start: "", end: "" } };
        return { ...p, values: { ...p.values, [id]: initial.values[id] ?? neutral } };
      }),
    [initial.values, neutral],
  );

  const clearAll = useCallback(() => setState(initial), [initial]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const list: ActiveFilter[] = [];
    if (state.search) list.push({ id: "search", label: `"${state.search}"` });
    Object.entries(state.values).forEach(([key, value]) => {
      if (value && value !== neutral) list.push({ id: key, label: `${labels[key] ?? key}: ${value}` });
    });
    if (state.dateRange.start || state.dateRange.end) {
      list.push({ id: "dateRange", label: `${state.dateRange.start || "…"} → ${state.dateRange.end || "…"}` });
    }
    return list;
  }, [state, labels, neutral]);

  return {
    ...state,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    setSearch,
    setSort,
    setValue,
    setDateRange,
    clearFilter,
    clearAll,
  };
}
