import { useEffect } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Modal, GhostButton, PrimaryButton } from "@/components/policies/ui";
import { Step1Selection } from "@/components/conversion/Step1Selection";
import { Step2Amount } from "@/components/conversion/Step2Amount";
import { Step3Confirm } from "@/components/conversion/Step3Confirm";
import { useConversion } from "@/hooks/useConversion";
import type { ConnectedApp, CreditBucket } from "@/lib/api";

const STEP_LABELS = ["Select source", "Amount & rate", "Confirm"];

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="mb-5 flex items-center gap-2" aria-label={`Step ${step} of 3`}>
      {STEP_LABELS.map((label, i) => {
        const index = i + 1;
        const active = index <= step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`vault-mono flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                active
                  ? "border-vault-teal bg-vault-teal/15 text-vault-teal"
                  : "border-vault-border bg-vault-raised text-vault-faint"
              }`}
            >
              {index}
            </span>
            <span className={`hidden text-xs sm:block ${active ? "text-vault-foreground" : "text-vault-faint"}`}>
              {label}
            </span>
            {index < STEP_LABELS.length && (
              <span className={`h-px flex-1 ${index < step ? "bg-vault-teal/60" : "bg-vault-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function CreditConversionModal({
  isOpen,
  onClose,
  buckets,
  apps,
  initialBucketId,
  onConverted,
  onConnectApp,
}: {
  isOpen: boolean;
  onClose: () => void;
  buckets: CreditBucket[];
  apps: ConnectedApp[];
  initialBucketId?: string;
  onConverted?: () => void;
  onConnectApp?: () => void;
}) {
  const c = useConversion({
    buckets,
    targetNames: apps.map((a) => a.name),
    initialBucketId,
    isOpen,
    onDone: onConverted,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (e.key === "Enter" && c.step < 3 && !c.isLoading) {
        e.preventDefault();
        c.next();
        return;
      }
      if (typing) return;
      if (e.key === "ArrowRight" && c.step < 3) c.next();
      if (e.key === "ArrowLeft" && c.step > 1) c.back();
      if (e.key === "1") c.setStep(1);
      if (e.key === "2" && c.bucket && c.targetApp) c.setStep(2);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, c]);

  if (!isOpen) return null;

  const noBuckets = c.eligible.length === 0;
  const noTargets = !noBuckets && c.targets.length === 0;

  const footer =
    c.step === 3 ? (
      c.result ? (
        <>
          <GhostButton onClick={c.convertMore}>Convert more</GhostButton>
          <PrimaryButton onClick={onClose}>Close</PrimaryButton>
        </>
      ) : (
        <>
          <GhostButton onClick={onClose}>Close</GhostButton>
          <PrimaryButton onClick={c.back}>Try again</PrimaryButton>
        </>
      )
    ) : noBuckets || noTargets ? (
      <>
        <GhostButton onClick={onClose}>Close</GhostButton>
        {noTargets && onConnectApp && (
          <PrimaryButton
            onClick={() => {
              onClose();
              onConnectApp();
            }}
          >
            Connect app
          </PrimaryButton>
        )}
      </>
    ) : (
      <>
        <GhostButton onClick={c.step === 1 ? onClose : c.back}>{c.step === 1 ? "Cancel" : "Back"}</GhostButton>
        <PrimaryButton
          onClick={c.next}
          disabled={c.isLoading || (c.step === 1 ? !c.bucket || !c.targetApp : !c.amountValid)}
        >
          {c.isLoading ? <Loader2 size={15} className="animate-spin" /> : <ArrowLeftRight size={15} />}
          {c.step === 1 ? "Continue" : c.isLoading ? "Converting…" : "Convert"}
        </PrimaryButton>
      </>
    );

  return (
    <Modal
      title="Convert credits"
      description={`Step ${c.step} of 3 · ${STEP_LABELS[c.step - 1]}`}
      onClose={onClose}
      footer={footer}
      width="max-w-[560px]"
    >
      <StepIndicator step={c.step} />

      {noBuckets ? (
        <p className="rounded-xl border border-vault-border bg-vault-raised p-4 text-sm text-vault-muted">
          <span className="font-display block text-base font-semibold text-vault-foreground">
            No available credits to convert
          </span>
          All your credit buckets are either empty, frozen, or belong to apps that cannot be converted.
        </p>
      ) : noTargets ? (
        <p className="rounded-xl border border-vault-border bg-vault-raised p-4 text-sm text-vault-muted">
          <span className="font-display block text-base font-semibold text-vault-foreground">
            No target apps available
          </span>
          You need to connect at least one other AI provider before converting credits.
        </p>
      ) : c.step === 1 ? (
        <Step1Selection c={c} />
      ) : c.step === 2 ? (
        <Step2Amount c={c} />
      ) : (
        <Step3Confirm c={c} onClose={onClose} />
      )}
    </Modal>
  );
}
