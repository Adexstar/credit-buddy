# Remove cross-provider conversion — reframe as a read-only AI spend dashboard

Goal: strip every credit-conversion mechanic out of the app and replace it with informational "View options" guidance. No value movement, no fee revenue, no virtual buckets.

## 1. Delete the conversion engine

Remove these files entirely:
- `src/lib/conversions.ts`
- `src/hooks/useConversion.ts`
- `src/api/conversions.ts`
- `src/components/conversion/` (modal + Step1/Step2/Step3)

Drop the `conversions` export from `src/api/index.ts`.

## 2. Credits page and bucket panel

- `src/lib/credits.ts`: delete `planBulkConvert`, `bulkConvert`, `BulkConvertPlan`, and the `getConversionRate` / `PLATFORM_FEE` imports. Remove `"Converted"` from `SOURCE_TYPES` (keep Subscription, Promo, Top-Up, Grant).
- `src/hooks/useCreditsManagement.ts`: drop `bulkConvert`.
- `src/components/credits/CreditsBulkActions.tsx`: remove "Convert selected".
- `src/components/credits/CreditsModals.tsx`: delete `BulkConvertModal`; fix the delete-modal copy that suggests converting.
- `src/components/credits/BucketDetailPanel.tsx`: replace the "Convert" button with "View options" that opens the new panel.
- `src/routes/credits.tsx`: remove conversion modal/state and update page + meta copy ("filter, sort and export" instead of "convert").

## 3. New "View options" panel

New `src/components/credits/SpendOptionsPanel.tsx` — purely informational, no actions that change balances:
- Expiry headline: "Your {app} credits expire in N days" with remaining balance.
- Static price-comparison rows per provider ($/1k tokens), sourced from a new `PROVIDER_PRICING` constant in `src/lib/apps.ts`.
- Buttons: "Use {app} now" (opens provider console in a new tab), "Buy credits" (provider purchase page), "Dismiss".

## 4. Policies

- `src/lib/policies.ts`: remove the `auto-convert`, `smart-convert` and conversion-based `orchestration` types, the `conversionRate` / `targetAppId` fields, their defaults, summaries, validation, simulator branches, and the auto-convert fixture policy. Keep off-peak routing, low-balance alerts, spend ceiling, same-provider consolidation, and webhooks (notification-only).
- `src/components/policies/PolicyWizard.tsx`, `PolicyCard.tsx`, `PolicyFilters.tsx`, `PolicySimulator.tsx`: remove conversion type cards, target-app/rate fields, fee lines, and conversion filter options.
- `src/routes/policies.tsx`: update copy that promises conversions.

## 5. Tiers and billing

- `src/lib/tiers.ts`: delete `platformFee`, the `smart_conversion` feature, and every "% conversion fee" highlight. Replace with SaaS value lines (policy count, team seats, push/webhook alerts, API access, advanced analytics).
- `src/components/settings/PlanComparison.tsx` and `BillingSection.tsx`: drop fee rows/columns and keep the feature matrix + monthly/annual toggle.

## 6. Mock data, dashboard, activity

- `src/lib/mock-data.ts`: remove the `conversion` transaction type and activity kind, the converted transaction/activity fixtures, the auto-convert policy fixture, and the "convert stranded credits" tip. Reframe the expiry activity as an alert ("18 credits expire in 2 days — review options").
- `src/components/dashboard/primitives.tsx`, `src/components/onboarding/OnboardingTour.tsx`, `src/hooks/useRealtimeCredits.ts`, `src/hooks/useWebSocket.ts`, `src/websocket/websocket.ts`: remove conversion event kinds/labels and conversion-related tour/notification copy.
- `src/routes/index.tsx`: remove the conversion modal, its state, the "Automate conversions" onboarding hint, and wire bucket actions to the new options panel.
- `src/components/settings/*` (Notifications, Export, Danger): remove conversion channels/columns/copy.

## 7. Sync stays read-only

Audit `src/lib/sync.ts` / `src/api/sync.ts` and remove any reconciliation or balance-adjustment logic so sync only records the provider-reported balance, the previous balance, and the difference.

## Notes

- Frontend-only change; there is no database in this project today, so the SQL drops in the brief have no counterpart to remove — the mock model is updated instead.
- Phase 3 items (analytics dashboard, optimization recommendations, provider comparison tools, reporting) are out of scope here and can follow once conversion is gone.
- Verification: typecheck plus a preview pass over Overview, Credits, Policies and Settings → Billing to confirm no "Convert" affordance or fee text remains.
