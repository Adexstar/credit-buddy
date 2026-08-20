import {
  mockBuckets,
  mockTransactions,
  type CreditBucket,
  type CreditTransaction,
} from "./mock-data";
import { api } from "./api";

export type BucketStatus = "active" | "expiring_soon" | "expiring_today" | "expired" | "empty" | "frozen";

export const SOURCE_TYPES = ["Subscription", "Promo", "Top-Up", "Grant"] as const;

export const STATUS_LABEL: Record<BucketStatus, string> = {
  active: "Active",
  expiring_soon: "Expiring soon",
  expiring_today: "Expiring today",
  expired: "Expired",
  empty: "Empty",
  frozen: "Frozen",
};

export const STATUS_TONE: Record<BucketStatus, string> = {
  active: "border-vault-green/30 bg-vault-green/10 text-vault-green",
  expiring_soon: "border-vault-amber/30 bg-vault-amber/10 text-vault-amber",
  expiring_today: "border-vault-danger/30 bg-vault-danger/10 text-vault-danger",
  expired: "border-vault-danger/30 bg-vault-danger/10 text-vault-danger",
  empty: "border-vault-border bg-vault-raised text-vault-faint",
  frozen: "border-vault-blue/30 bg-vault-blue/10 text-vault-blue",
};

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function bucketStatus(bucket: CreditBucket): BucketStatus {
  if (bucket.frozen) return "frozen";
  const d = daysUntil(bucket.softExpiry);
  if (d < 0) return "expired";
  if (bucket.remaining <= 0) return "empty";
  if (d === 0) return "expiring_today";
  if (d <= 7) return "expiring_soon";
  return "active";
}

export function usedAmount(bucket: CreditBucket) {
  return Math.max(0, Number((bucket.original - bucket.remaining).toFixed(2)));
}

export function progressPct(bucket: CreditBucket) {
  if (!bucket.original) return 0;
  return Math.min(100, Math.max(0, (bucket.remaining / bucket.original) * 100));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export type SortKey =
  | "expiry_asc"
  | "expiry_desc"
  | "balance_desc"
  | "balance_asc"
  | "app_asc"
  | "app_desc"
  | "created_desc"
  | "created_asc";

export const SORT_OPTIONS: Array<{ label: string; value: SortKey }> = [
  { label: "Expiry date (earliest)", value: "expiry_asc" },
  { label: "Expiry date (latest)", value: "expiry_desc" },
  { label: "Balance (high to low)", value: "balance_desc" },
  { label: "Balance (low to high)", value: "balance_asc" },
  { label: "App name A–Z", value: "app_asc" },
  { label: "App name Z–A", value: "app_desc" },
  { label: "Date added (newest)", value: "created_desc" },
  { label: "Date added (oldest)", value: "created_asc" },
];

export interface CreditFilters {
  search: string;
  app: string;
  status: string;
  source: string;
  expiry: "all" | "expiring" | "expired";
  sort: SortKey;
}

export const DEFAULT_FILTERS: CreditFilters = {
  search: "",
  app: "all",
  status: "all",
  source: "all",
  expiry: "all",
  sort: "expiry_asc",
};

export function applyFilters(buckets: CreditBucket[], f: CreditFilters): CreditBucket[] {
  const term = f.search.trim().toLowerCase();
  const rows = buckets.filter((b) => {
    if (term && !`${b.appName} ${b.sourceType} ${b.id}`.toLowerCase().includes(term)) return false;
    if (f.app !== "all" && b.appName !== f.app) return false;
    if (f.source !== "all" && b.sourceType !== f.source) return false;
    if (f.status !== "all" && bucketStatus(b) !== f.status) return false;
    const d = daysUntil(b.softExpiry);
    if (f.expiry === "expiring" && (d < 0 || d > 7)) return false;
    if (f.expiry === "expired" && d >= 0) return false;
    return true;
  });

  const created = (b: CreditBucket) => new Date(b.createdAt ?? b.softExpiry).getTime();
  const expiry = (b: CreditBucket) => new Date(b.softExpiry).getTime();

  return rows.sort((a, b) => {
    switch (f.sort) {
      case "expiry_asc":
        return expiry(a) - expiry(b);
      case "expiry_desc":
        return expiry(b) - expiry(a);
      case "balance_desc":
        return b.remaining - a.remaining;
      case "balance_asc":
        return a.remaining - b.remaining;
      case "app_asc":
        return a.appName.localeCompare(b.appName);
      case "app_desc":
        return b.appName.localeCompare(a.appName);
      case "created_desc":
        return created(b) - created(a);
      case "created_asc":
        return created(a) - created(b);
      default:
        return 0;
    }
  });
}

export function summarize(buckets: CreditBucket[]) {
  const total = buckets.reduce((s, b) => s + b.remaining, 0);
  const expiring = buckets.filter((b) => {
    const d = daysUntil(b.softExpiry);
    return d >= 0 && d <= 7 && b.remaining > 0;
  }).length;
  const empty = buckets.filter((b) => b.remaining <= 0).length;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthTx = mockTransactions.filter((t) => new Date(t.timestamp) >= monthStart);
  return {
    total: Number(total.toFixed(2)),
    active: buckets.filter((b) => b.remaining > 0 && daysUntil(b.softExpiry) >= 0).length,
    expiring,
    empty,
    usedThisMonth: Number(monthTx.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0).toFixed(2)),
    addedThisMonth: Number(monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0).toFixed(2)),
  };
}

