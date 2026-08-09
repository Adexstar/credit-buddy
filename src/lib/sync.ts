import type { ConnectedApp, SyncStatus } from "./mock-data";

/** UI status set = persisted sync statuses plus the transient "syncing" state. */
export type SyncUiStatus = SyncStatus | "syncing";

export const SYNC_STATUS_META: Record<
  SyncUiStatus,
  { label: string; tooltip: string; className: string; dot: string }
> = {
  healthy: {
    label: "Synced",
    tooltip: "Balance is up to date",
    className: "border-vault-teal/30 bg-vault-teal/10 text-vault-teal",
    dot: "bg-vault-teal",
  },
  syncing: {
    label: "Syncing…",
    tooltip: "Fetching latest balance",
    className: "border-vault-blue/30 bg-vault-blue/10 text-vault-blue",
    dot: "bg-vault-blue",
  },
  stale: {
    label: "Stale sync",
    tooltip: "Last sync was over 24 hours ago",
    className: "border-vault-amber/30 bg-vault-amber/10 text-vault-amber",
    dot: "bg-vault-amber",
  },
  error: {
    label: "Sync error",
    tooltip: "Failed to sync. Click to retry.",
    className: "border-vault-danger/30 bg-vault-danger/10 text-vault-danger",
    dot: "bg-vault-danger",
  },
  never: {
    label: "Not synced",
    tooltip: "No sync performed yet",
    className: "border-vault-border bg-vault-raised text-vault-faint",
    dot: "bg-vault-faint",
  },
};

export interface SyncResult {
  success: boolean;
  appId: string;
  appName: string;
  balance?: number;
  previousBalance?: number;
  difference?: number;
  reconciled?: boolean;
  lastSync?: string;
  message: string;
  code?: "AUTH_FAILED" | "RATE_LIMITED" | "NETWORK" | "UNSUPPORTED";
}

export interface SyncHistoryEntry {
  id: string;
  appId: string;
  appName: string;
  success: boolean;
  balance: number;
  difference?: number;
  message: string;
  timestamp: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Sync history log (mock persistence). */
let history: SyncHistoryEntry[] = [];

export function logSync(entry: Omit<SyncHistoryEntry, "id" | "timestamp">): SyncHistoryEntry {
  const record: SyncHistoryEntry = {
    ...entry,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  history = [record, ...history].slice(0, 100);
  return record;
}

export function getSyncHistory(appId?: string): SyncHistoryEntry[] {
  return appId ? history.filter((h) => h.appId === appId) : history;
}

/** 30s result cache so rapid re-clicks don't hammer the provider. */
const cache = new Map<string, { timestamp: number; data: SyncResult }>();

export function getCachedSync(appId: string): SyncResult | null {
  const hit = cache.get(appId);
  if (hit && Date.now() - hit.timestamp < 30_000) return hit.data;
  return null;
}

export function setCachedSync(appId: string, data: SyncResult) {
  cache.set(appId, { timestamp: Date.now(), data });
}

class SyncError extends Error {
  code: SyncResult["code"];
  constructor(message: string, code: SyncResult["code"]) {
    super(message);
    this.code = code;
  }
}

/** Provider-specific mock balance fetchers. */
async function fetchOpenAIBalance(current: number) {
  await wait(1200);
  const roll = Math.random();
  if (roll > 0.85) throw new SyncError("Invalid API key. Please reconnect.", "AUTH_FAILED");
  return current + (Math.random() * 40 - 12);
}

async function fetchClaudeBalance(current: number) {
  await wait(1000);
  if (Math.random() > 0.9) throw new SyncError("Rate limited. Try again in 5 minutes.", "RATE_LIMITED");
  return current + (Math.random() * 25 - 8);
}

async function fetchMidjourneyBalance(current: number) {
  await wait(1400);
  if (Math.random() > 0.75) throw new SyncError("Provider returned a network error.", "NETWORK");
  return current + (Math.random() * 12 - 4);
}

async function fetchReplicateBalance(current: number) {
  await wait(900);
  return current + (Math.random() * 18 - 6);
}

async function fetchHuggingFaceBalance(current: number) {
  await wait(800);
  return current + (Math.random() * 10 - 3);
}

export async function fetchProviderBalance(provider: string, current: number): Promise<number> {
  switch (provider.toLowerCase()) {
    case "openai":
      return fetchOpenAIBalance(current);
    case "claude":
    case "anthropic":
      return fetchClaudeBalance(current);
    case "midjourney":
      return fetchMidjourneyBalance(current);
    case "replicate":
      return fetchReplicateBalance(current);
    case "huggingface":
      return fetchHuggingFaceBalance(current);
    default:
      throw new SyncError(`Unsupported provider: ${provider}`, "UNSUPPORTED");
  }
}

/** Runs the full mock sync pipeline for one app and returns a normalised result. */
export async function runMockSync(app: ConnectedApp): Promise<SyncResult> {
  const previousBalance = app.credits;
  try {
    const raw = await fetchProviderBalance(app.provider, previousBalance);
    const balance = Math.max(0, Number(raw.toFixed(2)));
    const difference = Number((balance - previousBalance).toFixed(2));
    const reconciled = Math.abs(difference) > 5;

    const result: SyncResult = {
      success: true,
      appId: app.id,
      appName: app.name,
      balance,
      previousBalance,
      difference,
      reconciled,
      lastSync: new Date().toISOString(),
      message: reconciled
        ? `Balance reconciled — ${difference > 0 ? "+" : ""}${difference.toFixed(2)} credits adjusted`
        : difference === 0
          ? "Balance unchanged"
          : "Balance updated successfully",
    };
    logSync({
      appId: app.id,
      appName: app.name,
      success: true,
      balance,
      difference,
      message: result.message,
    });
    setCachedSync(app.id, result);
    return result;
  } catch (error) {
    const err = error as SyncError;
    const result: SyncResult = {
      success: false,
      appId: app.id,
      appName: app.name,
      previousBalance,
      message: err.message || "Failed to sync",
      code: err.code,
    };
    logSync({
      appId: app.id,
      appName: app.name,
      success: false,
      balance: previousBalance,
      message: result.message,
    });
    return result;
  }
}

export function hoursSince(iso: string | null): number | null {
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

export function relativeTime(iso: string | null): string {
  const h = hoursSince(iso);
  if (h === null) return "never";
  if (h < 0.017) return "just now";
  if (h < 1) return `${Math.round(h * 60)} min ago`;
  if (h < 24) return `${Math.round(h)} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
