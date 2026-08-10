import { Download } from "lucide-react";
import { GhostButton } from "@/components/policies/ui";
import type { Invoice } from "@/lib/settings";

const STATUS_STYLE: Record<Invoice["status"], string> = {
  paid: "border-vault-teal/30 bg-vault-teal/10 text-vault-teal",
  failed: "border-vault-danger/30 bg-vault-danger/10 text-vault-danger",
  refunded: "border-vault-amber/30 bg-vault-amber/10 text-vault-amber",
};

export function BillingHistory({ history, onDownloadAll }: { history: Invoice[]; onDownloadAll: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-vault-border bg-vault-bg/40 p-4">
      <ul className="divide-y divide-vault-border">
        {history.map((invoice) => (
          <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
            <span className="font-mono text-xs text-vault-muted">
              {new Date(invoice.date).toLocaleDateString()}
            </span>
            <span className="text-vault-foreground">${invoice.amount.toFixed(2)}</span>
            <span className="text-vault-muted">{invoice.plan}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${STATUS_STYLE[invoice.status]}`}>
              {invoice.status}
            </span>
          </li>
        ))}
        {history.length === 0 && <li className="py-3 text-sm text-vault-faint">No invoices yet.</li>}
      </ul>
      <GhostButton onClick={onDownloadAll}>
        <Download size={15} />
        Download all invoices
      </GhostButton>
    </div>
  );
}
