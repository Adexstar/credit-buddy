import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_FILTERS,
  applyFilters,
  creditsApi,
  exportBuckets,
  summarize,
  type CreditBucket,
  type CreditFilters,
} from "@/lib/credits";

export function useCreditsManagement() {
  const [buckets, setBuckets] = useState<CreditBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CreditFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const rows = await creditsApi.getBuckets();
    setBuckets(rows);
    setSelected((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => applyFilters(buckets, filters), [buckets, filters]);
  const stats = useMemo(() => summarize(buckets), [buckets]);
  const selectedBuckets = useMemo(() => buckets.filter((b) => selected.includes(b.id)), [buckets, selected]);

  const setFilter = useCallback(<K extends keyof CreditFilters>(key: K, value: CreditFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectAll = useCallback(() => {
    setSelected(visible.map((b) => b.id));
  }, [visible]);

  const clearSelection = useCallback(() => setSelected([]), []);

  const run = useCallback(
    async (label: string, fn: () => Promise<unknown>) => {
      setBusy(true);
      try {
        await fn();
        await load();
        toast.success(label);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  return {
    buckets,
    visible,
    stats,
    loading,
    busy,
    filters,
    setFilter,
    resetFilters: () => setFilters(DEFAULT_FILTERS),
    selected,
    selectedBuckets,
    toggleSelect,
    selectAll,
    clearSelection,
    reload: load,
    freeze: (ids: string[], frozen: boolean) =>
      run(frozen ? "Buckets frozen" : "Buckets unfrozen", () => creditsApi.setFrozen(ids, frozen)),
    remove: (ids: string[]) =>
      run(`${ids.length} bucket${ids.length === 1 ? "" : "s"} deleted`, async () => {
        await creditsApi.deleteBuckets(ids);
        clearSelection();
      }),
    markUsed: (ids: string[]) => run("Marked as used", () => creditsApi.markAsUsed(ids)),
    addCredits: (input: Parameters<typeof creditsApi.addCredits>[0]) =>
      run(`Added ${input.amount.toFixed(2)} ${input.appName} credits`, () => creditsApi.addCredits(input)),
    exportCsv: (rows?: CreditBucket[]) => {
      const data = rows?.length ? rows : visible;
      exportBuckets(data);
      toast.success(`Exported ${data.length} buckets to CSV`);
    },
  };
}
