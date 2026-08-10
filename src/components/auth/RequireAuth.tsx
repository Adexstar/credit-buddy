import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/common/PageLoader";

/** Route guard: renders children only for an authenticated session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if (loading || isAuthenticated) return;
    void navigate({
      to: "/login",
      search: { next: `${location.pathname}${location.searchStr ?? ""}` },
      replace: true,
    });
  }, [loading, isAuthenticated, navigate, location.pathname, location.searchStr]);

  if (loading) return <PageLoader fullScreen label="Restoring your session…" />;
  if (!isAuthenticated) return <PageLoader fullScreen label="Redirecting to sign in…" />;

  return <>{children}</>;
}
