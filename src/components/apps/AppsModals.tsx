import { useState } from "react";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field, GhostButton, Modal, inputClass } from "@/components/policies/ui";
import type { ManagedApp } from "@/lib/apps";

export function RotateKeyModal({
  app,
  onRotate,
  onClose,
}: {
  app: ManagedApp;
  onRotate: (key: string) => Promise<void>;
  onClose: () => void;
}) {
  const [newKey, setNewKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [rotating, setRotating] = useState(false);

  const mismatch = confirmKey.length > 0 && newKey !== confirmKey;

  const handleRotate = async () => {
    if (newKey !== confirmKey) {
      toast.error("API keys do not match");
      return;
    }
    setRotating(true);
    try {
      await onRotate(newKey);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rotate key");
    } finally {
      setRotating(false);
    }
  };

  return (
    <Modal
      title="Rotate API key"
      description={`Replace the current API key for ${app.name}`}
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button
            type="button"
            disabled={rotating || newKey.trim().length < 12 || newKey !== confirmKey}
            onClick={() => void handleRotate()}
            className="inline-flex items-center gap-2 rounded-xl bg-vault-danger px-4 py-2.5 text-sm font-medium text-vault-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {rotating && <Loader2 size={14} className="animate-spin" />}
            {rotating ? "Rotating…" : "Rotate key"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Current key">
          <div className="flex items-center justify-between rounded-xl bg-vault-bg/60 p-3">
            <code className="font-mono text-sm text-vault-muted">sk-•••••••{app.keyTail.slice(-4)}</code>
            <span className={app.keyValid ? "text-xs text-vault-teal" : "text-xs text-vault-danger"}>
              {app.keyValid ? "Valid" : "Invalid"}
            </span>
          </div>
        </Field>

        <Field label="New API key" hint="Minimum 12 characters.">
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter new API key"
              maxLength={200}
              className={inputClass}
            />
            <button
              type="button"
              aria-label={showKey ? "Hide key" : "Show key"}
              onClick={() => setShowKey((v) => !v)}
              className="rounded-xl border border-vault-border px-3 text-vault-faint transition hover:text-vault-foreground"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="Confirm new API key" hint={mismatch ? "Keys do not match yet." : undefined}>
          <input
            type={showKey ? "text" : "password"}
            value={confirmKey}
            onChange={(e) => setConfirmKey(e.target.value)}
            placeholder="Confirm new API key"
            maxLength={200}
            className={`${inputClass} ${mismatch ? "border-vault-danger/60" : ""}`}
          />
        </Field>

        <div className="rounded-xl border border-vault-amber/30 bg-vault-amber/10 p-3 text-xs text-vault-amber">
          <p className="flex items-center gap-1.5 font-medium">
            <AlertTriangle size={13} /> Rotating your API key will:
          </p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
            <li>Immediately deactivate the current key</li>
            <li>Require updating all applications using this key</li>
            <li>Preserve all existing credits and data</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export function DisconnectConfirmModal({
  appName,
  count,
  busy,
  onConfirm,
  onClose,
}: {
  appName?: string;
  count?: number;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const target = appName ?? `${count} apps`;
  return (
    <Modal
      title={appName ? `Disconnect ${appName}?` : `Disconnect ${count} apps?`}
      description="All credits, buckets and settings tied to the connection will be removed."
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-vault-danger px-4 py-2.5 text-sm font-medium text-vault-bg transition hover:opacity-90 disabled:opacity-40"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Disconnect
          </button>
        </>
      }
    >
      <div className="rounded-xl border border-vault-danger/30 bg-vault-danger/10 p-4 text-sm text-vault-muted">
        <p className="flex items-center gap-2 font-medium text-vault-danger">
          <AlertTriangle size={15} /> This action cannot be undone
        </p>
        <p className="mt-2">You are about to disconnect {target} from your credit bank.</p>
      </div>
    </Modal>
  );
}
