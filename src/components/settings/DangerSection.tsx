import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Field, GhostButton, Modal, inputClass } from "@/components/policies/ui";
import { SectionHeader, SubHeading } from "@/components/settings/SettingsSidebar";
import { useSettingsContext } from "@/context/SettingsContext";
import { settingsApi } from "@/lib/settings";

export function DeleteAccountModal({
  onConfirm,
  onClose,
  busy,
}: {
  onConfirm: (password: string) => void;
  onClose: () => void;
  busy?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const ready = password.length > 0 && confirmText === "DELETE";

  return (
    <Modal
      title="Delete account"
      description="This action is permanent and cannot be undone."
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => onConfirm(password)}
            className="inline-flex items-center gap-2 rounded-xl bg-vault-danger px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            Delete account
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-vault-danger/30 bg-vault-danger/10 p-4 text-sm text-vault-danger">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} />
            You are about to delete your account. This will:
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Delete all your credit buckets</li>
            <li>• Remove all connected apps</li>
            <li>• Delete all usage history</li>
            <li>• Lose all remaining credits</li>
            <li>• Cancel your subscription</li>
          </ul>
        </div>
        <Field label="Enter your password to confirm">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label='Type "DELETE" to confirm'>
          <input
            className={inputClass}
            placeholder="Type DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

function DangerCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string[];
  action: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-vault-danger/25 bg-vault-danger/5 p-4">
      <p className="text-sm font-medium text-vault-foreground">{title}</p>
      <ul className="space-y-1 text-xs text-vault-muted">
        {body.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
      {action}
    </div>
  );
}

function DangerButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl border border-vault-danger/40 bg-vault-danger/10 px-4 py-2.5 text-sm font-medium text-vault-danger transition hover:bg-vault-danger/20 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function DangerSection() {
  const { saving, run } = useSettingsContext();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState<"data" | "apps" | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<AlertTriangle size={18} />}
        title="Danger zone"
        description="These actions are irreversible and should be used with caution."
      />

      <SubHeading>Clear all data</SubHeading>
      <DangerCard
        title="This will permanently delete:"
        body={["All credit buckets", "All usage history", "All policy settings"]}
        action={<DangerButton onClick={() => setConfirm("data")}>Clear all data</DangerButton>}
      />

      <SubHeading>Disconnect all apps</SubHeading>
      <DangerCard
        title="This will disconnect every connected AI provider"
        body={["Removes all stored API keys", "Stops all scheduled syncs"]}
        action={<DangerButton onClick={() => setConfirm("apps")}>Disconnect all apps</DangerButton>}
      />

      <SubHeading>Delete account</SubHeading>
      <DangerCard
        title="This will permanently delete your account and all associated data."
        body={["Cannot be undone", "Remaining credits are forfeited", "Subscription is cancelled immediately"]}
        action={<DangerButton onClick={() => setDeleteOpen(true)}>Delete account</DangerButton>}
      />

      {confirm && (
        <Modal
          title={confirm === "data" ? "Clear all data?" : "Disconnect all apps?"}
          description="This cannot be undone."
          onClose={() => setConfirm(null)}
          width="max-w-md"
          footer={
            <>
              <GhostButton onClick={() => setConfirm(null)}>Cancel</GhostButton>
              <DangerButton
                disabled={saving}
                onClick={async () => {
                  await run(
                    () => (confirm === "data" ? settingsApi.clearAllData() : settingsApi.disconnectAllApps()),
                    confirm === "data" ? "🗑️ All data cleared" : "🔌 All apps disconnected",
                  );
                  setConfirm(null);
                }}
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                Yes, continue
              </DangerButton>
            </>
          }
        >
          <p className="text-sm text-vault-muted">
            {confirm === "data"
              ? "Every bucket, transaction and policy in this workspace will be erased."
              : "All provider connections and stored keys will be removed."}
          </p>
        </Modal>
      )}

      {deleteOpen && (
        <DeleteAccountModal
          busy={saving}
          onClose={() => setDeleteOpen(false)}
          onConfirm={async (password) => {
            const ok = await run(() => settingsApi.deleteAccount(password), "⚠️ Account deleted successfully");
            if (ok) setDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
}
