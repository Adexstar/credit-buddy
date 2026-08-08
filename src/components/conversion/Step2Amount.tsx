import { Info } from "lucide-react";
import { MIN_CONVERSION, PLATFORM_FEE, TARGET_EXPIRY_DAYS } from "@/lib/conversions";
import type { ConversionController } from "@/hooks/useConversion";
import { inputClass } from "@/components/policies/ui";

export function FeeBreakdown({ c }: { c: ConversionController }) {
  const expiry = new Date(Date.now() + TARGET_EXPIRY_DAYS * 86400_000);
  return (
    <div className="rounded-xl border border-vault-border bg-vault-bg p-4">
      <h4 className="font-display text-sm font-semibold text-vault-foreground">Conversion preview</h4>
      <dl className="vault-mono mt-3 space-y-2 text-xs">
        <Row label="Source" value={`${c.numericAmount.toFixed(2)} ${c.bucket?.appName ?? ""} credits`} />
        <Row label="Rate" value={`${c.rate.toFixed(4)} (${(c.rate * 100).toFixed(0)}%)`} />
        <div className="border-t border-vault-border pt-2" />
        <Row label="Gross" value={`${c.gross.toFixed(2)} ${c.targetApp ?? ""} credits`} />
        <Row
          label={`Fee (${PLATFORM_FEE * 100}%)`}
          value={`-${c.fee.toFixed(2)} credits`}
          tone="text-vault-danger"
        />
        <div className="border-t border-vault-border pt-2" />
        <Row label="Net" value={`${c.net.toFixed(2)} ${c.targetApp ?? ""} credits`} tone="text-vault-teal" strong />
        <Row
          label="Expiry"
          value={`${expiry.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} (${TARGET_EXPIRY_DAYS} days)`}
        />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "text-vault-foreground",
  strong,
}: {
  label: string;
  value: string;
  tone?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-vault-muted">{label}</dt>
      <dd className={`${tone} ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}

export function Step2Amount({ c }: { c: ConversionController }) {
  const errorId = "conversion-amount-error";
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-vault-border bg-vault-raised p-4">
        <p className="text-sm text-vault-muted">
          Convert from{" "}
          <span className="font-display font-semibold text-vault-foreground">
            {c.bucket?.appName} — {c.bucket?.sourceType}
          </span>
        </p>
        <p className="vault-mono mt-1 text-xs text-vault-faint">Available: {c.available.toFixed(2)} credits</p>
      </div>

      <div>
        <label htmlFor="conversion-amount" className="text-xs font-medium tracking-wide text-vault-muted uppercase">
          Amount to convert
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="conversion-amount"
            type="number"
            min={0}
            max={c.available}
            step={0.01}
            inputMode="decimal"
            autoFocus
            value={c.amount}
            aria-invalid={c.exceeds}
            aria-describedby={c.exceeds ? errorId : undefined}
            onChange={(e) => c.setAmount(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
          <button
            type="button"
            onClick={c.useMax}
            className="shrink-0 rounded-xl border border-vault-border bg-vault-panel px-4 text-sm text-vault-muted transition hover:border-vault-teal/40 hover:text-vault-teal"
          >
            Max
          </button>
        </div>
        {c.exceeds && (
          <p id={errorId} className="mt-2 text-xs text-vault-danger">
            Amount exceeds the {c.available.toFixed(2)} credits available in this bucket.
          </p>
        )}
        {!c.exceeds && c.belowMinimum && (
          <p className="mt-2 text-xs text-vault-amber">Minimum conversion amount is {MIN_CONVERSION} credits.</p>
        )}
      </div>

      <div className="rounded-xl border border-vault-border bg-vault-raised p-4 text-sm">
        <p className="text-vault-muted">
          To <span className="font-display font-semibold text-vault-foreground">{c.targetApp}</span>
        </p>
        <p className="vault-mono mt-1 text-xs text-vault-faint">
          Rate: 1 {c.bucket?.appName} = {c.rate.toFixed(4)} {c.targetApp} credits · {c.rateSource}
        </p>
      </div>

      <FeeBreakdown c={c} />

      <p className="flex items-start gap-2 text-xs text-vault-faint">
        <Info size={13} className="mt-0.5 shrink-0" />
        This fee supports platform development and maintenance.
      </p>
    </div>
  );
}
