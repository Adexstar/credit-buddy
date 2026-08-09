import {
  mockActivities,
  mockApps,
  mockBuckets,
  mockPolicies,
  mockStats,
  mockUsage,
  mockUser,
  PROVIDERS,
  type Activity,
  type ConnectedApp,
  type CreditBucket,
  type Policy,
  type Stats,
  type TimeRange,
  type UsageData,
  type UserProfile,
} from "./mock-data";
import {
  getSyncHistory as readSyncHistory,
  runMockSync,
  type SyncHistoryEntry,
  type SyncResult,
} from "./sync";

const API_URL = import.meta.env["VITE_API_URL"] as string | undefined;


const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Local mutable mock state so mutations feel real without a backend. */
let localApps: ConnectedApp[] = [...mockApps];
let localActivities: Activity[] = [...mockActivities];
let localPolicies: Policy[] = [...mockPolicies];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as T;
}

function computeStats(): Stats {
  const totalBalance = mockBuckets.reduce((sum, b) => sum + b.remaining, 0);
  return {
    ...mockStats,
    connectedApps: localApps.length,
    activeBuckets: mockBuckets.length,
    totalBalance: Number(totalBalance.toFixed(2)),
  };
}

export const api = {
  usingMockData: !API_URL,

  /** Prepend a locally generated activity entry (used by the mock conversion flow). */
  addActivity(activity: Activity) {
    localActivities = [activity, ...localActivities];
  },


  async getProfile(): Promise<UserProfile> {
    if (!API_URL) return mockUser;
    return request<UserProfile>("/auth/me");
  },

  async getStats(): Promise<Stats> {
    if (!API_URL) {
      await wait(180);
      return computeStats();
    }
    return request<Stats>("/credits/stats");
  },

  async getApps(): Promise<ConnectedApp[]> {
    if (!API_URL) {
      await wait(180);
      return localApps;
    }
    return request<ConnectedApp[]>("/apps/connected");
  },

  async getBuckets(): Promise<CreditBucket[]> {
    if (!API_URL) {
      await wait(180);
      return mockBuckets;
    }
    return request<CreditBucket[]>("/credits/buckets");
  },

  async getUsage(range: TimeRange): Promise<UsageData> {
    if (!API_URL) {
      await wait(150);
      return mockUsage[range];
    }
    return request<UsageData>(`/credits/usage?range=${range}`);
  },

  async getActivity(): Promise<Activity[]> {
    if (!API_URL) {
      await wait(150);
      return localActivities;
    }
    return request<Activity[]>("/credits/activity");
  },

  async getPolicies(): Promise<Policy[]> {
    if (!API_URL) {
      await wait(150);
      return localPolicies;
    }
    return request<Policy[]>("/policies");
  },

  async togglePolicy(id: string, active: boolean): Promise<Policy[]> {
    if (!API_URL) {
      await wait(200);
      localPolicies = localPolicies.map((p) => (p.id === id ? { ...p, active } : p));
      return localPolicies;
    }
    await request(`/policies/${id}`, { method: "PUT", body: JSON.stringify({ is_active: active }) });
    return this.getPolicies();
  },

  async testConnection(providerId: string, apiKey: string): Promise<{ ok: boolean; message: string }> {
    if (!API_URL) {
      await wait(1100);
      if (apiKey.trim().length < 12) {
        return { ok: false, message: "That key looks too short. Check for a truncated paste." };
      }
      const provider = PROVIDERS.find((p) => p.id === providerId);
      return { ok: true, message: `Key verified with ${provider?.name ?? "provider"}.` };
    }
    return request<{ ok: boolean; message: string }>("/apps/test", {
      method: "POST",
      body: JSON.stringify({ provider: providerId, api_key: apiKey }),
    });
  },

  async saveConnection(providerId: string, apiKey: string, name: string): Promise<ConnectedApp> {
    if (!API_URL) {
      await wait(750);
      const provider = PROVIDERS.find((p) => p.id === providerId);
      const app: ConnectedApp = {
        id: `app-${providerId}-${Date.now()}`,
        provider: providerId,
        name: name || provider?.name || providerId,
        initials: provider?.initials ?? providerId.slice(0, 2).toUpperCase(),
        syncStatus: "healthy",
        credits: 0,
        lastSync: new Date().toISOString(),
      };
      localApps = [...localApps, app];
      localActivities = [
        {
          id: `act-${Date.now()}`,
          kind: "sync",
          message: `Connected ${app.name} and pulled the first balance`,
          appName: app.name,
          timestamp: new Date().toISOString(),
        },
        ...localActivities,
      ];
      return app;
    }
    return request<ConnectedApp>("/apps/connect", {
      method: "POST",
      body: JSON.stringify({ provider: providerId, api_key: apiKey, app_name: name }),
    });
  },
};

export type { Activity, ConnectedApp, CreditBucket, Policy, Stats, TimeRange, UsageData, UserProfile };
