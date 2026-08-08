import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ConversionController } from "@/hooks/useConversion";

export function Step3Confirm({ c, onClose }: { c: ConversionController; onClose: () => void }) {
  if (c.result) {
    const r = c.result;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={22} className="text-vault-teal" />
          <h3 className="font-display text-lg font-semibold text-vault-foreground">Conversion complete</h3>
        </div>
        <p className="text-sm text-vault-muted">
          Successfully converted{" "}
          <span className="vault-mono text-vault-foreground">
            {r.amount.toFixed(2)} {r.sourceAppName}
          </span>{" "}
          credits to{" "}
          <span className="vault-mono text-vault-teal">
            {r.net.toFixed(2)} {r.targetAppName}
          </span>{" "}
          credits.
        </p>
        <div className="vault-mono rounded-xl border border-vault-border bg-vault-bg p-4 text-xs text-vault-muted">
          <p>Platform fee: {r.fee.toFixed(2)} credits</p>
          <p className="mt-1.5">New expiry: {new Date(r.expiry).toLocaleDateString()}</p>
          <p className="mt-1.5 text-vault-foreground">Transaction ID: {r.id}</p>
        </div>
      </div>
    );
  }

  const e = c.error;
  const canConvertAll = typeof e?.available === "number" && e.available > 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <XCircle size={22} className="text-vault-danger" />
        <h3 className="font-display text-lg font-semibold text-vault-foreground">Conversion failed</h3>
      </div>
      <p className="text-sm text-vault-muted">{e?.message ?? "Something went wrong."}</p>
      {canConvertAll && (
        <div className="vault-mono rounded-xl border border-vault-danger/30 bg-vault-danger/10 p-4 text-xs text-vault-muted">
          <p className="flex items-center gap-2 text-vault-danger">
            <AlertTriangle size={13} /> Insufficient balance
          </p>
          <p className="mt-2">Available: {e?.available?.toFixed(2)} credits</p>
          <p className="mt-1">Requested: {e?.requested?.toFixed(2)} credits</p>
        </div>
      )}
      <button type="button" onClick={onClose} className="sr-only">
        Close
      </button>
    </div>
  );
}
