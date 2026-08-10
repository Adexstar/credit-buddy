import { PROVIDERS, type ConnectedApp, mockBuckets } from "./mock-data";
import { relativeTime } from "./sync";

/* ---------------- types ---------------- */

export type AppUiStatus = "connected" | "syncing" | "stale" | "error" | "pending" | "disconnected";

export type SyncFrequency = "1h" | "6h" | "12h" | "24h" | "manual";

export interface AppMeta {
  displayName: string;
  description: string;
  color: string;
  emoji: string;
  connectedAt: string;
  keyTail: string;
  keyValid: boolean;
  syncFrequency: SyncFrequency;
  autoSync: boolean;
  peakRestrictions: boolean;
  offPeakRouting: boolean;
  policies: string[];
}

export interface ManagedApp extends ConnectedApp, AppMeta {
  status: AppUiStatus;
  bucketCount: number;
}

export interface ConnectionEvent {
  id: string;
  appId: string;
  type: "connected" | "sync" | "key_rotated" | "error" | "settings" | "disconnected";
  message: string;
  timestamp: string;
  balance?: number;
}

export const SYNC_FREQUENCIES: Array<{ value: SyncFrequency; label: string }> = [
  { value: "1h", label: "Every hour" },
  { value: "6h", label: "Every 6 hours" },
  { value: "12h", label: "Every 12 hours" },
  { value: "24h", label: "Daily" },
  { value: "manual", label: "Manual only" },
];

export const APP_STATUS_META: Record<AppUiStatus, { label: string; className: string; dot: string }> = {
  connected: { label: "Connected", className: "border-vault-teal/30 bg-vault-teal/10 text-vault-teal", dot: "bg-vault-teal" },
  syncing: { label: "Syncing", className: "border-vault-blue/30 bg-vault-blue/10 text-vault-blue", dot: "bg-vault-blue" },
  stale: { label: "Stale", className: "border-vault-amber/30 bg-vault-amber/10 text-vault-amber", dot: "bg-vault-amber" },
  error: { label: "Error", className: "border-vault-danger/30 bg-vault-danger/10 text-vault-danger", dot: "bg-vault-danger" },
  pending: { label: "Pending", className: "border-vault-purple/30 bg-vault-purple/10 text-vault-purple", dot: "bg-vault-purple" },
  disconnected: { label: "Disconnected", className: "border-vault-border bg-vault-raised text-vault-faint", dot: "bg-vault-faint" },
};

const PROVIDER_LOOK: Record<string, { emoji: string; color: string }> = {
  openai: { emoji: "🤖", color: "#10a37f" },
  claude: { emoji: "🧠", color: "#d97757" },
  midjourney: { emoji: "🎨", color: "#8b7cf6" },
  replicate: { emoji: "⚡", color: "#38bdf8" },
  huggingface: { emoji: "🤗", color: "#f59e0b" },
};

export function providerLook(provider: string) {
  return PROVIDER_LOOK[provider.toLowerCase()] ?? { emoji: "🔌", color: "#4dd6c1" };
}

export function providerDocs(provider: string) {
  return PROVIDERS.find((p) => p.id === provider)?.docs ?? "https://docs.lovable.dev";
}

/* ---------------- mock metadata store ---------------- */

const nowMs = Date.now();
const daysAgo = (d: number) => new Date(nowMs - d * 86400_000).toISOString();
const randTail = () => Math.random().toString(36).slice(2, 10);

const meta = new Map<string, AppMeta>();
let historyLog: ConnectionEvent[] = [];
let pendingApps: ManagedApp[] = [];

const SEED: Record<string, Partial<AppMeta> & { policies: string[] }> = {
  "app-openai": { displayName: "My OpenAI Account", description: "Primary AI provider", connectedAt: daysAgo(14), policies: ["auto-convert", "off-peak"], syncFrequency: "6h" },
  "app-claude": { displayName: "Claude Pro", description: "Long-context reasoning", connectedAt: daysAgo(13), policies: ["auto-convert"], syncFrequency: "12h" },
  "app-midjourney": { displayName: "Midjourney Studio", description: "Image generation", connectedAt: daysAgo(40), policies: ["off-peak"], syncFrequency: "24h" },
  "app-replicate": { displayName: "Replicate Lab", description: "Model experiments", connectedAt: daysAgo(3), policies: [], syncFrequency: "6h" },
};

function ensureMeta(app: ConnectedApp): AppMeta {
  const existing = meta.get(app.id);
  if (existing) return existing;
  const look = providerLook(app.provider);
  const seed = SEED[app.id];
  const created: AppMeta = {
    displayName: seed?.displayName ?? app.name,
    description: seed?.description ?? `${app.name} integration`,
    color: look.color,
    emoji: look.emoji,
    connectedAt: seed?.connectedAt ?? new Date().toISOString(),
    keyTail: randTail(),
    keyValid: app.syncStatus !== "error",
    syncFrequency: (seed?.syncFrequency as SyncFrequency) ?? "6h",
    autoSync: true,
    peakRestrictions: false,
    offPeakRouting: seed?.policies?.includes("off-peak") ?? false,
    policies: seed?.policies ?? [],
  };
  meta.set(app.id, created);
  return created;
}

