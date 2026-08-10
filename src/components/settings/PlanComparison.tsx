import { Check } from "lucide-react";
import { PLANS } from "@/lib/settings";

const ROWS = [
  { label: "Rollover", get: (p: (typeof PLANS)[number]) => p.rollover },
  { label: "Policies", get: (p: (typeof PLANS)[number]) => p.policies },
  { label: "Team", get: (p: (typeof PLANS)[number]) => p.team },
  { label: "Support", get: (p: (typeof PLANS)[number]) => p.support },
  { label: "Price", get: (p: (typeof PLANS)[number]) => (p.price === 0 ? "Free" : `$${p.price}/mo`) },
];

export function PlanComparison({
  currentPlan,
  onSelect,
  busy,
}: {
  currentPlan: "free" | "premium";
  onSelect: (plan: "free" | "premium") => void;
  busy?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-vault-border">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="bg-vault-raised/60 text-left text-xs tracking-wide text-vault-faint uppercase">
            <th className="px-4 py-3 font-medium">Feature</th>
            {PLANS.map((plan) => (
              <th key={plan.id} className="px-4 py-3 font-medium">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-vault-border">
              <td className="px-4 py-3 text-vault-muted">{row.label}</td>
              {PLANS.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-vault-foreground">
                  {row.get(plan)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-vault-border">
            <td className="px-4 py-3" />
            {PLANS.map((plan) => {
              const active = plan.id === currentPlan;
              return (
                <td key={plan.id} className="px-4 py-3">
                  <button
                    type="button"
                    disabled={active || busy}
                    onClick={() => onSelect(plan.id)}
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
  );
}
