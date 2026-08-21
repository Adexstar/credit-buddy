import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FlaskConical, Loader2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import {
  APP_OPTIONS,
  POLICY_TYPES,
  allowedChannels,
  isTypeAllowed,
  requiredTierFor,
  actionLabel,
  emptyPolicy,
  scopeLabel,
  triggerLabel,
  validatePolicy,
  type NotifyChannel,
  type Policy,
  type PolicyType,
} from "@/lib/policies";
import { PolicyTypeIcon } from "./PolicyCard";
import { TierBadge, UpgradePrompt } from "@/components/common/UpgradePrompt";
import { hasFeature, tierName, type PlanTier } from "@/lib/tiers";
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "./ui";

const CHANNELS: NotifyChannel[] = ["email", "push", "sms"];
const PRESET_DAYS = [3, 5, 7];
const PRESET_THRESHOLDS = [25, 50, 100];

export function PolicyWizard({
  policy,
  onClose,
  onSave,
  onTest,
  tier = "free",
  policies = [],
}: {
  policy: Policy | null;
  onClose: () => void;
  onSave: (draft: Policy) => Promise<void>;
  onTest: (draft: Policy) => void;
  tier?: PlanTier;
  policies?: Policy[];
}) {
  const editing = !!policy;
  const [step, setStep] = useState<1 | 2 | 3>(editing ? 2 : 1);
  const [draft, setDraft] = useState<Policy>(policy ?? emptyPolicy("auto-convert"));
  const [saving, setSaving] = useState(false);

  const errors = useMemo(() => validatePolicy(draft), [draft]);
  const typeLocked = !isTypeAllowed(draft.type, tier);
  const customTriggers = hasFeature(tier, "custom_triggers");
  const channels = allowedChannels(tier);
  const patch = (data: Partial<Policy>) => setDraft((d) => ({ ...d, ...data }));

  const chooseType = (type: PolicyType) => {
    if (!isTypeAllowed(type, tier)) {
      toast.warning(`${POLICY_TYPES.find((t) => t.id === type)!.label} requires the ${tierName(requiredTierFor(type))} plan.`);
      return;
    }
    setDraft((d) => ({ ...emptyPolicy(type), name: d.name && editing ? d.name : emptyPolicy(type).name }));
  };

  const specific = draft.scope !== "all";
  const selectedApps = specific ? (draft.scope as string[]) : [];

  const submit = async () => {
    if (typeLocked) {
      toast.warning(`${tierName(requiredTierFor(draft.type))} plan required for this policy type.`);
      return;
    }
    if (errors.length) {
      toast.warning("Policy configuration incomplete. Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } catch (error) {
      toast.error(`Failed to save policy: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? `Edit policy` : "New automation policy"}
      description={
        step === 1
          ? "What type of policy do you want to create?"
          : step === 2
            ? "Configure when the policy fires and what it does."
            : "Review the configuration before saving."
      }
      onClose={onClose}
      footer={
        <>
          <span className="mr-auto vault-mono text-xs text-vault-faint">Step {step} of 3</span>
          {step > 1 && (
            <GhostButton onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>
              <ArrowLeft size={16} /> Back
            </GhostButton>
          )}
          {step === 1 && (
            <PrimaryButton onClick={() => setStep(2)}>
              Continue <ArrowRight size={16} />
            </PrimaryButton>
          )}
          {step === 2 && (
            <>
              <GhostButton onClick={() => onTest(draft)}>
                <FlaskConical size={16} /> Test policy
              </GhostButton>
              <PrimaryButton disabled={errors.length > 0 || typeLocked} onClick={() => setStep(3)}>
                Review <ArrowRight size={16} />
              </PrimaryButton>
            </>
          )}
          {step === 3 && (
            <PrimaryButton disabled={saving || errors.length > 0 || typeLocked} onClick={submit}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Saving…" : editing ? "Save changes" : "Create policy"}
            </PrimaryButton>
          )}
          {step !== 1 && <GhostButton onClick={onClose}>Cancel</GhostButton>}
        </>
      }
    >
      {step === 1 && (
        <div className="grid gap-3">
          {POLICY_TYPES.map((type) => {
            const locked = !isTypeAllowed(type.id, tier);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => chooseType(type.id)}
                aria-disabled={locked}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  draft.type === type.id
                    ? "border-vault-teal/50 bg-vault-teal/5"
                    : locked
                      ? "border-vault-border bg-vault-raised/50 opacity-70"
                      : "border-vault-border bg-vault-raised hover:border-vault-teal/30"
                }`}
              >
                <PolicyTypeIcon type={type.id} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-vault-foreground">{type.label}</span>
                    {type.requiredTier !== "free" && <TierBadge tier={type.requiredTier} />}
                  </span>
                  <span className="mt-1 block text-sm text-vault-muted">{type.blurb}</span>
                </span>
                <span
                  className={`mt-1 flex size-5 items-center justify-center rounded-full border ${
                    draft.type === type.id
                      ? "border-vault-teal bg-vault-teal text-vault-bg"
                      : "border-vault-border text-vault-faint"
                  }`}
                >
                  {draft.type === type.id ? <Check size={12} /> : locked ? <Lock size={11} /> : null}
                </span>
              </button>
            );
          })}
          <UpgradePrompt
            requiredTier={tier === "free" ? "premium" : "pro"}
            reason={`You are on the ${tierName(tier)} plan. Higher tiers unlock spend ceilings, orchestration and webhooks.`}
            compact
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Field label="Policy name">
            <input
              className={inputClass}
              value={draft.name}
              maxLength={100}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Auto-convert before expiry"
            />
          </Field>

          <Field label="Scope">
            <div className="space-y-2">
              <div className="flex gap-2">
                {(["all", "specific"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => patch({ scope: mode === "all" ? "all" : [] })}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      (mode === "all") === !specific
                        ? "bg-vault-teal/10 text-vault-teal"
                        : "border border-vault-border text-vault-muted"
                    }`}
                  >
                    {mode === "all" ? "All apps" : "Specific apps"}
                  </button>
                ))}
              </div>
              {specific && (
                <div className="flex flex-wrap gap-2">
                  {APP_OPTIONS.map((app) => {
                    const on = selectedApps.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          patch({
                            scope: on ? selectedApps.filter((a) => a !== app.id) : [...selectedApps, app.id],
                          })
                        }
                        className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                          on
                            ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                            : "border-vault-border text-vault-muted hover:text-vault-foreground"
                        }`}
                      >
                        {app.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Field>

          {draft.type === "expiry-reminder" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`Days before expiry: ${draft.daysBeforeExpiry ?? 3}`}>
                {customTriggers ? (
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={draft.daysBeforeExpiry ?? 3}
                    onChange={(e) => patch({ daysBeforeExpiry: Number(e.target.value) })}
                    className="w-full accent-vault-teal"
                  />
                ) : (
                  <div className="flex gap-2">
                    {PRESET_DAYS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => patch({ daysBeforeExpiry: d })}
                        className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                          (draft.daysBeforeExpiry ?? 3) === d
                            ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                            : "border-vault-border text-vault-muted"
                        }`}
                      >
                        {d} days
                      </button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Only alert above (credits)">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={draft.minRemaining ?? 0}
                  onChange={(e) => patch({ minRemaining: Number(e.target.value) })}
                />
              </Field>
            </div>
          )}

          {draft.type === "off-peak" && (
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Start time">
                <input
                  type="time"
                  className={inputClass}
                  value={draft.startTime ?? "22:00"}
                  onChange={(e) => patch({ startTime: e.target.value })}
                />
              </Field>
              <Field label="End time">
                <input
                  type="time"
                  className={inputClass}
                  value={draft.endTime ?? "06:00"}
                  onChange={(e) => patch({ endTime: e.target.value })}
                />
              </Field>
              <Field label="Timezone">
                <select
                  className={inputClass}
                  value={draft.timezone ?? "UTC"}
                  onChange={(e) => patch({ timezone: e.target.value })}
                >
                  {["UTC", "Europe/London", "America/New_York", "Africa/Lagos", "Asia/Singapore"].map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {draft.type === "alert" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Threshold amount (USD)">
                {customTriggers ? (
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={draft.threshold ?? 0}
                    onChange={(e) => patch({ threshold: Number(e.target.value) })}
                  />
                ) : (
                  <div className="flex gap-2">
                    {PRESET_THRESHOLDS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => patch({ threshold: t })}
                        className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                          (draft.threshold ?? 0) === t
                            ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                            : "border-vault-border text-vault-muted"
                        }`}
                      >
                        ${t}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
              <Field label="Cooldown (minutes)">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={draft.cooldownMinutes ?? 60}
                  onChange={(e) => patch({ cooldownMinutes: Number(e.target.value) })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Notification channels">
                  <div className="flex gap-2">
                    {CHANNELS.map((c) => {
                      const on = (draft.channels ?? []).includes(c);
                      const locked = !channels.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={on}
                          aria-disabled={locked}
                          title={locked ? `${c} alerts require a higher plan` : undefined}
                          onClick={() =>
                            locked
                              ? toast.warning(`${c} alerts require a higher plan.`)
                              :
                            patch({
                              channels: on
                                ? (draft.channels ?? []).filter((x) => x !== c)
                                : [...(draft.channels ?? []), c],
                            })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs capitalize transition ${
                            on
                              ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                              : locked
                                ? "border-vault-border text-vault-faint opacity-70"
                                : "border-vault-border text-vault-muted"
                          }`}
                        >
                          {locked && <Lock size={11} />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {draft.type === "ceiling" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Monthly limit (USD)">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={draft.monthlyLimit ?? 0}
                  onChange={(e) => patch({ monthlyLimit: Number(e.target.value) })}
                />
              </Field>
              <Field label="Reset day of month (1-28)">
                <input
                  type="number"
                  min={1}
                  max={28}
                  className={inputClass}
                  value={draft.resetDay ?? 1}
                  onChange={(e) => patch({ resetDay: Number(e.target.value) })}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-vault-muted">
                <input
                  type="checkbox"
                  checked={draft.blockExceeds ?? true}
                  onChange={(e) => patch({ blockExceeds: e.target.checked })}
                  className="accent-vault-teal"
                />
                Block requests until next month
              </label>
            </div>
          )}


          {draft.type === "orchestration" && (
            <div className="space-y-4">
              <Field label="Chain mode">
                <div className="flex gap-2">
                  {(["sequential", "parallel"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => patch({ chainMode: mode })}
                      className={`rounded-full px-3 py-1.5 text-xs capitalize transition ${
                        (draft.chainMode ?? "sequential") === mode
                          ? "bg-vault-teal/10 text-vault-teal"
                          : "border border-vault-border text-vault-muted"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Chained policies" hint="Run these in priority order when this policy fires">
                <div className="flex flex-wrap gap-2">
                  {policies
                    .filter((p) => p.id && p.id !== draft.id)
                    .map((p) => {
                      const on = (draft.chainedPolicyIds ?? []).includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            patch({
                              chainedPolicyIds: on
                                ? (draft.chainedPolicyIds ?? []).filter((x) => x !== p.id)
                                : [...(draft.chainedPolicyIds ?? []), p.id],
                            })
                          }
                          className={`rounded-xl border px-3 py-1.5 text-xs transition ${
                            on
                              ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                              : "border-vault-border text-vault-muted hover:text-vault-foreground"
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  {policies.length === 0 && <span className="text-xs text-vault-faint">No other policies yet.</span>}
                </div>
              </Field>
            </div>
          )}

          {draft.type === "webhook" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Endpoint URL" hint="Must be https://">
                  <input
                    className={inputClass}
                    placeholder="https://api.example.com/hooks/credits"
                    value={draft.webhookUrl ?? ""}
                    onChange={(e) => patch({ webhookUrl: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Signing secret" hint="Sent as X-Signature header">
                <input
                  className={inputClass}
                  value={draft.webhookSecret ?? ""}
                  onChange={(e) => patch({ webhookSecret: e.target.value })}
                />
              </Field>
              <Field label="Max executions per day">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={draft.maxExecutionsPerDay ?? 0}
                  onChange={(e) => patch({ maxExecutionsPerDay: Number(e.target.value) })}
                />
              </Field>
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-vault-border bg-vault-bg/40 p-4">
            <p className="flex items-center gap-2 text-xs tracking-wide text-vault-faint uppercase">
              Advanced {!customTriggers && <Lock size={12} />}
            </p>
            {customTriggers ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Cooldown (minutes)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={draft.cooldownMinutes ?? 0}
                    onChange={(e) => patch({ cooldownMinutes: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Max executions per day" hint="0 = unlimited">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={draft.maxExecutionsPerDay ?? 0}
                    onChange={(e) => patch({ maxExecutionsPerDay: Number(e.target.value) })}
                  />
                </Field>
                {hasFeature(tier, "priority_execution") && (
                  <Field label="Priority" hint="Higher runs first">
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={draft.priority ?? 0}
                      onChange={(e) => patch({ priority: Number(e.target.value) })}
                    />
                  </Field>
                )}
                {hasFeature(tier, "custom_triggers") && (
                  <div className="sm:col-span-2">
                    <Field label="Extra conditions" hint="e.g. balance > 100 AND app = openai">
                      <input
                        className={inputClass}
                        value={draft.conditions ?? ""}
                        onChange={(e) => patch({ conditions: e.target.value })}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ) : (
              <UpgradePrompt
                requiredTier="premium"
                reason="Cooldowns, execution caps and custom conditions are locked on Free."
                compact
              />
            )}
          </div>

          {typeLocked && (
            <UpgradePrompt
              requiredTier={requiredTierFor(draft.type)}
              reason="This policy type is not available on your current plan."
              compact
            />
          )}

          {errors.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-vault-amber/30 bg-vault-amber/10 p-3 text-xs text-vault-amber">
              {errors.map((e) => (
                <li key={e} className="flex items-center gap-2">
                  <TriangleAlert size={13} /> {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="vault-raised space-y-4 p-4">
          <div className="flex items-center gap-3">
            <PolicyTypeIcon type={draft.type} />
            <div>
              <p className="font-display text-base font-semibold text-vault-foreground">{draft.name}</p>
              <p className="text-xs text-vault-faint">{POLICY_TYPES.find((t) => t.id === draft.type)?.label}</p>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Scope", scopeLabel(draft.scope)],
              ["Trigger", triggerLabel(draft)],
              ["Action", actionLabel(draft)],
              ["Status", draft.isActive ? "Active" : "Inactive"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-vault-faint">{k}</dt>
                <dd className="mt-0.5 text-sm text-vault-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="flex items-center gap-2 text-sm text-vault-muted">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
              className="accent-vault-teal"
            />
            Enable this policy right away
          </label>
        </div>
      )}
    </Modal>
  );
}
