import { useState } from "react";
import { Field, Modal, PrimaryButton, GhostButton, inputClass } from "@/components/policies/ui";
import { SOURCE_TYPES } from "@/lib/credits";

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
      <p className="text-sm text-vault-muted">Deleting only removes the bucket from this dashboard — it does not affect your provider account.</p>
    </Modal>
  );
}