function statusFor(app: ConnectedApp): AppUiStatus {
  switch (app.syncStatus) {
    case "healthy":
      return "connected";
    case "stale":
      return "stale";
    case "error":
      return "error";
    default:
      return "pending";
  }
}

function bucketCountFor(app: ConnectedApp) {
  const name = app.name.toLowerCase();
  return mockBuckets.filter((b) => b.appName.toLowerCase().includes(name.split(" ")[0]!)).length;
}

export function decorate(apps: ConnectedApp[]): ManagedApp[] {
  const decorated = apps.map((app) => ({
    ...app,
    ...ensureMeta(app),
    status: statusFor(app),
    bucketCount: bucketCountFor(app),
  }));
  return [...decorated, ...pendingApps];
}

function seedHistory(appId: string, app?: ManagedApp) {
  if (historyLog.some((h) => h.appId === appId)) return;
  historyLog = [
    ...historyLog,
    { id: `h-${appId}-1`, appId, type: "connected", message: "Initial setup completed", timestamp: app?.connectedAt ?? daysAgo(10) },
    { id: `h-${appId}-2`, appId, type: "sync", message: "Balance synced successfully", timestamp: daysAgo(2), balance: app?.credits ?? 0 },
    { id: `h-${appId}-3`, appId, type: "key_rotated", message: "API key rotated — old key deactivated", timestamp: daysAgo(1) },
  ];
}

export function logEvent(event: Omit<ConnectionEvent, "id" | "timestamp">) {
  historyLog = [
    { ...event, id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString() },
    ...historyLog,
  ];
}

/* ---------------- filters + stats ---------------- */

export interface AppFilters {
  search: string;
  status: AppUiStatus | "all";
  provider: string;
}

export const DEFAULT_APP_FILTERS: AppFilters = { search: "", status: "all", provider: "all" };

export function filterApps(apps: ManagedApp[], f: AppFilters): ManagedApp[] {
  const q = f.search.trim().toLowerCase();
  return apps.filter((app) => {
    if (q && ![app.name, app.displayName, app.provider, app.description].some((v) => v.toLowerCase().includes(q))) return false;
    if (f.status !== "all" && app.status !== f.status) return false;
    if (f.provider !== "all" && app.provider !== f.provider) return false;
    return true;
  });
}

export function appStats(apps: ManagedApp[]) {
  const recentCutoff = nowMs - 30 * 86400_000;
  return {
    total: apps.length,
    connected: apps.filter((a) => a.status === "connected").length,
    pending: apps.filter((a) => a.status === "pending").length,
    disconnected: apps.filter((a) => a.status === "disconnected").length,
    validKeys: apps.filter((a) => a.keyValid).length,
    expiredKeys: apps.filter((a) => !a.keyValid).length,
    errors: apps.filter((a) => a.status === "error").length,
    stale: apps.filter((a) => a.status === "stale").length,
    recent: apps.filter((a) => new Date(a.connectedAt).getTime() > recentCutoff).length,
    credits: Number(apps.reduce((s, a) => s + a.credits, 0).toFixed(2)),
  };
}

export function appsToCsv(apps: ManagedApp[]) {
  const head = ["Name", "Provider", "Status", "Credits", "Buckets", "Connected", "Last sync", "Sync frequency", "Auto sync", "Policies"];
  const rows = apps.map((a) => [
    a.displayName,
    a.provider,
    a.status,
    a.credits.toFixed(2),
    String(a.bucketCount),
    new Date(a.connectedAt).toLocaleDateString(),
    relativeTime(a.lastSync),
    a.syncFrequency,
    a.autoSync ? "yes" : "no",
    a.policies.join(" / "),
  ]);
  return [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/* ---------------- mock api ---------------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const appsApi = {
  async getHistory(appId: string, app?: ManagedApp): Promise<ConnectionEvent[]> {
    await wait(320);
    seedHistory(appId, app);
    return historyLog
      .filter((h) => h.appId === appId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async updateSettings(appId: string, patch: Partial<AppMeta>): Promise<void> {
    await wait(450);
    const current = meta.get(appId);
    if (current) meta.set(appId, { ...current, ...patch });
    pendingApps = pendingApps.map((a) => (a.id === appId ? { ...a, ...patch } : a));
    logEvent({ appId, type: "settings", message: "App settings updated" });
  },

  async rotateKey(appId: string, newKey: string): Promise<void> {
    await wait(900);
    if (newKey.trim().length < 12) throw new Error("That key looks too short");
    const current = meta.get(appId);
    if (current) meta.set(appId, { ...current, keyTail: newKey.slice(-8), keyValid: true });
    logEvent({ appId, type: "key_rotated", message: "API key rotated — old key deactivated" });
  },

  async disconnect(appId: string): Promise<void> {
    await wait(500);
    pendingApps = pendingApps.filter((a) => a.id !== appId);
    meta.delete(appId);
    logEvent({ appId, type: "disconnected", message: "App disconnected and credits released" });
  },

  /** Registers metadata for a freshly connected app (called after api.saveConnection). */
  register(app: ConnectedApp, patch: Partial<AppMeta>) {
    const base = ensureMeta(app);
    meta.set(app.id, { ...base, ...patch, connectedAt: new Date().toISOString(), keyValid: true });
    logEvent({ appId: app.id, type: "connected", message: "Initial setup completed", balance: app.credits });
  },
};
