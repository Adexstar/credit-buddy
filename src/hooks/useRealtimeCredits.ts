import { useEffect, useState } from "react";
import { toast } from "sonner";
import { wsService } from "@/websocket/websocket";

export const CREDIT_UPDATE_EVENT = "vault:credit-update";

export type CreditUpdate = { appId: string; appName?: string; balance: number; delta?: number };

/**
 * Live per-app balances pushed over the socket. Also re-broadcasts as a DOM event
 * so any page can refetch without threading props through the tree.
 */
export function useRealtimeCredits(onUpdate?: (update: CreditUpdate) => void) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const offCredit = wsService.on("credit_update", (data: CreditUpdate) => {
      if (!data?.appId) return;
      setBalances((prev) => ({ ...prev, [data.appId]: data.balance }));
      setLastUpdate(new Date());
      onUpdate?.(data);
      window.dispatchEvent(new CustomEvent(CREDIT_UPDATE_EVENT, { detail: data }));
    });

    const offSync = wsService.on("sync_completed", (data: { appName?: string; balance?: number }) => {
      window.dispatchEvent(new CustomEvent(CREDIT_UPDATE_EVENT, { detail: data }));
      if (data?.appName) toast.success(`${data.appName} synced`);
    });

    const offConversion = wsService.on("conversion_completed", (data: { receive?: number; toAppName?: string }) => {
      window.dispatchEvent(new CustomEvent(CREDIT_UPDATE_EVENT, { detail: data }));
      toast.success(
        data?.receive && data?.toAppName
          ? `Conversion complete — ${data.receive.toFixed(2)} credits in ${data.toAppName}`
          : "Conversion complete",
      );
    });

    const offPolicy = wsService.on("policy_triggered", (data: { name?: string }) => {
      toast.info(data?.name ? `Policy triggered: ${data.name}` : "A policy just ran");
    });

    const offNotification = wsService.on("notification", (data: { message?: string; level?: string }) => {
      if (!data?.message) return;
      if (data.level === "error") toast.error(data.message);
      else if (data.level === "warning") toast.warning(data.message);
      else toast.info(data.message);
    });

    return () => {
      offCredit();
      offSync();
      offConversion();
      offPolicy();
      offNotification();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { balances, lastUpdate };
}
