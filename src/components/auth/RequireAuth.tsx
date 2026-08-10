import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/common/PageLoader";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/** Route guard: renders children only for an authenticated session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || isAuthenticated) return;
    // Never bounce off an auth route, and never redirect twice (that builds a ?next= loop).
    if (redirected.current || AUTH_ROUTES.includes(pathname)) return;
    redirected.current = true;
    void navigate({ to: "/login", search: { next: `${pathname}${searchStr ?? ""}` }, replace: true });
  }, [loading, isAuthenticated, navigate, pathname, searchStr]);

  useEffect(() => {
    if (isAuthenticated) redirected.current = false;
  }, [isAuthenticated]);

  if (loading) return <PageLoader fullScreen label="Restoring your session…" />;
  if (!isAuthenticated) return <PageLoader fullScreen label="Redirecting to sign in…" />;

  return <>{children}</>;
}
