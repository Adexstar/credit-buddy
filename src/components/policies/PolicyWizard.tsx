import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, FlaskConical, Loader2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import {
  APP_OPTIONS,
  POLICY_TYPES,
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
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "./ui";

const CHANNELS: NotifyChannel[] = ["email", "push", "sms"];

export function PolicyWizard({
  policy,
  onClose,
  onSave,
  onTest,
}: {
  policy: Policy | null;
  onClose: () => void;
  onSave: (draft: Policy) => Promise<void>;
  onTest: (draft: Policy) => void;
}) {
  const editing = !!policy;
  const [step, setStep] = useState<1 | 2 | 3>(editing ? 2 : 1);
  const [draft, setDraft] = useState<Policy>(policy ?? emptyPolicy("auto-convert"));
  const [saving, setSaving] = useState(false);

  const errors = useMemo(() => validatePolicy(draft), [draft]);
  const patch = (data: Partial<Policy>) => setDraft((d) => ({ ...d, ...data }));

  const chooseType = (type: PolicyType) => {
    setDraft((d) => ({ ...emptyPolicy(type), name: d.name && editing ? d.name : emptyPolicy(type).name }));
  };

  const specific = draft.scope !== "all";
  const selectedApps = specific ? (draft.scope as string[]) : [];

  const submit = async () => {
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
              <PrimaryButton disabled={errors.length > 0} onClick={() => setStep(3)}>
                Review <ArrowRight size={16} />
              </PrimaryButton>
            </>
          )}
          {step === 3 && (
            <PrimaryButton disabled={saving || errors.length > 0} onClick={submit}>
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
          {POLICY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => chooseType(type.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                draft.type === type.id
                  ? "border-vault-teal/50 bg-vault-teal/5"
                  : "border-vault-border bg-vault-raised hover:border-vault-teal/30"
              }`}
            >
              <PolicyTypeIcon type={type.id} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-semibold text-vault-foreground">{type.label}</span>
                <span className="mt-1 block text-sm text-vault-muted">{type.blurb}</span>
              </span>
              <span
                className={`mt-1 flex size-5 items-center justify-center rounded-full border ${
                  draft.type === type.id ? "border-vault-teal bg-vault-teal text-vault-bg" : "border-vault-border"
                }`}
              >
                {draft.type === type.id && <Check size={12} />}
              </span>
            </button>
          ))}
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

          {draft.type === "auto-convert" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`Days before expiry: ${draft.daysBeforeExpiry ?? 3}`}>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={draft.daysBeforeExpiry ?? 3}
                  onChange={(e) => patch({ daysBeforeExpiry: Number(e.target.value) })}
                  className="w-full accent-vault-teal"
                />
              </Field>
              <Field label="Target app">
                <select
                  className={inputClass}
                  value={draft.targetAppId ?? ""}
                  onChange={(e) => patch({ targetAppId: e.target.value })}
                >
                  {APP_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Conversion rate: ${Math.round((draft.conversionRate ?? 0.85) * 100)}%`}>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={Math.round((draft.conversionRate ?? 0.85) * 100)}
                  onChange={(e) => patch({ conversionRate: Number(e.target.value) / 100 })}
                  className="w-full accent-vault-teal"
                />
              </Field>
              <Field label="Only convert above (credits)">
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
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={draft.threshold ?? 0}
                  onChange={(e) => patch({ threshold: Number(e.target.value) })}
                />
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
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            patch({
                              channels: on
                                ? (draft.channels ?? []).filter((x) => x !== c)
                                : [...(draft.channels ?? []), c],
                            })
                          }
                          className={`rounded-xl border px-3 py-1.5 text-xs capitalize transition ${
                            on
                              ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                              : "border-vault-border text-vault-muted"
                          }`}
                        >
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
