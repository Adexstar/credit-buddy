import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardPaste, ExternalLink, Eye, EyeOff, Loader2, Lock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Field, GhostButton, Modal, PrimaryButton, inputClass } from "@/components/policies/ui";
import { PROVIDERS } from "@/lib/mock-data";
import { api, type ConnectedApp } from "@/lib/api";
import { SYNC_FREQUENCIES, appsApi, providerDocs, providerLook, type SyncFrequency } from "@/lib/apps";

export function ConnectAppWizard({
  connectedApps,
  onClose,
  onConnected,
  initialProvider,
}: {
  connectedApps: ConnectedApp[];
  onClose: () => void;
  onConnected: (app: ConnectedApp) => void;
  initialProvider?: string;
}) {
  const [step, setStep] = useState(initialProvider ? 2 : 1);
  const [providerId, setProviderId] = useState(initialProvider ?? PROVIDERS[0]!.id);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState<"idle" | "ok" | "fail">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>("6h");
  const [autoSync, setAutoSync] = useState(true);
  const [peakRestrictions, setPeakRestrictions] = useState(false);
  const [offPeakRouting, setOffPeakRouting] = useState(false);
  const [saving, setSaving] = useState(false);

  const provider = useMemo(() => PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0]!, [providerId]);
  const alreadyConnected = connectedApps.some((a) => a.provider === providerId);

  useEffect(() => {
    setDisplayName(`My ${provider.name} Account`);
    setApiKey("");
    setTested("idle");
    setTestMessage("");
  }, [provider]);

  const runTest = async () => {
    setTesting(true);
    try {
      const result = await api.testConnection(providerId, apiKey);
      setTested(result.ok ? "ok" : "fail");
      setTestMessage(result.message);
      if (result.ok) setStep(3);
      else toast.error(`Invalid API key for ${provider.name}`);
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const app = await api.saveConnection(providerId, apiKey, displayName.trim() || provider.name);
      appsApi.register(app, {
        displayName: displayName.trim() || provider.name,
        keyTail: apiKey.slice(-8),
        syncFrequency,
        autoSync,
        peakRestrictions,
        offPeakRouting,
        policies: offPeakRouting ? ["off-peak"] : [],
      });
      toast.success(`${app.name} connected successfully!`);
      onConnected(app);
      onClose();
    } catch (error) {
      toast.error(`Failed to connect ${provider.name}: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={step === 1 ? "Connect New App" : step === 2 ? `Connect ${provider.name}` : `Configure ${provider.name}`}
      description={`Step ${step} of 3 · ${step === 1 ? "Select a provider" : step === 2 ? "Enter your API key" : "Configure settings"}`}
      onClose={onClose}
      width="max-w-xl"
      footer={
        step === 1 ? (
          <>
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton onClick={() => setStep(2)}>Continue</PrimaryButton>
          </>
        ) : step === 2 ? (
          <>
            <GhostButton onClick={() => setStep(1)}>Back</GhostButton>
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton disabled={testing || apiKey.trim().length === 0} onClick={() => void runTest()}>
              {testing && <Loader2 size={14} className="animate-spin" />}
              {testing ? "Testing…" : "Test Connection"}
            </PrimaryButton>
          </>
        ) : (
          <>
            <GhostButton onClick={() => setStep(2)}>Back</GhostButton>
            <GhostButton onClick={onClose}>Cancel</GhostButton>
            <PrimaryButton disabled={saving || tested !== "ok"} onClick={() => void save()}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Connect {provider.name}
            </PrimaryButton>
          </>
        )
      }
    >
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROVIDERS.map((p) => {
              const look = providerLook(p.id);
              const active = p.id === providerId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProviderId(p.id)}
                  className={`vault-raised flex flex-col items-center gap-2 p-4 text-center transition ${
                    active ? "border-vault-teal/60 ring-1 ring-vault-teal/30" : "hover:border-vault-teal/30"
                  }`}
                >
                  <span className="text-2xl">{look.emoji}</span>
                  <span className="text-sm font-medium text-vault-foreground">{p.name}</span>
                  {connectedApps.some((a) => a.provider === p.id) && (
                    <span className="text-xs text-vault-amber">Already connected</span>
                  )}
                </button>
              );
            })}
          </div>
          <a
            href="https://docs.lovable.dev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-vault-teal hover:underline"
          >
            Need help? View documentation <ExternalLink size={12} />
          </a>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {alreadyConnected && (
            <p className="rounded-xl border border-vault-amber/30 bg-vault-amber/10 p-3 text-xs text-vault-amber">
              {provider.name} is already connected. Continuing will add a second connection.
            </p>
          )}
          <Field label="API key">
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                maxLength={200}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTested("idle");
                }}
                placeholder="sk-…"
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
              <button
                type="button"
                aria-label="Paste from clipboard"
                onClick={async () => {
                  try {
                    setApiKey((await navigator.clipboard.readText()).trim());
                  } catch {
                    toast.error("Clipboard access denied");
                  }
                }}
                className="rounded-xl border border-vault-border px-3 text-vault-faint transition hover:text-vault-foreground"
              >
                <ClipboardPaste size={15} />
              </button>
            </div>
          </Field>
          <a
            href={providerDocs(providerId)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-vault-teal hover:underline"
          >
            Where to find your API key <ExternalLink size={12} />
          </a>
          <p className="flex items-center gap-2 text-xs text-vault-faint">
            <Lock size={13} /> Your key is encrypted and never stored in plain text.
          </p>
          {tested === "fail" && (
            <p className="flex items-center gap-2 text-xs text-vault-danger">
              <XCircle size={14} /> {testMessage}
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="flex items-center gap-2 rounded-xl border border-vault-teal/30 bg-vault-teal/10 p-3 text-xs text-vault-teal">
            <CheckCircle2 size={14} /> Connection test passed! {testMessage}
          </p>
          <Field label="Display name">
            <input className={inputClass} value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Field label="Sync frequency">
            <select className={inputClass} value={syncFrequency} onChange={(e) => setSyncFrequency(e.target.value as SyncFrequency)}>
              {SYNC_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="space-y-2">
            {[
              ["Auto-sync enabled", autoSync, setAutoSync],
              ["Enable peak restrictions", peakRestrictions, setPeakRestrictions],
              ["Enable off-peak routing", offPeakRouting, setOffPeakRouting],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="flex items-center gap-2.5 text-sm text-vault-foreground">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
                  className="size-4 accent-[var(--color-vault-teal)]"
                />
                {label as string}
              </label>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
