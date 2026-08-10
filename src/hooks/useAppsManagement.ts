import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, type ConnectedApp } from "@/lib/api";
import { useSync } from "@/hooks/useSync";
import {
  appStats,
  appsApi,
  appsToCsv,
  decorate,
  downloadCsv,
  filterApps,
  DEFAULT_APP_FILTERS,
  type AppFilters,
  type AppMeta,
  type ManagedApp,
} from "@/lib/apps";

export function useAppsManagement() {
  const [raw, setRaw] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AppFilters>(DEFAULT_APP_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setRaw(await api.getApps());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { syncApp, syncingApps } = useSync(load);

  const apps = useMemo(() => decorate(raw), [raw]);
  const visible = useMemo(() => filterApps(apps, filters), [apps, filters]);
  const stats = useMemo(() => appStats(apps), [apps]);

  const setFilter = useCallback(<K extends keyof AppFilters>(key: K, value: AppFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const clearFilters = useCallback(() => setFilters(DEFAULT_APP_FILTERS), []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const selectAll = useCallback(() => setSelected(visible.map((a) => a.id)), [visible]);
  const clearSelection = useCallback(() => setSelected([]), []);

  const saveSettings = useCallback(
    async (appId: string, patch: Partial<AppMeta>, appName: string) => {
      setBusy(true);
      try {
        await appsApi.updateSettings(appId, patch);
        toast.success(`Settings updated for ${appName}`);
        await load();
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const rotateKey = useCallback(
    async (appId: string, key: string, appName: string) => {
      await appsApi.rotateKey(appId, key);
      toast.success(`API key rotated for ${appName}`);
      await load();
    },
    [load],
  );

  const disconnect = useCallback(
    async (appId: string, appName: string) => {
      setBusy(true);
      try {
        await appsApi.disconnect(appId);
        await api.disconnectApp(appId);
        toast.success(`${appName} disconnected`);
        setSelected((prev) => prev.filter((x) => x !== appId));
        await load();
      } catch {
        toast.error(`Failed to disconnect ${appName}`);
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const bulkSync = useCallback(async () => {
    const targets = apps.filter((a) => selected.includes(a.id));
    if (!targets.length) return;
    toast.info("Syncing selected apps…");
    for (const app of targets) await syncApp(app.id, app.displayName);
    clearSelection();
  }, [apps, selected, syncApp, clearSelection]);

  const bulkDisconnect = useCallback(async () => {
    const targets = apps.filter((a) => selected.includes(a.id));
    for (const app of targets) {
      await appsApi.disconnect(app.id);
      await api.disconnectApp(app.id);
    }
    toast.success(`Disconnected ${targets.length} app${targets.length === 1 ? "" : "s"}`);
    clearSelection();
    await load();
  }, [apps, selected, clearSelection, load]);

  const exportSelected = useCallback(() => {
    const targets = selected.length ? apps.filter((a) => selected.includes(a.id)) : visible;
    downloadCsv(appsToCsv(targets), "connected_apps.csv");
    toast.success(`Exported ${targets.length} apps`);
  }, [apps, selected, visible]);

  return {
    apps,
    visible,
    stats,
    loading,
    busy,
    filters,
    setFilter,
    clearFilters,
    view,
    setView,
    selected,
    toggleSelect,
    selectAll,
    clearSelection,
    syncApp,
    syncingApps,
    saveSettings,
    rotateKey,
    disconnect,
    bulkSync,
    bulkDisconnect,
    exportSelected,
    reload: load,
  } as const;
}

export type AppsManager = ReturnType<typeof useAppsManagement>;
export type { ManagedApp };
