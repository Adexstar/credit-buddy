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

import { API_URL } from "@/api/client";
import { appsApi } from "@/api/apps";
import { creditsApi } from "@/api/credits";
import { dashboardApi } from "@/api/dashboard";
import { policiesApi } from "@/api/policies";
import { syncApi } from "@/api/sync";
import { authApi } from "@/api/auth";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Local mutable mock state so mutations feel real without a backend. */
let localApps: ConnectedApp[] = [...mockApps];
let localActivities: Activity[] = [...mockActivities];
let localPolicies: Policy[] = [...mockPolicies];


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
    return authApi.getProfile() as unknown as Promise<UserProfile>;
  },

  async getStats(): Promise<Stats> {
    if (!API_URL) {
      await wait(180);
      return computeStats();
    }
    return dashboardApi.getStats();
  },

  async getApps(): Promise<ConnectedApp[]> {
    if (!API_URL) {
      await wait(180);
      return localApps;
    }
    return appsApi.getAll();
  },

  async getBuckets(): Promise<CreditBucket[]> {
    if (!API_URL) {
      await wait(180);
      return mockBuckets;
    }
    return creditsApi.getBuckets();
  },

  async getUsage(range: TimeRange): Promise<UsageData> {
    if (!API_URL) {
      await wait(150);
      return mockUsage[range];
    }
    return dashboardApi.getUsage(range);
  },

  async getActivity(): Promise<Activity[]> {
    if (!API_URL) {
      await wait(150);
      return localActivities;
    }
    return dashboardApi.getActivity();
  },

  async getPolicies(): Promise<Policy[]> {
    if (!API_URL) {
      await wait(150);
      return localPolicies;
    }
    return policiesApi.getAll();
  },

  async togglePolicy(id: string, active: boolean): Promise<Policy[]> {
    if (!API_URL) {
      await wait(200);
      localPolicies = localPolicies.map((p) => (p.id === id ? { ...p, active } : p));
      return localPolicies;
    }
    await policiesApi.update(id, { isActive: active });
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
    {
      const result = await appsApi.testConnection({ provider: providerId, apiKey });
      return { ok: result.ok, message: result.message ?? (result.ok ? "Key verified." : "Could not verify that key.") };
    }
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
    return appsApi.connect({ provider: providerId, apiKey, name });
  },

  async syncApp(appId: string): Promise<SyncResult> {
    if (!API_URL) {
      const app = localApps.find((a) => a.id === appId);
      if (!app) {
        return { success: false, appId, appName: appId, message: "No connection found for this app" };
      }
      const result = await runMockSync(app);
      if (result.success) {
        localApps = localApps.map((a) =>
          a.id === appId
            ? { ...a, credits: result.balance ?? a.credits, lastSync: result.lastSync ?? a.lastSync, syncStatus: "healthy" }
            : a,
        );
        localActivities = [
          {
            id: `act-sync-${Date.now()}`,
            kind: "sync",
            message: `${app.name} sync — ${result.message.toLowerCase()}`,
            appName: app.name,
            timestamp: new Date().toISOString(),
            ...(result.difference ? { amount: result.difference } : {}),
          },
          ...localActivities,
        ];
      } else {
        localApps = localApps.map((a) => (a.id === appId ? { ...a, syncStatus: "error" } : a));
      }
      return result;
    }
    {
      const result = await syncApi.trigger(appId);
      const app = localApps.find((a) => a.id === appId);
      return {
        success: true,
        appId,
        appName: app?.name ?? appId,
        message: "Balance refreshed",
        ...(result.balance !== undefined ? { balance: result.balance } : {}),
        ...(result.syncedAt ? { lastSync: result.syncedAt } : {}),
      };
    }
  },

  async getSyncHistory(appId?: string): Promise<SyncHistoryEntry[]> {
    if (!API_URL) {
      await wait(400);
      return readSyncHistory(appId);
    }
    return (appId ? syncApi.getHistory(appId) : syncApi.getAll()) as unknown as Promise<SyncHistoryEntry[]>;
  },

  async disconnectApp(appId: string): Promise<void> {
    if (!API_URL) {
      await wait(350);
      const app = localApps.find((a) => a.id === appId);
      localApps = localApps.filter((a) => a.id !== appId);
      if (app) {
        localActivities = [
          {
            id: `act-disc-${Date.now()}`,
            kind: "sync",
            message: `Disconnected ${app.name}`,
            appName: app.name,
            timestamp: new Date().toISOString(),
          },
          ...localActivities,
        ];
      }
      return;
    }
    await appsApi.disconnect(appId);
  },
};


export type { Activity, ConnectedApp, CreditBucket, Policy, Stats, TimeRange, UsageData, UserProfile };
