import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AuthField, AuthLayout, AuthSubmit, authInputClass } from "@/components/auth/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create account — Credit Bank" },
      { name: "description", content: "Create a Credit Bank account and unify every AI credit balance you own." },
    ],
  }),
});

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const passed = useMemo(() => RULES.filter((rule) => rule.test(form.password)).length, [form.password]);
  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong"][passed] ?? "Very weak";
  const strengthTone =
    passed <= 1 ? "bg-vault-danger" : passed === 2 ? "bg-vault-amber" : passed === 3 ? "bg-vault-blue" : "bg-vault-green";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passed < RULES.length) {
      toast.error("Password does not meet all requirements");
      return;
    }
    if (!accepted) {
      toast.error("Please accept the terms to continue");
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      window.location.href = "/";
    } catch {
      // Toast already raised by the auth context.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start pooling AI credits across every provider"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-vault-teal hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField label="Full name" htmlFor="name">
          <input
            id="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ada Okoye"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Email address" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className={authInputClass}
          />
        </AuthField>

        <AuthField label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })
            }
            placeholder="••••••••"
            className={authInputClass}
          />
        </AuthField>

        <div className="space-y-2 rounded-xl border border-vault-border bg-vault-bg/40 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-vault-muted">Password strength</span>
            <span className="text-vault-foreground">{strengthLabel}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-vault-raised">
            <div
              className={`h-full transition-all ${strengthTone}`}
              style={{ width: `${(passed / RULES.length) * 100}%` }}
            />
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {RULES.map((rule) => {
              const ok = rule.test(form.password);
              return (
                <li key={rule.label} className={`text-xs ${ok ? "text-vault-green" : "text-vault-faint"}`}>
                  {ok ? "✓" : "•"} {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <AuthField label="Confirm password" htmlFor="confirm">
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="••••••••"
            className={authInputClass}
          />
        </AuthField>

        <label className="flex items-start gap-2 text-sm text-vault-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 accent-vault-teal"
          />
          I agree to the terms of service and privacy policy.
        </label>

        <AuthSubmit loading={loading}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
          {loading ? "Creating account…" : "Create account"}
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
