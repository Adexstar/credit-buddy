/**
 * Fetch-based API client with request/response interceptor semantics:
 * - attaches the bearer token to every request
 * - transparently refreshes an expired token once, then replays the request
 * - surfaces real errors (no mock fallback) as typed `ApiError`s
 */
import { sessionManager } from "@/utils/session";

export const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "");
export const WS_URL = import.meta.env["VITE_WS_URL"] as string | undefined;

/** True when no backend is configured — the app then runs on demo data. */
export const isApiConfigured = Boolean(API_URL);

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (code !== undefined) this.code = code;
    if (details !== undefined) this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Send FormData untouched (file uploads). */
  formData?: FormData;
  signal?: AbortSignal;
  /** Skip the automatic refresh + replay (used by the refresh call itself). */
  skipAuthRetry?: boolean;
};

let refreshInFlight: Promise<string> | null = null;

function buildUrl(path: string, params?: RequestOptions["params"]) {
  if (!API_URL) {
    throw new ApiError(
      "No backend configured — set VITE_API_URL to your API base URL (e.g. https://your-api.railway.app/api).",
      0,
      "api_not_configured",
    );
  }
  const url = new URL(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidate = record["message"] ?? record["error"] ?? record["detail"];
    if (typeof candidate === "string" && candidate) return candidate;
  }
  if (typeof payload === "string" && payload) return payload;
  return fallback;
}

/** Refresh the access token, de-duplicating concurrent 401s into one call. */
async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = sessionManager.getRefreshToken();
  if (!refreshToken) throw new ApiError("Session expired", 401, "no_refresh_token");

  refreshInFlight = (async () => {
    const response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, refresh_token: refreshToken }),
    });
    const payload = await parseBody(response);
    if (!response.ok) {
      throw new ApiError(extractMessage(payload, "Session refresh failed"), response.status, "refresh_failed");
    }
    const record = (payload ?? {}) as Record<string, unknown>;
    const token = (record["token"] ?? record["accessToken"] ?? record["access_token"]) as string | undefined;
    if (!token) throw new ApiError("Refresh response did not include a token", 500, "refresh_malformed");
    sessionManager.setToken(token);
    const nextRefresh = (record["refreshToken"] ?? record["refresh_token"]) as string | undefined;
    if (nextRefresh) sessionManager.setRefreshToken(nextRefresh);
    return token;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

function onSessionLost() {
  sessionManager.clear();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}&expired=1`;
  }
}

async function send<T>(path: string, options: RequestOptions = {}, attempt = 0): Promise<T> {
  const token = sessionManager.getToken();
  const headers: Record<string, string> = {};
  if (!options.formData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: RequestInit = { method: options.method ?? "GET", headers };
  if (options.signal) init.signal = options.signal;
  if (options.formData) init.body = options.formData;
  else if (options.body !== undefined) init.body = JSON.stringify(options.body);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.params), init);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Cannot reach the API at ${API_URL ?? "(unset)"} — check the URL, CORS and that the server is running.`,
      0,
      "network_error",
      error,
    );
  }

  if (response.status === 401 && attempt === 0 && !options.skipAuthRetry && sessionManager.getRefreshToken()) {
    try {
      await refreshAccessToken();
      return await send<T>(path, options, 1);
    } catch (error) {
      onSessionLost();
      throw error;
    }
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) onSessionLost();
    const record = (payload ?? {}) as Record<string, unknown>;
    throw new ApiError(
      extractMessage(payload, `${options.method ?? "GET"} ${path} failed (${response.status})`),
      response.status,
      typeof record["code"] === "string" ? (record["code"] as string) : undefined,
      payload,
    );
  }

  // Unwrap the common `{ data: ... }` envelope while leaving plain payloads intact.
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    const record = payload as Record<string, unknown>;
    const keys = Object.keys(record);
    const isEnvelope = keys.every((key) => ["data", "success", "message", "meta", "pagination"].includes(key));
    if (isEnvelope) return record["data"] as T;
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    send<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    send<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    send<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    send<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    send<T>(path, { ...options, method: "DELETE", body }),
  upload: <T>(path: string, formData: FormData, method: "POST" | "PUT" = "POST") =>
    send<T>(path, { method, formData }),
};

export default apiClient;
