# Three-Tier Policies & Billing Upgrade

Bring the dashboard in line with the pasted policy-engine spec: three plans (Free, Premium, Pro) with real limits, tier-gated policy types, and a billing page that reflects them. Frontend only, still on mock data.

## Plans and limits

| | Free | Premium | Pro |
|---|---|---|---|
| Price | $0 | $9/mo | $29/mo |
| Max active policies | 2 | 15 | Unlimited |
| Platform conversion fee | 10% | 8% | 5% |
| Team members | 1 | 3 | Unlimited |
| Channels | Email | Email + Push | Email + Push + SMS |
| Extras | — | Spend ceiling, policy groups, custom triggers | Smart (AI) conversion, orchestration, webhooks, policy API, advanced analytics |

## Policies improvements

- Expand policy types to the spec set: auto-convert (basic/advanced), low-balance alert (basic/advanced), off-peak (basic/advanced), spend ceiling (Premium), smart convert, orchestration, webhook action (Pro).
- Each type carries a required tier; the wizard shows locked cards with a "Premium"/"Pro" badge and an Upgrade action instead of hiding them.
- Enforce the active-policy cap: creating past the cap shows an upgrade prompt rather than a generic error.
- Gate advanced fields inside the wizard by tier (custom thresholds/time ranges, priority ordering, cooldown, max executions/day, webhook URL, condition builder).
- Policies page: usage meter ("3 of 15 policies"), tier pill in header, and per-policy execution stats (trigger count, last triggered, success rate) shown on the card and in the detail/simulator panel.
- Simulator reports the fee applied at the user's tier so upgrade value is visible.

## Billing improvements

- Replace the two-plan comparison with a three-column layout: current-plan highlight, annual/monthly toggle, feature rows grouped (Limits, Policies, Notifications, Team, Advanced).
- Locked features render with a muted dash-vs-check treatment instead of blank cells.
- Change-plan modal handles upgrade vs downgrade separately: downgrades list what will be disabled (policies over the new cap, blocked types, extra team members) and require confirmation.
- Usage summary card above the table: policies used, team seats used, conversion fee, next invoice date and amount.
- Billing history gains an invoice detail view (line items, plan period) and per-row download; keeps existing status pills.

## Technical notes

- `src/lib/settings.ts`: replace `plan: "free" | "premium"` with a `PlanTier = "free" | "premium" | "pro"` union, and extend `PLANS` into a tier table (limits, fee, features map) reused by both policies and billing. Update mock profile/billing/invoice fixtures.
- New `src/lib/tiers.ts` exporting `TIER_LIMITS`, `hasFeature(tier, key)`, `canCreatePolicy(tier, count)`, `allowedPolicyTypes(tier)`, `platformFee(tier)`.
- `src/lib/policies.ts`: widen `PolicyType`, add `requiredTier` to `POLICY_TYPES`, add optional `cooldownMinutes`, `maxExecutionsPerDay`, `webhookUrl`, `conditions`, `triggerCount`, `lastTriggeredAt`, `successRate`; extend `emptyPolicy` defaults and trigger/action labels for the new types.
- `src/lib/conversions.ts`: take the fee from `platformFee(tier)` instead of the hardcoded 10%.
- `PolicyContext` exposes the current tier (from settings/auth profile) plus `policyCount`/`limit`; wizard, cards and simulator read from it.
- Components touched: `PolicyWizard`, `PolicyCard`, `PolicyFilters`, `routes/policies.tsx`, `PlanComparison`, `BillingSection`, `BillingHistory`, `PlanComparison` rows, and the plan types in `useSettings`.
- Reuse existing Vault tokens and `components/policies/ui` primitives; add an `UpgradePrompt` shared component for locked states.
- No backend work: `src/api/*` signatures stay as-is so the real API can be swapped in later.
