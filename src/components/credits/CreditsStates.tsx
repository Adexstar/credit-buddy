import { Inbox } from "lucide-react";
import { PrimaryButton } from "@/components/policies/ui";

export function CreditsLoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 rounded-xl bg-vault-raised" />
        </div>
      ))}
    </div>
  );
}

export function CreditsEmptyState({ onAdd, filtered }: { onAdd: () => void; filtered: boolean }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-vault-border bg-vault-raised text-vault-faint">
        <Inbox size={24} />
      </div>
      <h3 className="font-display mt-4 text-lg font-semibold text-vault-foreground">
        {filtered ? "No buckets match these filters" : "No credits found"}
      </h3>
      <p className="mt-2 text-sm text-vault-muted">
        {filtered ? "Try clearing a filter or widening the expiry window." : "Connect an app or add credits to get started."}
      </p>
      {!filtered && (
        <div className="mt-5 flex justify-center">
          <PrimaryButton onClick={onAdd}>Add credits</PrimaryButton>
        </div>
      )}
    </div>
  );
}
