import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getCachedSync, type SyncResult } from "@/lib/sync";

/**
 * Core manual-sync hook. Tracks per-app in-flight state, dedupes rapid clicks,
 * retries transient failures with exponential backoff and surfaces toasts.
 */
export function useSync(onChanged?: () => void | Promise<void>) {
  const [syncingApps, setSyncingApps] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inFlight = useRef<Set<string>>(new Set());
  const abort = useRef<Set<string>>(new Set());

  const cancelAll = useCallback(() => {
    inFlight.current.forEach((id) => abort.current.add(id));
  }, []);

  const syncApp = useCallback(
    async (appId: string, appName: string, opts?: { silent?: boolean; retries?: number }): Promise<SyncResult | null> => {
      if (inFlight.current.has(appId)) {
        if (!opts?.silent) toast.info(`${appName} sync already in progress…`);
        return null;
      }
      const cached = getCachedSync(appId);
      if (cached && opts?.silent) return cached;

      inFlight.current.add(appId);
      setSyncingApps((prev) => ({ ...prev, [appId]: true }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });

      const retries = opts?.retries ?? 2;
      let result: SyncResult | null = null;

      try {
        for (let attempt = 0; attempt <= retries; attempt++) {
          result = await api.syncApp(appId);
          if (abort.current.has(appId)) {
            abort.current.delete(appId);
            if (!opts?.silent) toast.info(`${appName} sync cancelled`);
            return null;
          }
          if (result.success || result.code === "AUTH_FAILED" || result.code === "UNSUPPORTED") break;
          if (attempt < retries) await new Promise((r) => setTimeout(r, 600 * 2 ** attempt));
        }

        if (result?.success) {
          if (!opts?.silent) {
            const diff = result.difference ?? 0;
            if (result.reconciled) {
              toast.success(
                `${appName} synced and reconciled (${diff > 0 ? "+" : ""}${diff.toFixed(2)} credits adjusted)`,
              );
            } else if (diff === 0) {
              toast.info(`${appName} balance unchanged`);
            } else {
              toast.success(`${appName} synced — balance ${(result.balance ?? 0).toFixed(2)} credits`);
            }
          }
        } else if (result) {
          setErrors((prev) => ({ ...prev, [appId]: result!.message }));
          if (!opts?.silent) {
            if (result.code === "AUTH_FAILED") toast.error(`${appName} API key invalid. Please reconnect.`);
            else if (result.code === "RATE_LIMITED") toast.error(`${appName} rate limited. Try again in 5 minutes.`);
            else toast.error(`Failed to sync ${appName}: ${result.message}`);
          }
        }
        await onChanged?.();
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected sync error";
        setErrors((prev) => ({ ...prev, [appId]: message }));
        if (!opts?.silent) toast.error(`Failed to sync ${appName}: ${message}`);
        return { success: false, appId, appName, message };
      } finally {
        inFlight.current.delete(appId);
        abort.current.delete(appId);
        setSyncingApps((prev) => {
          const next = { ...prev };
          delete next[appId];
          return next;
        });
      }
    },
    [onChanged],
  );

  return { syncApp, syncingApps, errors, cancelAll, isSyncing: (id: string) => Boolean(syncingApps[id]) };
}
