import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { authApi, type AuthSession, type AuthUser, type RegisterPayload } from "@/api/auth";
import { ApiError, isApiConfigured } from "@/api/client";
import { sessionManager } from "@/utils/session";
import { mockUser } from "@/lib/mock-data";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** True when VITE_API_URL is unset — the app runs on demo data and a local session. */
  demoMode: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  register: (data: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_TOKEN = "demo-session";
const demoUser: AuthUser = { id: "demo-user", name: mockUser.name, email: mockUser.email, plan: mockUser.planType };

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError || error instanceof Error) return error.message || fallback;
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrapped = useRef(false);

  const applySession = useCallback((session: AuthSession, rememberMe: boolean) => {
    sessionManager.setToken(session.token);
    if (session.refreshToken && rememberMe) sessionManager.setRefreshToken(session.refreshToken);
    setUser(session.user);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!sessionManager.getToken()) {
      setUser(null);
      return;
    }
    if (!isApiConfigured) {
      setUser(demoUser);
      return;
    }
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      sessionManager.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void refreshProfile().finally(() => setLoading(false));
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    try {
      if (isApiConfigured && sessionManager.getToken() !== DEMO_TOKEN) await authApi.logout();
    } catch {
      // A failed logout call must never trap the user in the app.
    } finally {
      sessionManager.clear();
      setUser(null);
      toast.info("Logged out");
    }
  }, []);

  // Auto sign-out when the access token expires and no refresh token is stored.
  useEffect(() => {
    if (!user || !isApiConfigured) return;
    return sessionManager.startSessionMonitor(() => {
      if (sessionManager.getRefreshToken()) return;
      toast.warning("Session expired — please sign in again");
      void logout();
    });
  }, [user, logout]);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password, rememberMe = false) => {
      if (!isApiConfigured) {
        sessionManager.setToken(DEMO_TOKEN);
        setUser(demoUser);
        toast.success(`Demo session started for ${demoUser.name}`);
        return demoUser;
      }
      try {
        const session = await authApi.login({ email, password });
        applySession(session, rememberMe || Boolean(session.refreshToken));
        toast.success(`Welcome back, ${session.user.name}`);
        return session.user;
      } catch (error) {
        toast.error(errorMessage(error, "Login failed"));
        throw error;
      }
    },
    [applySession],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async (data) => {
      if (!isApiConfigured) {
        sessionManager.setToken(DEMO_TOKEN);
        const localUser = { ...demoUser, name: data.name, email: data.email };
        setUser(localUser);
        toast.success("Demo session started");
        return localUser;
      }
      try {
        const session = await authApi.register(data);
        applySession(session, true);
        toast.success("Account created");
        return session.user;
      } catch (error) {
        toast.error(errorMessage(error, "Registration failed"));
        throw error;
      }
    },
    [applySession],
  );

  const forgotPassword = useCallback<AuthContextValue["forgotPassword"]>(async (email) => {
    try {
      await authApi.forgotPassword(email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error(errorMessage(error, "Could not send reset email"));
      throw error;
    }
  }, []);

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>(async (token, password) => {
    try {
      await authApi.resetPassword(token, password);
      toast.success("Password updated — you can sign in now");
    } catch (error) {
      toast.error(errorMessage(error, "Could not reset password"));
      throw error;
    }
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(async (data) => {
    if (!isApiConfigured) {
      const next = { ...(demoUser as AuthUser), ...data };
      setUser(next);
      return next;
    }
    try {
      const updated = await authApi.updateProfile(data);
      setUser(updated);
      toast.success("Profile updated");
      return updated;
    } catch (error) {
      toast.error(errorMessage(error, "Could not update profile"));
      throw error;
    }
  }, []);

  const changePassword = useCallback<AuthContextValue["changePassword"]>(async (data) => {
    try {
      await authApi.changePassword(data);
      toast.success("Password changed");
    } catch (error) {
      toast.error(errorMessage(error, "Could not change password"));
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      demoMode: !isApiConfigured,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      changePassword,
      refreshProfile,
    }),
    [user, loading, login, register, logout, forgotPassword, resetPassword, updateProfile, changePassword, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
