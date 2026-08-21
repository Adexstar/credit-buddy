/**
 * Realtime transport with auto-reconnect (exponential-ish backoff), heartbeat
 * and a tiny typed event bus. One shared instance per app.
 */
import { WS_URL } from "@/api/client";

export type RealtimeEvent =
  | "connected"
  | "disconnected"
  | "error"
  | "reconnecting"
  | "reconnect_failed"
  | "credit_update"
  | "new_activity"
  | "sync_started"
  | "sync_completed"
  | "bucket_expiring"
  | "policy_triggered"
  | "notification";

type Listener = (payload: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private reconnectTimer: number | null = null;
  private heartbeat: number | null = null;
  private token: string | null = null;
  private manualClose = false;

  isConnected = false;

  get configured() {
    return Boolean(WS_URL);
  }

  connect(token: string | null) {
    if (!WS_URL) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    this.token = token;
    this.manualClose = false;
    const url = token ? `${WS_URL}${WS_URL.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : WS_URL;

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      this.dispatch("error", { error });
      return;
    }

    this.ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.dispatch("connected", {});
      this.heartbeat = window.setInterval(() => this.send("ping", {}), 25_000);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as { type?: string; payload?: unknown; data?: unknown };
        if (!message.type || message.type === "pong") return;
        this.dispatch(message.type, message.payload ?? message.data ?? {});
      } catch {
        // Ignore non-JSON frames rather than tearing down the socket.
      }
    };

    this.ws.onerror = (error) => this.dispatch("error", { error });

    this.ws.onclose = () => {
      this.isConnected = false;
      this.clearHeartbeat();
      this.dispatch("disconnected", {});
      if (!this.manualClose) this.scheduleReconnect();
    };
  }

  disconnect() {
    this.manualClose = true;
    this.clearHeartbeat();
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.ws?.close();
    this.ws = null;
    this.isConnected = false;
  }

  send(type: string, data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  on(event: RealtimeEvent | string, callback: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: RealtimeEvent | string, callback: Listener) {
    this.listeners.get(event)?.delete(callback);
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.dispatch("reconnect_failed", { attempts: this.reconnectAttempts });
      return;
    }
    this.reconnectAttempts += 1;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    this.dispatch("reconnecting", { attempt: this.reconnectAttempts, delay });
    this.reconnectTimer = window.setTimeout(() => this.connect(this.token), delay);
  }

  private clearHeartbeat() {
    if (this.heartbeat) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
  }

  private dispatch(event: string, payload: unknown) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

export const wsService = new WebSocketService();
