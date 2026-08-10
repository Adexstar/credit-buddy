import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { AuthField, AuthLayout, AuthSubmit, authInputClass } from "@/components/auth/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

type LoginSearch = { next?: string; expired?: string };

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: typeof search["next"] === "string" ? search["next"] : undefined,
    expired: typeof search["expired"] === "string" ? search["expired"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Credit Bank" },
      { name: "description", content: "Sign in to your AI Credit Bank account to manage every AI credit you own." },
    ],
  }),
});

/** Only ever follow same-origin relative paths from `?next=`. */
function safeNext(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function LoginPage() {
  const { next, expired } = Route.useSearch();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      window.location.href = safeNext(next);
    } catch {
      // Toast already raised by the auth context.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Credit Bank account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-vault-teal hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {expired && (
        <p className="mb-4 rounded-xl border border-vault-danger/35 bg-vault-danger/10 px-3 py-2.5 text-xs text-vault-danger">
          Your session expired. Please sign in again.
        </p>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate={false}>
        <AuthField label="Email address" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={authInputClass}
          />
        </AuthField>

        <AuthField
          label="Password"
          htmlFor="password"
          hint={
            <Link to="/forgot-password" className="text-xs text-vault-teal hover:underline">
              Forgot password?
            </Link>
          }
        >
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${authInputClass} pr-11`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-vault-faint transition hover:text-vault-foreground"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </AuthField>

        <label className="flex items-center gap-2 text-sm text-vault-muted">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 accent-vault-teal"
          />
          Keep me signed in
        </label>

        <AuthSubmit loading={loading}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
          {loading ? "Signing in…" : "Sign in"}
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
