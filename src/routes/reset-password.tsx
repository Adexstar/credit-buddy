import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthField, AuthLayout, AuthSubmit, authInputClass } from "@/components/auth/AuthLayout";
import { useAuth } from "@/hooks/useAuth";

type ResetSearch = { token?: string };

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — Credit Bank" },
      { name: "description", content: "Choose a new password for your Credit Bank account." },
    ],
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("This reset link is missing its token — request a new email.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch {
      // Toast already raised by the auth context.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before"
      footer={
        <Link to="/login" className="text-vault-teal hover:underline">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <p className="rounded-xl border border-vault-green/35 bg-vault-green/10 px-3 py-2.5 text-sm text-vault-green">
          Password updated. You can sign in with your new password now.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!token && (
            <p className="rounded-xl border border-vault-amber/35 bg-vault-amber/10 px-3 py-2.5 text-xs text-vault-amber">
              No reset token found in this URL. Open the link from your reset email, or request a new one.
            </p>
          )}
          <AuthField label="New password" htmlFor="password">
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={authInputClass}
            />
          </AuthField>
          <AuthField label="Confirm new password" htmlFor="confirm">
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={authInputClass}
            />
          </AuthField>
          <AuthSubmit loading={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            {loading ? "Updating…" : "Update password"}
          </AuthSubmit>
        </form>
      )}
    </AuthLayout>
  );
}
