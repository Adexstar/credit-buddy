import { Lock, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { TIER_LIMITS, tierName, type PlanTier } from "@/lib/tiers";

export function TierBadge({ tier, className = "" }: { tier: PlanTier; className?: string }) {
  const tone =
    tier === "pro"
      ? "border-vault-purple/40 bg-vault-purple/10 text-vault-purple"
      : tier === "premium"
        ? "border-vault-amber/40 bg-vault-amber/10 text-vault-amber"
        : "border-vault-border text-vault-faint";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone} ${className}`}>
      {tierName(tier)}
    </span>
  );
}

/** Inline banner shown where a feature or limit is locked behind a higher tier. */
export function UpgradePrompt({
  requiredTier,
  reason,
  compact,
}: {
  requiredTier: PlanTier;
  reason: string;
  compact?: boolean;
}) {
  const plan = TIER_LIMITS[requiredTier];
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-vault-amber/30 bg-vault-amber/5 ${
        compact ? "px-3 py-2" : "p-4"
      }`}
    >
      <Lock size={compact ? 14 : 16} className="shrink-0 text-vault-amber" />
      <p className="min-w-0 flex-1 text-xs text-vault-muted">
        {reason}{" "}
        <span className="text-vault-foreground">
          Available on {plan.name} ({plan.price === 0 ? "Free" : `$${plan.price}/mo`}).
        </span>
      </p>
      <Link
        to="/settings"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-vault-teal px-2.5 py-1.5 text-xs font-medium text-vault-bg transition hover:bg-vault-teal-deep"
      >
        <Sparkles size={13} /> Upgrade
      </Link>
    </div>
  );
}
