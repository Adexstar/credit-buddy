import { useState } from "react";
import { Field, Modal, PrimaryButton, GhostButton, inputClass } from "@/components/policies/ui";
import { SOURCE_TYPES, type CreditBucket, type BulkConvertPlan } from "@/lib/credits";
import { creditsApi } from "@/lib/credits";

export function AddCreditsModal({
  apps,
  onClose,
  onAdd,
}: {
  apps: string[];
  onClose: () => void;
  onAdd: (input: { appName: string; amount: number; sourceType: string; expiryDays: number }) => void;
}) {
  const [appName, setAppName] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceType, setSourceType] = useState<string>("Top-Up");
  const [expiryDays, setExpiryDays] = useState("30");

  const numeric = Number(amount);
  const days = Number(expiryDays);
  const valid = appName !== "" && numeric > 0 && days >= 1 && days <= 365;

  return (
    <Modal
      title="Add credits"
      description="Create a new bucket manually for an app."
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            disabled={!valid}
            onClick={() => {
              onAdd({ appName, amount: numeric, sourceType, expiryDays: days });
              onClose();
            }}
          >
            Add credits
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="App">
          <select className={inputClass} value={appName} onChange={(e) => setAppName(e.target.value)}>
            <option value="">Select app…</option>
            {apps.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Source type">
          <select className={inputClass} value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            {SOURCE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Expiry (days)" hint="Between 1 and 365 days.">
          <input className={inputClass} type="number" min="1" max="365" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

export function BulkConvertModal({
  buckets,
  apps,
  onClose,
  onConfirm,
}: {
  buckets: CreditBucket[];
  apps: string[];
  onClose: () => void;
  onConfirm: (target: string) => void;
}) {
  const options = apps.filter((a) => !(buckets.length > 0 && buckets.every((b) => b.appName === a)));
  const [target, setTarget] = useState(options[0] ?? "");
  const plan: BulkConvertPlan | null = target ? creditsApi.planBulkConvert(buckets, target) : null;
  const sources = Array.from(new Set(buckets.map((b) => b.appName))).join(", ");

  return (
    <Modal
      title="Bulk conversion"
      description={`Converting ${buckets.length} buckets from ${sources}`}
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            disabled={!target || !plan || plan.totalNet <= 0}
            onClick={() => {
              onConfirm(target);
              onClose();
            }}
          >
            Confirm bulk conversion
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Target app">
          <select className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}>
            {options.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        {plan && (
          <>
            <dl className="vault-raised space-y-2 rounded-xl p-4 text-sm">
              {[
                ["Total credits", buckets.reduce((s, b) => s + b.remaining, 0).toFixed(2)],
                ["Conversion rate", plan.rate.toFixed(3)],
                ["Platform fee (10%)", plan.totalFee.toFixed(2)],
                ["You receive", `${plan.totalNet.toFixed(2)} ${target}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-vault-muted">{label}</dt>
                  <dd className="vault-mono text-vault-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="text-[11px] tracking-[0.14em] text-vault-faint uppercase">New credits per bucket</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {plan.lines.map((line) => (
                  <li key={line.bucketId} className="flex items-center justify-between gap-3 text-vault-muted">
                    <span>
                      {line.appName} → {target}
                    </span>
                    <span className="vault-mono text-vault-foreground">{line.net.toFixed(2)} credits</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export function ConfirmDeleteModal({
  count,
  onClose,
  onConfirm,
}: {
  count: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title={`Delete ${count} bucket${count === 1 ? "" : "s"}?`}
      description="Deleted buckets and their remaining balance are removed from your ledger. This cannot be undone."
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-xl bg-vault-danger px-4 py-2.5 text-sm font-medium text-vault-bg transition hover:opacity-90"
          >
            Delete
          </button>
        </>
      }
    >
      <p className="text-sm text-vault-muted">Consider converting the balance instead if the credits are still usable.</p>
    </Modal>
  );
}
