import { Fragment } from "react";
import { Check, Minus, Star } from "lucide-react";
import { TIERS, limitLabel, type PlanTier } from "@/lib/tiers";

type Group = {
  group: string;
  rows: { label: string; render: (tier: (typeof TIERS)[number]) => string | boolean }[];
};

const GROUPS: Group[] = [
  {
    group: "Limits",
    rows: [
      { label: "Active policies", render: (t) => limitLabel(t.maxPolicies) },
      { label: "History retention", render: (t) => `${t.historyDays} days` },
      { label: "Credit rollover", render: (t) => t.rollover },
    ],
  },
  {
    group: "Policies",
    rows: [
      { label: "Spend ceilings", render: (t) => t.features.spend_ceiling },
      { label: "Custom triggers", render: (t) => t.features.custom_triggers },
      { label: "Policy groups", render: (t) => t.features.policy_groups },
      { label: "Expiry forecasting", render: (t) => t.features.expiry_forecast },
      { label: "Orchestration", render: (t) => t.features.orchestration },
      { label: "Priority execution", render: (t) => t.features.priority_execution },
    ],
  },
  {
    group: "Notifications",
    rows: [
      { label: "Email alerts", render: () => true },
      { label: "Push notifications", render: (t) => t.features.push_notifications },
      { label: "SMS alerts", render: (t) => t.features.sms_alerts },
    ],
  },
  {
    group: "Team & support",
    rows: [
      { label: "Team seats", render: (t) => limitLabel(t.teamMembers) },
      { label: "Policy sharing", render: (t) => t.features.team_sharing },
      { label: "Support", render: (t) => t.support },
    ],
  },
  {
    group: "Advanced",
    rows: [
      { label: "Webhook actions", render: (t) => t.features.webhooks },
      { label: "Policy API", render: (t) => t.features.policy_api },
      { label: "Advanced analytics", render: (t) => t.features.advanced_analytics },
    ],
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={15} className="text-vault-teal" aria-label="Included" />
    ) : (
      <Minus size={15} className="text-vault-faint" aria-label="Not included" />
    );
  }
  return <span className="text-vault-foreground">{value}</span>;
}

export function PlanComparison({
  currentPlan,
  onSelect,
  busy,
  interval = "monthly",
  onIntervalChange,
}: {
  currentPlan: PlanTier;
  onSelect: (plan: PlanTier) => void;
  busy?: boolean;
  interval?: "monthly" | "annual";
  onIntervalChange?: (interval: "monthly" | "annual") => void;
}) {
  return (
    <div className="space-y-3">
      {onIntervalChange && (
        <div className="flex items-center gap-2">
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onIntervalChange(option)}
              className={`rounded-full px-3 py-1.5 text-xs capitalize transition ${
                interval === option
                  ? "bg-vault-teal/10 text-vault-teal"
                  : "border border-vault-border text-vault-muted hover:text-vault-foreground"
              }`}
            >
              {option}
              {option === "annual" && <span className="ml-1 text-vault-amber">−17%</span>}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-vault-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-vault-raised/60 text-left text-xs tracking-wide text-vault-faint uppercase">
              <th className="px-4 py-3 font-medium">Feature</th>
              {TIERS.map((tier) => (
                <th key={tier.id} className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-2 text-vault-foreground normal-case">
                    {tier.id === currentPlan && <Star size={13} className="text-vault-amber" />}
                    {tier.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-vault-teal normal-case">
                    {tier.price === 0
                      ? "Free"
                      : interval === "annual"
                        ? `$${tier.annualPrice}/yr`
                        : `$${tier.price}/mo`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => (
              <Fragment key={group.group}>
                <tr className="border-t border-vault-border bg-vault-bg/40">
                  <td
                    colSpan={TIERS.length + 1}
                    className="px-4 py-2 text-[11px] tracking-wide text-vault-faint uppercase"
                  >
                    {group.group}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={`${group.group}-${row.label}`} className="border-t border-vault-border">
                    <td className="px-4 py-2.5 text-vault-muted">{row.label}</td>
                    {TIERS.map((tier) => (
                      <td key={tier.id} className="px-4 py-2.5">
                        <Cell value={row.render(tier)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr className="border-t border-vault-border">
              <td className="px-4 py-3" />
              {TIERS.map((tier) => {
                const active = tier.id === currentPlan;
                return (
                  <td key={tier.id} className="px-4 py-3">
                    <button
                      type="button"
                      disabled={active || busy}
                      onClick={() => onSelect(tier.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? "border border-vault-teal/30 bg-vault-teal/10 text-vault-teal"
                          : "bg-vault-teal text-vault-bg hover:bg-vault-teal-deep disabled:opacity-40"
                      }`}
                    >
                      {active && <Check size={13} />}
                      {active ? "Current" : "Select"}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
