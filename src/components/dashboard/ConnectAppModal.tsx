import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  Loader2,
  Lock,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PROVIDERS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import type { ConnectedApp } from "@/lib/api";

interface ConnectAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedApps: ConnectedApp[];
  onConnected: (app: ConnectedApp) => void;
  initialProvider?: string;
}

type TestStatus = "idle" | "success" | "error";

export function ConnectAppModal({
  isOpen,
  onClose,
  connectedApps,
  onConnected,
  initialProvider,
}: ConnectAppModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(initialProvider ?? PROVIDERS[0].id);
  const [apiKey, setApiKey] = useState("");
  const [optionalName, setOptionalName] = useState<string>(PROVIDERS[0].name);
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const provider = useMemo(
    () => PROVIDERS.find((p) => p.id === selectedProvider) ?? PROVIDERS[0],
    [selectedProvider],
  );

  const alreadyConnected = connectedApps.some((app) => app.provider === selectedProvider);

  useEffect(() => {
    if (!isOpen) return;
    const next = initialProvider ?? PROVIDERS[0].id;
    const match = PROVIDERS.find((p) => p.id === next) ?? PROVIDERS[0];
    setSelectedProvider(match.id);
    setOptionalName(match.name);
    setApiKey("");
    setShowPassword(false);
    setTestStatus("idle");
    setTestMessage("");
    setIsTesting(false);
    setIsSaving(false);
  }, [isOpen, initialProvider]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProviderChange = (id: string) => {
    const match = PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
    setSelectedProvider(match.id);
    setOptionalName(match.name);
    setTestStatus("idle");
    setTestMessage("");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setApiKey(text.trim());
        setTestStatus("idle");
        setTestMessage("");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Clipboard access was blocked — paste the key manually.");
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestStatus("idle");
    setTestMessage("");
    const result = await api.testConnection(selectedProvider, apiKey);
    setIsTesting(false);
    setTestStatus(result.ok ? "success" : "error");
    setTestMessage(result.message);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const app = await api.saveConnection(selectedProvider, apiKey, optionalName.trim());
      onConnected(app);
      onClose();
    } catch {
      setTestStatus("error");
      setTestMessage("Saving failed. Try again in a moment.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm motion-safe:animate-[fadeIn_150ms_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect an app"
        className="relative w-full max-w-[480px] rounded-xl border border-vault-border bg-vault-panel p-6 shadow-lg motion-safe:animate-[slideUp_200ms_ease-out]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-vault-foreground">Connect an app</h2>
            <p className="mt-1 text-sm text-vault-muted">Link a provider API key to pull balances into the vault.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="provider" className="text-xs font-medium tracking-wide text-vault-muted uppercase">
              Provider
            </label>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vault-teal/10 font-display text-xs font-semibold text-vault-teal">
                {provider.initials}
              </span>
              <select
                id="provider"
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-vault-border bg-vault-raised px-3 text-sm text-vault-foreground outline-none focus:border-vault-teal/50"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {alreadyConnected && (
            <div className="flex items-start gap-2.5 rounded-lg border border-vault-amber/30 bg-vault-amber/10 p-3 text-xs text-vault-amber">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>
                {provider.name} is already connected. Connecting again replaces the stored key.{" "}
                <Link to="/apps" onClick={onClose} className="underline">
                  Go to app settings
                </Link>
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="api-key" className="text-xs font-medium tracking-wide text-vault-muted uppercase">
                API key
              </label>
              <a
                href={provider.docs}
                target="_blank"
                rel="noreferrer"
                title="Where to find your API key"
                className="flex items-center gap-1 text-xs text-vault-teal transition hover:opacity-80"
              >
                <HelpCircle size={13} />
                Where to find your API key
                <ExternalLink size={11} />
              </a>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="api-key"
                  type={showPassword ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus("idle");
                    setTestMessage("");
                  }}
                  placeholder="sk-..."
                  autoComplete="off"
                  className="vault-mono h-10 w-full rounded-lg border border-vault-border bg-vault-raised pr-10 pl-3 text-sm text-vault-foreground outline-none placeholder:text-vault-faint focus:border-vault-teal/50"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide API key" : "Show API key"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-vault-faint transition hover:text-vault-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handlePaste}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-vault-border bg-vault-raised px-3 text-xs text-vault-muted transition hover:text-vault-foreground"
              >
                <ClipboardPaste size={14} />
                Paste
              </button>
            </div>
            {testStatus !== "idle" && (
              <p
                className={`mt-2 flex items-start gap-1.5 text-xs ${
                  testStatus === "success" ? "text-vault-teal" : "text-vault-danger"
                }`}
              >
                {testStatus === "success" ? (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={14} className="mt-0.5 shrink-0" />
                )}
                {testMessage}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="app-name" className="text-xs font-medium tracking-wide text-vault-muted uppercase">
              Display name <span className="normal-case text-vault-faint">(optional)</span>
            </label>
            <input
              id="app-name"
              type="text"
              value={optionalName}
              onChange={(e) => setOptionalName(e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-vault-border bg-vault-raised px-3 text-sm text-vault-foreground outline-none focus:border-vault-teal/50"
            />
          </div>

          <p className="flex items-start gap-2 text-xs text-vault-faint">
            <Lock size={14} className="mt-0.5 shrink-0 text-vault-teal" />
            Your API key is encrypted at rest and only decrypted to sync balances. It is never shown again after saving.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-vault-border bg-vault-raised px-4 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={apiKey.trim().length === 0 || isTesting}
            onClick={handleTest}
            className="flex items-center gap-2 rounded-lg border border-vault-teal/40 bg-vault-teal/10 px-4 py-2 text-sm text-vault-teal transition enabled:hover:bg-vault-teal/20 disabled:opacity-40"
          >
            {isTesting && <Loader2 size={14} className="animate-spin" />}
            Test connection
          </button>
          <button
            type="button"
            disabled={testStatus !== "success" || isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg transition enabled:hover:opacity-90 disabled:opacity-40"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            Save connection
          </button>
        </div>
      </div>
    </div>
  );
}
