import { PROVIDERS } from "./mock-data";
import { TIER_LIMITS, type PlanTier, type TierFeature } from "./tiers";

export type PolicyType =
  | "auto-convert"
  | "off-peak"
  | "alert"
  | "ceiling"
  | "smart-convert"
  | "orchestration"
  | "webhook";
export type NotifyChannel = "email" | "push" | "sms";

export interface PolicyBase {
  id: string;
  name: string;
  type: PolicyType;
  scope: "all" | string[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  /** auto-convert */
  daysBeforeExpiry?: number;
  targetAppId?: string;
  conversionRate?: number;
  minRemaining?: number;
  /** off-peak */
  startTime?: string;
  endTime?: string;
  timezone?: string;
  /** alert */
  threshold?: number;
  channels?: NotifyChannel[];
  cooldownMinutes?: number;
  /** ceiling */
  monthlyLimit?: number;
  resetDay?: number;
  blockExceeds?: boolean;
  /** smart-convert (Pro) */
  optimizeFor?: "value" | "expiry" | "usage";
  minConfidence?: number;
  /** orchestration (Pro) */
  chainedPolicyIds?: string[];
  chainMode?: "sequential" | "parallel";
  /** webhook (Pro) */
  webhookUrl?: string;
  webhookSecret?: string;
  /** advanced limits */
  maxExecutionsPerDay?: number;
  conditions?: string;
  /** execution stats */
  triggerCount?: number;
  lastTriggeredAt?: string | null;
  successRate?: number;
}

export type Policy = PolicyBase;

export const POLICY_TYPES: {
  id: PolicyType;
  label: string;
  blurb: string;
  tone: "blue" | "purple" | "amber" | "danger" | "green";
  requiredTier: PlanTier;
  feature?: TierFeature;
}[] = [
  {
    id: "auto-convert",
    label: "Auto-convert before expiry",
    blurb: "Move credits to the highest-value app before a bucket expires.",
    tone: "blue",
    requiredTier: "free",
  },
  {
    id: "off-peak",
    label: "Off-peak routing",
    blurb: "Route non-urgent jobs to peak-restricted buckets first.",
    tone: "purple",
    requiredTier: "free",
  },
  {
    id: "alert",
    label: "Low balance alert",
    blurb: "Notify when the balance drops below a floor.",
    tone: "amber",
    requiredTier: "free",
  },
  {
    id: "ceiling",
    label: "Spend ceiling per app",
    blurb: "Block requests once an app exceeds its monthly limit.",
    tone: "danger",
    requiredTier: "premium",
    feature: "spend_ceiling",
  },
  {
    id: "smart-convert",
    label: "Smart conversion (AI)",
    blurb: "Let the engine pick the best target app and timing for each conversion.",
    tone: "green",
    requiredTier: "pro",
    feature: "smart_conversion",
  },
  {
    id: "orchestration",
    label: "Policy orchestration",
    blurb: "Chain policies so one outcome triggers the next in priority order.",
    tone: "purple",
    requiredTier: "pro",
    feature: "orchestration",
  },
  {
    id: "webhook",
    label: "Webhook action",
    blurb: "Post trigger payloads to your own endpoint for custom automation.",
    tone: "blue",
    requiredTier: "pro",
    feature: "webhooks",
  },
];

export function policyTypeMeta(type: PolicyType) {
  return POLICY_TYPES.find((t) => t.id === type)!;
}

export function requiredTierFor(type: PolicyType): PlanTier {
  return policyTypeMeta(type).requiredTier;
}

export function isTypeAllowed(type: PolicyType, tier: PlanTier): boolean {
  const order: PlanTier[] = ["free", "premium", "pro"];
  return order.indexOf(tier) >= order.indexOf(requiredTierFor(type));
}

export function allowedPolicyTypes(tier: PlanTier): PolicyType[] {
  return POLICY_TYPES.filter((t) => isTypeAllowed(t.id, tier)).map((t) => t.id);
}

export function allowedChannels(tier: PlanTier): NotifyChannel[] {
  const channels: NotifyChannel[] = ["email"];
  if (TIER_LIMITS[tier].features.push_notifications) channels.push("push");
  if (TIER_LIMITS[tier].features.sms_alerts) channels.push("sms");
  return channels;
}

export const APP_OPTIONS = PROVIDERS.map((p) => ({ id: p.id, name: p.name }));

export function appName(id: string) {
  return APP_OPTIONS.find((a) => a.id === id)?.name ?? id;
}

export function scopeLabel(scope: Policy["scope"]) {
  if (scope === "all") return "All apps";
  if (!scope.length) return "No apps";
  return scope.map(appName).join(", ");
}

export function triggerLabel(p: Policy): string {
  switch (p.type) {
    case "auto-convert":
      return `${p.daysBeforeExpiry ?? 3} days before expiry`;
    case "off-peak":
      return `${p.startTime ?? "22:00"} — ${p.endTime ?? "06:00"} ${p.timezone ?? "UTC"}`;
    case "alert":
      return `$${(p.threshold ?? 0).toFixed(2)}`;
    case "ceiling":
      return `$${p.monthlyLimit ?? 0} / month`;
    case "smart-convert":
      return `Optimise for ${p.optimizeFor ?? "value"} (min confidence ${Math.round((p.minConfidence ?? 0.7) * 100)}%)`;
    case "orchestration":
      return `${(p.chainedPolicyIds ?? []).length} chained policies (${p.chainMode ?? "sequential"})`;
    case "webhook":
      return p.webhookUrl ? `POST ${p.webhookUrl}` : "No endpoint set";
  }
}

export function actionLabel(p: Policy): string {
  switch (p.type) {
    case "auto-convert":
      return `Convert to ${appName(p.targetAppId ?? "claude")} at ${Math.round((p.conversionRate ?? 0.85) * 100)}%`;
    case "off-peak":
      return "Use peak-restricted buckets first";
    case "alert":
      return `Notify via ${(p.channels ?? ["email"]).join(", ")}`;
    case "ceiling":
      return p.blockExceeds ? "Block requests until next month" : "Warn only";
    case "smart-convert":
      return "Auto-select target app and convert at the best available rate";
    case "orchestration":
      return `Run chained policies ${p.chainMode ?? "sequential"}ly`;
    case "webhook":
      return "Send a signed JSON payload to your endpoint";
  }
}

export function emptyPolicy(type: PolicyType): Policy {
  const base: Policy = {
    id: "",
    name: POLICY_TYPES.find((t) => t.id === type)!.label,
    type,
    scope: "all",
    isActive: true,
    priority: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (type === "auto-convert")
    return { ...base, daysBeforeExpiry: 3, targetAppId: "claude", conversionRate: 0.85, minRemaining: 0 };
  if (type === "off-peak") return { ...base, startTime: "22:00", endTime: "06:00", timezone: "UTC" };
  if (type === "alert") return { ...base, threshold: 100, channels: ["email"], cooldownMinutes: 60 };
  if (type === "ceiling") return { ...base, monthlyLimit: 250, resetDay: 1, blockExceeds: true };
  if (type === "smart-convert") return { ...base, optimizeFor: "value", minConfidence: 0.7, minRemaining: 0 };
  if (type === "orchestration") return { ...base, chainedPolicyIds: [], chainMode: "sequential" };
  return { ...base, webhookUrl: "", webhookSecret: "", maxExecutionsPerDay: 50 };
}

export function validatePolicy(p: Policy): string[] {
  const errors: string[] = [];
  const name = p.name.trim();
  if (name.length < 3) errors.push("Policy name must be at least 3 characters.");
  if (name.length > 100) errors.push("Policy name must be under 100 characters.");
  if (p.scope !== "all" && p.scope.length === 0) errors.push("Select at least one app.");
  if (p.type === "auto-convert") {
    if (!p.daysBeforeExpiry || p.daysBeforeExpiry < 1 || p.daysBeforeExpiry > 30)
      errors.push("Days before expiry must be between 1 and 30.");
    if (!p.targetAppId) errors.push("Choose a target app.");
    const rate = p.conversionRate ?? 0;
    if (rate < 0.5 || rate > 1) errors.push("Conversion rate must be between 50% and 100%.");
  }
  if (p.type === "off-peak") {
    const valid = (t?: string) => !!t && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
    if (!valid(p.startTime) || !valid(p.endTime)) errors.push("Enter a valid start and end time.");
    if (p.startTime === p.endTime) errors.push("Start and end time cannot match.");
  }
  if (p.type === "alert") {
    if (!p.threshold || p.threshold <= 0) errors.push("Threshold must be greater than 0.");
    if (!p.channels?.length) errors.push("Pick at least one notification channel.");
  }
  if (p.type === "ceiling") {
    if (!p.monthlyLimit || p.monthlyLimit <= 0) errors.push("Monthly limit must be greater than 0.");
    const day = p.resetDay ?? 1;
    if (day < 1 || day > 28) errors.push("Reset day must be between 1 and 28.");
  }
  if (p.type === "smart-convert") {
    const c = p.minConfidence ?? 0;
    if (c < 0.5 || c > 1) errors.push("Minimum confidence must be between 50% and 100%.");
  }
  if (p.type === "orchestration" && !(p.chainedPolicyIds ?? []).length) {
    errors.push("Chain at least one policy.");
  }
  if (p.type === "webhook") {
    const url = p.webhookUrl ?? "";
    if (!/^https:\/\/\S+$/.test(url)) errors.push("Webhook URL must be a valid https:// endpoint.");
  }
  if ((p.maxExecutionsPerDay ?? 0) < 0) errors.push("Max executions per day cannot be negative.");
  return errors;
}

/* ---------------- Simulator ---------------- */

export interface Scenario {
  daysToExpiry?: number;
  balance?: number;
  currentTime?: string;
  usageThisMonth?: number;
}

export interface SimulationResult {
  triggered: boolean;
  action: string;
  impact: string;
  steps: string[];
}

export function defaultScenario(type: PolicyType): Scenario {
  if (type === "auto-convert") return { daysToExpiry: 2, balance: 100 };
  if (type === "off-peak") return { currentTime: "23:30" };
  if (type === "alert") return { balance: 80 };
  if (type === "smart-convert") return { daysToExpiry: 5, balance: 250 };
  if (type === "orchestration") return { balance: 120, daysToExpiry: 4 };
  if (type === "webhook") return { balance: 40 };
  return { usageThisMonth: 275 };
}

const toMinutes = (t: string) => {
  const [h = "0", m = "0"] = t.split(":");
  return Number(h) * 60 + Number(m);
};

export function evaluatePolicy(policy: Policy, s: Scenario): SimulationResult {
  const steps: string[] = [`Scope: ${scopeLabel(policy.scope)}`];
  if (!policy.isActive) {
    return {
      triggered: false,
      action: "—",
      impact: "Policy is inactive, so it is never evaluated.",
      steps: [...steps, "Policy status is Inactive"],
    };
  }

  switch (policy.type) {
    case "auto-convert": {
      const days = s.daysToExpiry ?? 0;
      const limit = policy.daysBeforeExpiry ?? 3;
      const balance = s.balance ?? 0;
      const floor = policy.minRemaining ?? 0;
      const rate = policy.conversionRate ?? 0.85;
      steps.push(`Days until expiry: ${days} (trigger at ${limit})`);
      steps.push(`Balance ${balance.toFixed(2)} vs minimum ${floor.toFixed(2)}`);
      const triggered = days <= limit && balance > floor;
      const converted = balance * rate;
      return {
        triggered,
        action: `Convert ${balance.toFixed(2)} credits to ${appName(policy.targetAppId ?? "claude")} at ${Math.round(rate * 100)}%`,
        impact: `Result: ${converted.toFixed(2)} ${appName(policy.targetAppId ?? "claude")} credits`,
        steps: [
          ...steps,
          triggered ? "Expiry window reached" : `Still ${days - limit} day(s) outside the window`,
        ],
      };
    }
    case "off-peak": {
      const now = s.currentTime ?? "12:00";
      const start = toMinutes(policy.startTime ?? "22:00");
      const end = toMinutes(policy.endTime ?? "06:00");
      const cur = toMinutes(now);
      const overnight = start > end;
      const inWindow = overnight ? cur >= start || cur < end : cur >= start && cur < end;
      steps.push(`Window ${policy.startTime} — ${policy.endTime} (${overnight ? "overnight" : "same day"})`);
      steps.push(`Simulated time: ${now}`);
      return {
        triggered: inWindow,
        action: "Route jobs to peak-restricted buckets first",
        impact: "Peak-restricted credits are drained before flexible credits.",
        steps: [...steps, inWindow ? "Time is inside the off-peak window" : "Time is outside the off-peak window"],
      };
    }
    case "alert": {
      const balance = s.balance ?? 0;
      const threshold = policy.threshold ?? 0;
      steps.push(`Balance ${balance.toFixed(2)} vs threshold ${threshold.toFixed(2)}`);
      const triggered = balance < threshold;
      return {
        triggered,
        action: `Notify via ${(policy.channels ?? []).join(", ") || "no channel"}`,
        impact: `Cooldown ${policy.cooldownMinutes ?? 60} minutes before the next alert.`,
        steps: [...steps, triggered ? "Balance is below the floor" : "Balance is above the floor"],
      };
    }
    case "ceiling": {
      const used = s.usageThisMonth ?? 0;
      const limit = policy.monthlyLimit ?? 0;
      steps.push(`Usage ${used.toFixed(2)} vs limit ${limit.toFixed(2)}`);
      steps.push(`Resets on day ${policy.resetDay ?? 1}`);
      const triggered = used >= limit;
      return {
        triggered,
        action: policy.blockExceeds ? "Block proxy requests until next month" : "Warn only",
        impact: triggered ? `Over by ${(used - limit).toFixed(2)} credits` : `${(limit - used).toFixed(2)} credits left`,
        steps: [...steps, triggered ? "Monthly limit exceeded" : "Below the monthly limit"],
      };
    }
    case "smart-convert": {
      const balance = s.balance ?? 0;
      const days = s.daysToExpiry ?? 0;
      const confidence = Math.min(1, 0.55 + (10 - Math.min(days, 10)) * 0.045);
      const floor = policy.minConfidence ?? 0.7;
      steps.push(`Optimising for ${policy.optimizeFor ?? "value"}`);
      steps.push(`Model confidence ${Math.round(confidence * 100)}% vs minimum ${Math.round(floor * 100)}%`);
      const triggered = confidence >= floor && balance > (policy.minRemaining ?? 0);
      return {
        triggered,
        action: "Convert to the best-value app selected by the engine",
        impact: triggered
          ? `Projected ${(balance * 0.95).toFixed(2)} credits retained after fees`
          : "Waiting for a higher-confidence window",
        steps,
      };
    }
    case "orchestration": {
      const chained = policy.chainedPolicyIds ?? [];
      steps.push(`Chain mode: ${policy.chainMode ?? "sequential"}`);
      steps.push(`${chained.length} policies in the chain`);
      return {
        triggered: chained.length > 0,
        action: `Run ${chained.length} chained policies`,
        impact: chained.length ? "Each chained policy is evaluated in priority order." : "Nothing to run.",
        steps,
      };
    }
    case "webhook": {
      const url = policy.webhookUrl ?? "";
      steps.push(url ? `Endpoint ${url}` : "No endpoint configured");
      steps.push(`Daily cap ${policy.maxExecutionsPerDay ?? 0 || "unlimited"}`);
      return {
        triggered: !!url,
        action: url ? `POST payload to ${url}` : "No action",
        impact: url ? "Signed JSON payload delivered with retry on 5xx." : "Configure an endpoint first.",
        steps,
      };
    }
  }
}

/* ---------------- Mock API ---------------- */

const API_URL = import.meta.env["VITE_API_URL"] as string | undefined;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const at = (iso: string) => iso;

let store: Policy[] = [
  {
    id: "policy-1",
    name: "Auto-convert before expiry",
    type: "auto-convert",
    scope: "all",
    isActive: true,
    priority: 0,
    daysBeforeExpiry: 3,
    targetAppId: "claude",
    conversionRate: 0.85,
    minRemaining: 0,
    createdAt: at("2026-08-01T10:00:00Z"),
    updatedAt: at("2026-08-03T14:30:00Z"),
    triggerCount: 12,
    lastTriggeredAt: at("2026-08-14T09:12:00Z"),
    successRate: 0.94,
  },
  {
    id: "policy-2",
    name: "Off-peak routing",
    type: "off-peak",
    scope: ["openai", "replicate"],
    isActive: true,
    priority: 1,
    startTime: "22:00",
    endTime: "06:00",
    timezone: "UTC",
    createdAt: at("2026-08-01T10:00:00Z"),
    updatedAt: at("2026-08-03T14:30:00Z"),
    triggerCount: 12,
    lastTriggeredAt: at("2026-08-14T09:12:00Z"),
    successRate: 0.94,
  },
  {
    id: "policy-3",
    name: "Low balance alert",
    type: "alert",
    scope: "all",
    isActive: false,
    priority: 2,
    threshold: 100,
    channels: ["email", "push"],
    cooldownMinutes: 60,
    createdAt: at("2026-08-01T10:00:00Z"),
    updatedAt: at("2026-08-03T14:30:00Z"),
    triggerCount: 12,
    lastTriggeredAt: at("2026-08-14T09:12:00Z"),
    successRate: 0.94,
  },
  {
    id: "policy-4",
    name: "Spend ceiling per app",
    type: "ceiling",
    scope: ["midjourney"],
    isActive: false,
    priority: 3,
    monthlyLimit: 250,
    resetDay: 1,
    blockExceeds: true,
    createdAt: at("2026-08-01T10:00:00Z"),
    updatedAt: at("2026-08-03T14:30:00Z"),
    triggerCount: 12,
    lastTriggeredAt: at("2026-08-14T09:12:00Z"),
    successRate: 0.94,
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

const sorted = () => [...store].sort((a, b) => a.priority - b.priority);

export const policyApi = {
  usingMockData: !API_URL,

  async getAll(): Promise<Policy[]> {
    if (!API_URL) {
      await wait(160);
      return sorted();
    }
    return request<Policy[]>("/policies");
  },

  async create(data: Policy): Promise<Policy> {
    if (!API_URL) {
      await wait(400);
      const policy: Policy = {
        ...data,
        id: `policy-${Date.now()}`,
        priority: store.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store = [...store, policy];
      return policy;
    }
    return request<Policy>("/policies", { method: "POST", body: JSON.stringify(data) });
  },

  async update(id: string, data: Policy): Promise<Policy> {
    if (!API_URL) {
      await wait(400);
      const next = { ...data, id, updatedAt: new Date().toISOString() };
      store = store.map((p) => (p.id === id ? next : p));
      return next;
    }
    return request<Policy>(`/policies/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  async remove(id: string): Promise<void> {
    if (!API_URL) {
      await wait(280);
      store = store.filter((p) => p.id !== id);
      return;
    }
    await request(`/policies/${id}`, { method: "DELETE" });
  },

  async toggle(id: string, isActive: boolean): Promise<void> {
    if (!API_URL) {
      await wait(200);
      store = store.map((p) => (p.id === id ? { ...p, isActive, updatedAt: new Date().toISOString() } : p));
      return;
    }
    await request(`/policies/${id}/toggle`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
  },

  async reorder(order: string[]): Promise<void> {
    if (!API_URL) {
      await wait(180);
      store = store.map((p) => ({ ...p, priority: order.indexOf(p.id) }));
      return;
    }
    await request("/policies/reorder", { method: "POST", body: JSON.stringify({ order }) });
  },
};
