import { useEffect, useRef } from "react";
import type { ConnectedApp } from "@/lib/api";
import { hoursSince } from "@/lib/sync";

/** Silently refreshes apps whose last sync is older than 24 hours (once per session). */
export function useAutoSync(
  apps: ConnectedApp[],
  syncApp: (id: string, name: string, opts?: { silent?: boolean }) => Promise<unknown>,
  enabled = true,
) {
  const done = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || apps.length === 0) return;
    const stale = apps.filter((app) => {
      if (done.current.has(app.id)) return false;
      const h = hoursSince(app.lastSync);
      return h === null || h > 24;
    });
    stale.forEach((app) => {
      done.current.add(app.id);
      void syncApp(app.id, app.name, { silent: true });
    });
  }, [apps, syncApp, enabled]);
}
