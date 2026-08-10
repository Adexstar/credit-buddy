import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { AuthField, AuthLayout, AuthSubmit, authInputClass } from "@/components/auth/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — Credit Bank" },
      { name: "description", content: "Request a password reset link for your Credit Bank account." },
    ],
  }),
});

function ForgotPasswordPage() {
  const { forgotPassword, demoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!demoMode) await forgotPassword(email);
      setSent(true);
    } catch {
      // Toast already raised by the auth context.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll email you a secure link to set a new one"
      footer={
        <Link to="/login" className="text-vault-teal hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-3">
          <p className="rounded-xl border border-vault-green/35 bg-vault-green/10 px-3 py-2.5 text-sm text-vault-green">
            If an account exists for {email}, a reset link is on its way.
          </p>
          <p className="text-xs text-vault-faint">
            The link opens <code>/reset-password</code> where you can choose a new password.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <AuthField label="Email address" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={authInputClass}
            />
          </AuthField>
          <AuthSubmit loading={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            {loading ? "Sending…" : "Send reset link"}
          </AuthSubmit>
        </form>
      )}
    </AuthLayout>
  );
}
