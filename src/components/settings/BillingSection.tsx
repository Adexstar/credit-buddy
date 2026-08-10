import { useState } from "react";
import { CreditCard, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "@/components/policies/ui";
import { SectionHeader, SubHeading } from "@/components/settings/SettingsSidebar";
import { PlanComparison } from "@/components/settings/PlanComparison";
import { BillingHistory } from "@/components/settings/BillingHistory";
import { useSettings } from "@/hooks/useSettings";
import { PLANS } from "@/lib/settings";

export function ChangePlanModal({
  currentPlan,
  onClose,
  onConfirm,
  busy,
}: {
  currentPlan: "free" | "premium";
  onClose: () => void;
  onConfirm: (plan: "free" | "premium") => void;
  busy?: boolean;
}) {
  const [selected, setSelected] = useState<"free" | "premium">(currentPlan === "free" ? "premium" : "free");
  return (
    <Modal
      title="Change plan"
      description="Switch plans instantly — proration is applied on your next invoice."
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={() => onConfirm(selected)} disabled={busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            Switch to {PLANS.find((p) => p.id === selected)?.name}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelected(plan.id)}
            className={`rounded-xl border p-4 text-left transition ${
              selected === plan.id
                ? "border-vault-teal/50 bg-vault-teal/5"
                : "border-vault-border bg-vault-bg hover:border-vault-teal/30"
            }`}
          >
            <p className="font-display text-base font-semibold text-vault-foreground">{plan.name}</p>
            <p className="mt-1 text-sm text-vault-teal">{plan.price === 0 ? "Free" : `$${plan.price}/month`}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-vault-muted">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function AddPaymentModal({
  onClose,
  onAdd,
  busy,
}: {
  onClose: () => void;
  onAdd: (input: { type: string; last4: string; expiry: string }) => void;
  busy?: boolean;
}) {
  const [type, setType] = useState("Visa");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const valid = /^\d{12,19}$/.test(number.replace(/\s/g, "")) && /^\d{2}\/\d{4}$/.test(expiry);

  return (
    <Modal
      title="Add payment method"
      description="Demo only — no real card data is stored."
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            disabled={!valid || busy}
            onClick={() => onAdd({ type, last4: number.replace(/\s/g, "").slice(-4), expiry })}
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            Add card
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Card brand">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {["Visa", "Mastercard", "Amex"].map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Card number" hint="Digits only">
          <input
            className={inputClass}
            inputMode="numeric"
            maxLength={19}
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/[^\d]/g, ""))}
          />
        </Field>
        <Field label="Expiry" hint="MM/YYYY">
          <input
            className={inputClass}
            placeholder="12/2028"
            maxLength={7}
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

export function BillingSection() {
  const { billing, saving, changePlan, cancelSubscription, addPaymentMethod, removePaymentMethod } = useSettings();
  const [planModal, setPlanModal] = useState(false);
  const [payModal, setPayModal] = useState(false);

  if (!billing) return null;
  const plan = PLANS.find((p) => p.id === billing.plan) ?? PLANS[0]!;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<CreditCard size={18} />}
        title="Billing & subscription"
        description="Manage your plan, payment methods and invoice history."
      />

      <SubHeading>Current plan</SubHeading>
      <div className="rounded-xl border border-vault-teal/25 bg-vault-teal/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-display text-lg font-semibold text-vault-foreground">
              <Star size={16} className="text-vault-amber" />
              {plan.name}
            </p>
            <p className="mt-1 text-sm text-vault-teal">
              {billing.price === 0 ? "Free" : `$${billing.price.toFixed(2)}/month`}
            </p>
            <p className="mt-1 text-xs text-vault-faint">
              {billing.cancelled ? "Access ends" : "Next billing"} ·{" "}
              {new Date(billing.nextBilling).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton onClick={() => setPlanModal(true)}>Change plan</PrimaryButton>
            <GhostButton onClick={() => void cancelSubscription()} disabled={billing.cancelled || saving}>
              {billing.cancelled ? "Cancelled" : "Cancel subscription"}
            </GhostButton>
          </div>
        </div>
        <ul className="mt-4 grid gap-1.5 text-sm text-vault-muted sm:grid-cols-2">
          {plan.features.map((feature) => (
            <li key={feature}>✓ {feature}</li>
          ))}
        </ul>
      </div>

      <SubHeading>Plan comparison</SubHeading>
      <PlanComparison currentPlan={billing.plan} onSelect={(p) => void changePlan(p)} busy={saving} />

      <SubHeading>Payment method</SubHeading>
      <div className="space-y-3 rounded-xl border border-vault-border bg-vault-bg/40 p-4">
        {billing.paymentMethods.map((method) => (
          <div key={method.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-vault-blue" />
              <div>
                <p className="text-sm text-vault-foreground">
                  {method.type} ending in {method.last4}
                  {method.primary && <span className="ml-2 text-xs text-vault-teal">Primary</span>}
                </p>
                <p className="text-xs text-vault-faint">Expires {method.expiry}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void removePaymentMethod(method.id)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-vault-border px-2.5 py-1.5 text-xs text-vault-danger transition hover:bg-vault-danger/10 disabled:opacity-40"
            >
              <Trash2 size={13} />
              Remove
            </button>
          </div>
        ))}
        {billing.paymentMethods.length === 0 && (
          <p className="text-sm text-vault-faint">No payment method on file.</p>
        )}
        <GhostButton onClick={() => setPayModal(true)}>
          <Plus size={15} />
          Add new payment method
        </GhostButton>
      </div>

      <SubHeading>Billing history</SubHeading>
      <BillingHistory
        history={billing.history}
        onDownloadAll={() => toast.success("📊 Invoices are downloading")}
      />

      {planModal && (
        <ChangePlanModal
          currentPlan={billing.plan}
          busy={saving}
          onClose={() => setPlanModal(false)}
          onConfirm={async (p) => {
            await changePlan(p);
            setPlanModal(false);
          }}
        />
      )}
      {payModal && (
        <AddPaymentModal
          busy={saving}
          onClose={() => setPayModal(false)}
          onAdd={async (input) => {
            await addPaymentMethod(input);
            setPayModal(false);
          }}
        />
      )}
    </div>
  );
}
