import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Vault } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const authInputClass =
  "w-full rounded-xl border border-vault-border bg-vault-bg px-3.5 py-2.5 text-sm text-vault-foreground outline-none transition placeholder:text-vault-faint focus:border-vault-teal/60 focus:ring-2 focus:ring-vault-teal/20";

export function AuthField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wide text-vault-muted">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

export function AuthSubmit({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-vault-teal px-4 py-2.5 text-sm font-medium text-vault-bg transition hover:opacity-90 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { demoMode } = useAuth();

  return (
    <main className="vault-grid flex min-h-screen items-center justify-center bg-vault-bg px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex items-center justify-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl border border-vault-teal/30 bg-vault-teal/10 text-vault-teal">
            <Vault size={22} />
          </span>
          <span className="font-display text-lg font-semibold text-vault-foreground">Credit Bank</span>
        </Link>

        <div className="rounded-2xl border border-vault-border bg-vault-panel p-6 shadow-lg sm:p-8">
          <h1 className="font-display text-2xl font-bold text-vault-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-vault-muted">{subtitle}</p>

          {demoMode && (
            <p className="mt-4 rounded-xl border border-vault-amber/35 bg-vault-amber/10 px-3 py-2.5 text-xs text-vault-amber">
              No backend configured. Set <code>VITE_API_URL</code> to authenticate against your API — until then any
              credentials start a local demo session.
            </p>
          )}

          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="text-center text-sm text-vault-muted">{footer}</div>}
      </div>
    </main>
  );
}
