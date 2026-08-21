import { useState } from "react";
import { CircleCheck, CircleX, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import {
  defaultScenario,
  evaluatePolicy,
  type Policy,
  type Scenario,
  type SimulationResult,
} from "@/lib/policies";
import { tierName, type PlanTier } from "@/lib/tiers";
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "./ui";

export function PolicySimulator({
  policy,
  onClose,
  tier = "free",
}: {
  policy: Policy;
  onClose: () => void;
  tier?: PlanTier;
}) {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario(policy.type));
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setRunning] = useState(false);

  const patch = (data: Partial<Scenario>) => setScenario((s) => ({ ...s, ...data }));

  const run = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 550));
    const evaluation = evaluatePolicy(policy, scenario);
    setResult(evaluation);
    setRunning(false);
    toast.info(`Policy test completed: ${evaluation.triggered ? "would trigger" : "would not trigger"}`);
  };

  return (
    <Modal
      title={`Test policy: ${policy.name}`}
      description="Run the rule against a simulated scenario without touching real credits."
      onClose={onClose}
      width="max-w-xl"
      footer={
        <>
          <GhostButton onClick={onClose}>Close</GhostButton>
          <PrimaryButton onClick={run} disabled={isRunning}>
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            {isRunning ? "Testing…" : "Run test"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        {policy.type === "auto-convert" && (
          <>
            <Field label={`Days until expiry: ${scenario.daysToExpiry ?? 0}`}>
              <input
                type="range"
                min={0}
                max={30}
                value={scenario.daysToExpiry ?? 0}
                onChange={(e) => patch({ daysToExpiry: Number(e.target.value) })}
                className="w-full accent-vault-teal"
              />
            </Field>
            <Field label="Bucket balance (credits)">
              <input
                type="number"
                className={inputClass}
                value={scenario.balance ?? 0}
                onChange={(e) => patch({ balance: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {policy.type === "off-peak" && (
          <Field label="Current time">
            <input
              type="time"
              className={inputClass}
              value={scenario.currentTime ?? "12:00"}
              onChange={(e) => patch({ currentTime: e.target.value })}
            />
          </Field>
        )}

        {policy.type === "alert" && (
          <Field label="Current balance (USD)">
            <input
              type="number"
              className={inputClass}
              value={scenario.balance ?? 0}
              onChange={(e) => patch({ balance: Number(e.target.value) })}
            />
          </Field>
        )}

        {policy.type === "orchestration" && (
          <>
            <Field label={`Days until expiry: ${scenario.daysToExpiry ?? 0}`}>
              <input
                type="range"
                min={0}
                max={30}
                value={scenario.daysToExpiry ?? 0}
                onChange={(e) => patch({ daysToExpiry: Number(e.target.value) })}
                className="w-full accent-vault-teal"
              />
            </Field>
            <Field label="Bucket balance (credits)">
              <input
                type="number"
                className={inputClass}
                value={scenario.balance ?? 0}
                onChange={(e) => patch({ balance: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {policy.type === "webhook" && (
          <Field label="Simulated balance (USD)">
            <input
              type="number"
              className={inputClass}
              value={scenario.balance ?? 0}
              onChange={(e) => patch({ balance: Number(e.target.value) })}
            />
          </Field>
        )}

        {policy.type === "ceiling" && (
          <Field label="Usage this month (USD)">
            <input
              type="number"
              className={inputClass}
              value={scenario.usageThisMonth ?? 0}
              onChange={(e) => patch({ usageThisMonth: Number(e.target.value) })}
            />
          </Field>
        )}

        {result && (
          <div
            className={`rounded-xl border p-4 ${
              result.triggered
                ? "border-vault-green/30 bg-vault-green/10"
                : "border-vault-border bg-vault-raised"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.triggered ? (
                <CircleCheck size={18} className="text-vault-green" />
              ) : (
                <CircleX size={18} className="text-vault-faint" />
              )}
              <span className="font-display text-sm font-semibold text-vault-foreground">
                Policy would {result.triggered ? "" : "NOT "}trigger
              </span>
            </div>
            {result.triggered && (
              <div className="mt-2 space-y-1 text-sm text-vault-muted">
                <p>Action: {result.action}</p>
                <p>Impact: {result.impact}</p>
              </div>
            )}
            <p className="mt-3 text-xs text-vault-amber">
              Simulated on your {tierName(tier)} plan — policies only alert, cap or report. They never move credits
              between providers.
            </p>
            <div className="mt-3 text-xs text-vault-faint">
              Evaluation steps
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {result.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function PolicyDeleteConfirm({
  policy,
  onCancel,
  onConfirm,
}: {
  policy: Policy;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title="Delete this policy?"
      description={`“${policy.name}” will stop protecting credits immediately. This cannot be undone.`}
      onClose={onCancel}
      width="max-w-md"
      footer={
        <>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-vault-danger px-4 py-2.5 text-sm font-medium text-vault-bg transition hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Delete
          </button>
        </>
      }
    >
      <p className="text-sm text-vault-muted">
        Any automation currently queued by this policy is cancelled. You can recreate it later from the wizard.
      </p>
    </Modal>
  );
}