export function analytics(buckets: CreditBucket[]) {
  const group = (key: (b: CreditBucket) => string) =>
    Object.entries(
      buckets.reduce<Record<string, number>>((acc, b) => {
        acc[key(b)] = Number(((acc[key(b)] ?? 0) + b.remaining).toFixed(2));
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

  const distribution: Record<string, number> = { "0-7 days": 0, "8-30 days": 0, "31-90 days": 0, ">90 days": 0 };
  buckets.forEach((b) => {
    const d = daysUntil(b.softExpiry);
    const key = d <= 7 ? "0-7 days" : d <= 30 ? "8-30 days" : d <= 90 ? "31-90 days" : ">90 days";
    distribution[key] = Number((distribution[key]! + b.remaining).toFixed(2));
  });

  return {
    byApp: group((b) => b.appName),
    bySource: group((b) => b.sourceType),
    byExpiry: Object.entries(distribution).map(([name, value]) => ({ name, value })),
  };
}

/* ---------------- export ---------------- */

export function downloadFile(content: string, filename: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function bucketsToCsv(buckets: CreditBucket[]) {
  const headers = ["Bucket ID", "App", "Source", "Remaining", "Original", "Used", "Expiry", "Status", "Created"];
  const rows = buckets.map((b) => [
    b.id,
    b.appName,
    b.sourceType,
    b.remaining.toFixed(2),
    b.original.toFixed(2),
    usedAmount(b).toFixed(2),
    new Date(b.softExpiry).toLocaleDateString(),
    STATUS_LABEL[bucketStatus(b)],
    b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function exportBuckets(buckets: CreditBucket[], filename = "credits_export.csv") {
  downloadFile(bucketsToCsv(buckets), filename);
}

/* ---------------- mock API ---------------- */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AddCreditsInput {
  appName: string;
  amount: number;
  sourceType: string;
  expiryDays: number;
}

export const creditsApi = {
  async getBuckets(): Promise<CreditBucket[]> {
    await wait(220);
    return mockBuckets.map((b) => ({ ...b }));
  },

  async getHistory(bucketId?: string): Promise<CreditTransaction[]> {
    await wait(160);
    const rows = bucketId ? mockTransactions.filter((t) => t.bucketId === bucketId) : mockTransactions;
    return [...rows].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  },

  async addCredits({ appName, amount, sourceType, expiryDays }: AddCreditsInput): Promise<CreditBucket> {
    await wait(650);
    const bucket: CreditBucket = {
      id: `b-add-${Date.now()}`,
      appName,
      sourceType,
      remaining: Number(amount.toFixed(2)),
      original: Number(amount.toFixed(2)),
      softExpiry: new Date(Date.now() + expiryDays * 86_400_000).toISOString(),
      createdAt: new Date().toISOString(),
      peakRestricted: false,
      frozen: false,
    };
    mockBuckets.push(bucket);
    mockTransactions.push({
      id: `tx-${bucket.id}`,
      bucketId: bucket.id,
      type: "addition",
      description: `Added ${amount.toFixed(2)} credits (${sourceType})`,
      appName,
      amount: Number(amount.toFixed(2)),
      timestamp: new Date().toISOString(),
    });
    api.addActivity({
      id: `act-add-${Date.now()}`,
      kind: "topup",
      message: `Added ${amount.toFixed(2)} ${appName} credits from a ${sourceType.toLowerCase()} bucket`,
      appName,
      timestamp: new Date().toISOString(),
      amount: Number(amount.toFixed(2)),
    });
    return bucket;
  },

  async setFrozen(ids: string[], frozen: boolean): Promise<void> {
    await wait(320);
    ids.forEach((id) => {
      const b = mockBuckets.find((x) => x.id === id);
      if (b) b.frozen = frozen;
    });
  },

  async deleteBuckets(ids: string[]): Promise<void> {
    await wait(320);
    ids.forEach((id) => {
      const i = mockBuckets.findIndex((b) => b.id === id);
      if (i >= 0) mockBuckets.splice(i, 1);
    });
  },

  async markAsUsed(ids: string[]): Promise<void> {
    await wait(320);
    ids.forEach((id) => {
      const b = mockBuckets.find((x) => x.id === id);
      if (!b || b.remaining <= 0) return;
      mockTransactions.push({
        id: `tx-used-${id}-${Date.now()}`,
        bucketId: id,
        type: "usage",
        description: "Marked remaining balance as used",
        appName: b.appName,
        amount: -b.remaining,
        timestamp: new Date().toISOString(),
      });
      b.remaining = 0;
    });
  },
};

export type { CreditBucket, CreditTransaction };
