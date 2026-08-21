import { useEffect, useState } from "react";
import { toast } from "sonner";
import { wsService, type RealtimeEvent } from "@/websocket/websocket";
import { sessionManager } from "@/utils/session";
import { useAuth } from "@/hooks/useAuth";

export type RealtimeMessage = { type: string; payload: any; receivedAt: string };

/** Opens the socket while authenticated and mirrors connection state + recent messages. */
export function useWebSocket(handlers?: Partial<Record<RealtimeEvent, (payload: any) => void>>) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(wsService.isConnected);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !wsService.configured) return;
    wsService.connect(sessionManager.getToken());
    return () => wsService.disconnect();
  }, [isAuthenticated]);

  useEffect(() => {
    const offs = [
      wsService.on("connected", () => setIsConnected(true)),
      wsService.on("disconnected", () => setIsConnected(false)),
      wsService.on("reconnect_failed", () => toast.error("Realtime connection lost — refresh to retry")),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  useEffect(() => {
    const events: RealtimeEvent[] = [
      "credit_update",
      "new_activity",
      "sync_started",
      "sync_completed",
      "bucket_expiring",
      "policy_triggered",
      "notification",
    ];
    const offs = events.map((event) =>
      wsService.on(event, (payload) => {
        setMessages((prev) => [{ type: event, payload, receivedAt: new Date().toISOString() }, ...prev].slice(0, 50));
        handlers?.[event]?.(payload);
      }),
    );
    return () => offs.forEach((off) => off());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isConnected, messages, configured: wsService.configured, send: wsService.send.bind(wsService) };
}
