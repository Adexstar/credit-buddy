/** Token + session lifecycle helpers backed by localStorage. */
const TOKEN_KEY = (import.meta.env["VITE_AUTH_TOKEN_KEY"] as string | undefined) ?? "auth_token";
const REFRESH_KEY = (import.meta.env["VITE_REFRESH_TOKEN_KEY"] as string | undefined) ?? "refresh_token";

const store = () => (typeof window === "undefined" ? null : window.localStorage);

function decodeExpiry(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const payload = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const sessionManager = {
  getToken: () => store()?.getItem(TOKEN_KEY) ?? null,
  setToken: (token: string) => store()?.setItem(TOKEN_KEY, token),
  removeToken: () => store()?.removeItem(TOKEN_KEY),

  getRefreshToken: () => store()?.getItem(REFRESH_KEY) ?? null,
  setRefreshToken: (token: string) => store()?.setItem(REFRESH_KEY, token),
  removeRefreshToken: () => store()?.removeItem(REFRESH_KEY),

  clear() {
    sessionManager.removeToken();
    sessionManager.removeRefreshToken();
  },

  /** A token with no readable `exp` claim is treated as active (opaque tokens). */
  isSessionActive(): boolean {
    const token = sessionManager.getToken();
    if (!token) return false;
    const expiry = decodeExpiry(token);
    return expiry === null ? true : expiry > Date.now();
  },

  /** Milliseconds until expiry; 0 when unknown or already expired. */
  getSessionTimeout(): number {
    const token = sessionManager.getToken();
    if (!token) return 0;
    const expiry = decodeExpiry(token);
    if (expiry === null) return 0;
    return Math.max(0, expiry - Date.now());
  },

  /** Poll for expiry and invoke `onExpire` once the session lapses. */
  startSessionMonitor(onExpire: () => void, intervalMs = 60_000) {
    const interval = window.setInterval(() => {
      if (!sessionManager.getToken()) return;
      if (!sessionManager.isSessionActive()) {
        window.clearInterval(interval);
        onExpire();
      }
    }, intervalMs);
    return () => window.clearInterval(interval);
  },
};
