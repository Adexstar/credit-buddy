export type SyncStatus = "healthy" | "stale" | "error" | "never";

export interface UserProfile {
  name: string;
  email: string;
  planType: "free" | "premium";
}

export interface ConnectedApp {
  id: string;
  provider: string;
  name: string;
  initials: string;
  syncStatus: SyncStatus;
  credits: number;
  lastSync: string | null;
}

export interface CreditBucket {
  id: string;
  sourceType: string;
  appName: string;
  remaining: number;
  original: number;
  softExpiry: string;
  peakRestricted: boolean;
}

export interface Activity {
  id: string;
  kind: "usage" | "conversion" | "sync" | "expiry" | "topup";
  message: string;
  appName: string;
  timestamp: string;
  amount?: number;
}

export interface Stats {
  connectedApps: number;
  providersSupported: number;
  activeBuckets: number;
  expiringCredits: number;
  totalBalance: number;
  bucketsTrend: number;
  balanceTrend: number;
}

export interface UsageData {
  labels: string[];
  used: number[];
  added: number[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  scope: string;
  trigger: string;
  active: boolean;
}

export type TimeRange = "7d" | "30d" | "90d";

export const PROVIDERS = [
  { id: "openai", name: "OpenAI", initials: "AI", docs: "https://platform.openai.com/api-keys" },
  { id: "claude", name: "Claude (Anthropic)", initials: "CL", docs: "https://console.anthropic.com/settings/keys" },
  { id: "midjourney", name: "Midjourney", initials: "MJ", docs: "https://docs.midjourney.com" },
  { id: "replicate", name: "Replicate", initials: "RP", docs: "https://replicate.com/account/api-tokens" },
  { id: "huggingface", name: "Hugging Face", initials: "HF", docs: "https://huggingface.co/settings/tokens" },
] as const;

const now = new Date("2026-08-03T09:00:00Z").getTime();
const hours = (h: number) => new Date(now - h * 3600_000).toISOString();
const days = (d: number) => new Date(now + d * 86400_000).toISOString();

export const mockUser: UserProfile = {
  name: "Ada Okoye",
  email: "ada@creditbank.io",
  planType: "premium",
};

export const mockApps: ConnectedApp[] = [
  { id: "app-openai", provider: "openai", name: "OpenAI", initials: "AI", syncStatus: "healthy", credits: 412.75, lastSync: hours(0.5) },
  { id: "app-claude", provider: "claude", name: "Claude", initials: "CL", syncStatus: "healthy", credits: 208.4, lastSync: hours(1.6) },
  { id: "app-midjourney", provider: "midjourney", name: "Midjourney", initials: "MJ", syncStatus: "stale", credits: 96.0, lastSync: hours(31) },
  { id: "app-replicate", provider: "replicate", name: "Replicate", initials: "RP", syncStatus: "error", credits: 34.2, lastSync: hours(9.5) },
];

export const mockBuckets: CreditBucket[] = [
  { id: "b1", sourceType: "Subscription", appName: "OpenAI", remaining: 312.5, original: 500, softExpiry: days(21), peakRestricted: false },
  { id: "b2", sourceType: "Promo", appName: "OpenAI", remaining: 46.25, original: 100, softExpiry: days(5), peakRestricted: true },
  { id: "b3", sourceType: "Top-Up", appName: "Claude", remaining: 188.4, original: 250, softExpiry: days(48), peakRestricted: false },
  { id: "b4", sourceType: "Grant", appName: "Midjourney", remaining: 18, original: 120, softExpiry: days(2), peakRestricted: false },
  { id: "b5", sourceType: "Subscription", appName: "Replicate", remaining: 34.2, original: 80, softExpiry: days(12), peakRestricted: true },
];

export const mockActivities: Activity[] = [
  { id: "a1", kind: "usage", message: "Used 12.5 credits on a GPT-4 completion", appName: "OpenAI", timestamp: hours(0.17), amount: -12.5 },
  { id: "a2", kind: "conversion", message: "Converted 50 OpenAI credits into Claude credits", appName: "Claude", timestamp: hours(0.57), amount: 45 },
  { id: "a3", kind: "sync", message: "Balance synced with provider", appName: "Replicate", timestamp: hours(2.07) },
  { id: "a4", kind: "expiry", message: "18 credits expire in 2 days — auto-convert queued", appName: "Midjourney", timestamp: hours(4.07) },
  { id: "a5", kind: "topup", message: "Added 100 credits from promo code SPRINGAI", appName: "OpenAI", timestamp: hours(7.07), amount: 100 },
  { id: "a6", kind: "usage", message: "Batch render consumed 32 credits", appName: "Midjourney", timestamp: hours(19.07), amount: -32 },
];

export const mockUsage: Record<TimeRange, UsageData> = {
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    used: [42, 38, 55, 31, 48, 22, 35],
    added: [0, 60, 0, 0, 100, 0, 25],
  },
  "30d": {
    labels: ["W1", "W2", "W3", "W4"],
    used: [212, 265, 198, 241],
    added: [180, 320, 120, 260],
  },
  "90d": {
    labels: ["May", "Jun", "Jul"],
    used: [742, 918, 866],
    added: [800, 960, 780],
  },
};

export const mockPolicies: Policy[] = [
  {
    id: "p1",
    name: "Auto-convert before expiry",
    description: "Move credits to the highest-value app when a bucket nears its soft expiry.",
    scope: "All apps",
    trigger: "3 days before expiry",
    active: true,
  },
  {
    id: "p2",
    name: "Off-peak routing",
    description: "Route non-urgent jobs to peak-restricted buckets first.",
    scope: "OpenAI, Replicate",
    trigger: "22:00 — 06:00",
    active: true,
  },
  {
    id: "p3",
    name: "Low balance alert",
    description: "Notify when total balance across all apps drops below a floor.",
    scope: "All apps",
    trigger: "$100.00",
    active: false,
  },
  {
    id: "p4",
    name: "Spend ceiling per app",
    description: "Block proxy requests once an app exceeds its monthly ceiling.",
    scope: "Midjourney",
    trigger: "$250 / month",
    active: false,
  },
];

export const mockStats: Stats = {
  connectedApps: mockApps.length,
  providersSupported: 5,
  activeBuckets: mockBuckets.length,
  expiringCredits: 64.25,
  totalBalance: 599.35,
  bucketsTrend: 12,
  balanceTrend: -4,
};

export const routingRules = [
  "Spend from the bucket closest to its soft expiry first.",
  "Prefer peak-restricted buckets during off-peak hours.",
  "Convert stranded credits once they drop under the conversion floor.",
  "Stop routing to any app that hits its monthly spend ceiling.",
];
