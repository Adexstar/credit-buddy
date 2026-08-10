import { useState } from "react";
import { AlertTriangle, Check, Copy, Download, KeyRound, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "@/components/policies/ui";
import { SectionHeader, SubHeading } from "@/components/settings/SettingsSidebar";
import { useSettingsContext } from "@/context/SettingsContext";
import { API_USAGE, settingsApi, type KeyPermission } from "@/lib/settings";

const PERMISSIONS: KeyPermission[] = ["read", "write", "admin"];
const EXPIRY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
];

export function GenerateKeyModal({
  secret,
  onClose,
}: {
  secret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("🔑 API key copied to clipboard");
    } catch {
      toast.error("❌ Could not copy. Select and copy manually.");
    }
  };

  const download = () => {
    const blob = new Blob([`CREDIT_BANK_API_KEY=${secret}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ".env";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title="Your new API key"
      description="This is the only time the full key is shown."
      onClose={onClose}
      width="max-w-lg"
      footer={
        <>
          <GhostButton onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            Copy key
          </GhostButton>
          <GhostButton onClick={download}>
            <Download size={15} />
            Download .env
          </GhostButton>
          <PrimaryButton onClick={onClose}>Done</PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-xl border border-vault-border bg-vault-bg px-3 py-3 font-mono text-xs break-all text-vault-teal">
          {secret}
        </p>
        <p className="flex items-start gap-2 rounded-xl border border-vault-amber/30 bg-vault-amber/10 p-3 text-xs text-vault-amber">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          Copy this key now. It won&apos;t be shown again.
        </p>
      </div>
    </Modal>
  );
}

export function ApiKeysSection({
  generateOpen,
  setGenerateOpen,
}: {
  generateOpen: boolean;
  setGenerateOpen: (open: boolean) => void;
}) {
  const { apiKeys, setApiKeys, saving, run } = useSettingsContext();
  const [name, setName] = useState("AI Credit Bank API");
  const [permissions, setPermissions] = useState<KeyPermission[]>(["read", "write"]);
  const [expires, setExpires] = useState("never");
  const [secret, setSecret] = useState<string | null>(null);

  const generate = async () => {
    const result = await run(
      () => settingsApi.createApiKey({ name, permissions, expires }),
      "🔑 New API key generated",
    );
    if (result) {
      setApiKeys(result.keys);
      setSecret(result.secret);
      setGenerateOpen(false);
    }
  };

  const revoke = async (id: string) => {
    const keys = await run(() => settingsApi.revokeApiKey(id), "🗑️ API key revoked");
    if (keys) setApiKeys(keys);
  };

  const rotate = async (id: string) => {
    const result = await run(() => settingsApi.rotateApiKey(id), "🔄 API key rotated");
    if (result) {
      setApiKeys(result.keys);
      setSecret(result.secret);
    }
  };

  const togglePermission = (permission: KeyPermission) =>
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<KeyRound size={18} />}
        title="API keys"
        description="Generate keys for programmatic access to your Credit Bank data."
      />

      <SubHeading>Active keys</SubHeading>
      <div className="overflow-x-auto rounded-xl border border-vault-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-vault-raised/60 text-left text-xs tracking-wide text-vault-faint uppercase">
              <th className="px-4 py-3 font-medium">Key name</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last used</th>
              <th className="px-4 py-3 font-medium">Scopes</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id} className="border-t border-vault-border">
                <td className="px-4 py-3">
                  <span className="text-vault-foreground">{key.name}</span>
                  <span className="ml-2 font-mono text-xs text-vault-faint">••••{key.tail}</span>
                </td>
                <td className="px-4 py-3 text-vault-muted">{new Date(key.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-vault-muted">
                  {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3 text-xs text-vault-muted capitalize">{key.permissions.join(", ")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label={`Rotate ${key.name}`}
                      onClick={() => void rotate(key.id)}
                      disabled={saving}
                      className="rounded-lg border border-vault-border p-1.5 text-vault-muted transition hover:text-vault-teal disabled:opacity-40"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Revoke ${key.name}`}
                      onClick={() => void revoke(key.id)}
                      disabled={saving}
                      className="rounded-lg border border-vault-border p-1.5 text-vault-danger transition hover:bg-vault-danger/10 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {apiKeys.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-vault-faint">
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SubHeading>Generate new key</SubHeading>
      <div className="space-y-4 rounded-xl border border-vault-border bg-vault-bg/40 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Key name">
            <input className={inputClass} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Expires">
            <select className={inputClass} value={expires} onChange={(e) => setExpires(e.target.value)}>
              {EXPIRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Permissions">
          <div className="flex flex-wrap gap-2">
            {PERMISSIONS.map((permission) => {
              const active = permissions.includes(permission);
              return (
                <button
                  key={permission}
                  type="button"
                  onClick={() => togglePermission(permission)}
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                    active
                      ? "border-vault-teal/40 bg-vault-teal/10 text-vault-teal"
                      : "border-vault-border bg-vault-panel text-vault-muted"
                  }`}
                >
                  {permission}
                </button>
              );
            })}
          </div>
        </Field>
        <PrimaryButton onClick={() => setGenerateOpen(true)} disabled={!name.trim() || permissions.length === 0}>
          <KeyRound size={15} />
          Generate API key
        </PrimaryButton>
      </div>

      <SubHeading>API usage</SubHeading>
      <div className="grid gap-3 rounded-xl border border-vault-border bg-vault-bg/40 p-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-vault-faint">Last 30 days</p>
          <p className="mt-1 font-display text-lg text-vault-foreground">
            {API_USAGE.last30Days.toLocaleString()} requests
          </p>
        </div>
        <div>
          <p className="text-xs text-vault-faint">Rate limit</p>
          <p className="mt-1 text-vault-foreground">{API_USAGE.rateLimit}</p>
        </div>
        <div>
          <p className="text-xs text-vault-faint">Documentation</p>
          <button
            type="button"
            onClick={() => toast.info("📚 API docs open in the developer portal")}
            className="mt-1 text-vault-teal underline-offset-4 hover:underline"
          >
            View API docs
          </button>
        </div>
      </div>

      {generateOpen && (
        <Modal
          title="Generate API key"
          description={`${name} · ${permissions.join(", ")} · expires ${expires}`}
          onClose={() => setGenerateOpen(false)}
          width="max-w-md"
          footer={
            <>
              <GhostButton onClick={() => setGenerateOpen(false)}>Cancel</GhostButton>
              <PrimaryButton onClick={generate} disabled={saving}>
                {saving && <Loader2 size={15} className="animate-spin" />}
                Generate
              </PrimaryButton>
            </>
          }
        >
          <p className="text-sm text-vault-muted">
            The key will be shown once. Store it in your secret manager immediately.
          </p>
        </Modal>
      )}

      {secret && <GenerateKeyModal secret={secret} onClose={() => setSecret(null)} />}
    </div>
  );
}
