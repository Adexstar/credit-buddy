/** Plan tiers: limits, features and gating helpers shared by policies and billing. */

export type PlanTier = "free" | "premium" | "pro";

export type TierFeature =
  | "push_notifications"
  | "sms_alerts"
  | "custom_triggers"
  | "spend_ceiling"
  | "policy_groups"
  | "expiry_forecast"
  | "orchestration"
  | "webhooks"
  | "policy_api"
  | "advanced_analytics"
  | "priority_execution"
  | "team_sharing";

export interface TierLimits {
  id: PlanTier;
  name: string;
  price: number;
  annualPrice: number;
  /** Bucket history retention in days. */
  historyDays: number;
  maxPolicies: number;
  teamMembers: number;
  rollover: string;
  support: string;
  features: Record<TierFeature, boolean>;
  highlights: string[];
}

const F = (on: TierFeature[]): Record<TierFeature, boolean> => {
  const all: TierFeature[] = [
    "push_notifications",
    "sms_alerts",
    "custom_triggers",
    "spend_ceiling",
    "policy_groups",
    "expiry_forecast",
    "orchestration",
    "webhooks",
    "policy_api",
    "advanced_analytics",
    "priority_execution",
    "team_sharing",
  ];
  return all.reduce(
    (acc, key) => ({ ...acc, [key]: on.includes(key) }),
    {} as Record<TierFeature, boolean>,
  );
};

export const UNLIMITED = 9999;

export const TIER_LIMITS: Record<PlanTier, TierLimits> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    annualPrice: 0,
    historyDays: 30,
    maxPolicies: 2,
    teamMembers: 1,
    rollover: "50%",
    support: "Email",
    features: F([]),
    highlights: ["2 active policies", "30 days of history", "Email alerts", "Expiry tracking for every bucket"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 5,
    annualPrice: 50,
    historyDays: 365,
    maxPolicies: 15,
    teamMembers: 3,
    rollover: "100%",
    support: "Priority",
    features: F(["push_notifications", "custom_triggers", "spend_ceiling", "policy_groups", "team_sharing"]),
    highlights: [
      "15 active policies",
      "1 year of history",
      "Push notifications & custom triggers",
      "Spend ceilings + 3 team seats",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 15,
    annualPrice: 150,
    historyDays: 1095,
    maxPolicies: UNLIMITED,
    teamMembers: UNLIMITED,
    rollover: "100%",
    support: "Priority + Slack",
    features: F([
      "push_notifications",
      "sms_alerts",
      "custom_triggers",
      "spend_ceiling",
      "policy_groups",
      "expiry_forecast",
      "orchestration",
      "webhooks",
      "policy_api",
      "advanced_analytics",
      "priority_execution",
      "team_sharing",
    ]),
    highlights: [
      "Unlimited policies & team",
      "3 years of history",
      "Expiry forecasting + orchestration",
      "Webhooks, policy API, advanced analytics",
    ],
  },
};

export const TIER_ORDER: PlanTier[] = ["free", "premium", "pro"];

export const TIERS = TIER_ORDER.map((t) => TIER_LIMITS[t]);

export const tierRank = (tier: PlanTier) => TIER_ORDER.indexOf(tier);

export const tierName = (tier: PlanTier) => TIER_LIMITS[tier].name;

export const hasFeature = (tier: PlanTier, feature: TierFeature) => TIER_LIMITS[tier].features[feature];

export const maxPolicies = (tier: PlanTier) => TIER_LIMITS[tier].maxPolicies;

export const canCreatePolicy = (tier: PlanTier, activeCount: number) => activeCount < maxPolicies(tier);

export const limitLabel = (value: number) => (value >= UNLIMITED ? "Unlimited" : String(value));

/** Lowest tier that unlocks a feature. */
export function tierForFeature(feature: TierFeature): PlanTier {
  return TIER_ORDER.find((t) => TIER_LIMITS[t].features[feature]) ?? "pro";
}

/* Active tier — set once settings load, read outside React. */
let activeTier: PlanTier = "premium";
export const setActiveTier = (tier: PlanTier) => {
  activeTier = tier;
};
export const getActiveTier = () => activeTier;
