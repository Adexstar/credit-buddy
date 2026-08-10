import apiClient from "./client";
import type { Activity, Stats, TimeRange, UsageData } from "@/lib/mock-data";

export const dashboardApi = {
  getStats: () => apiClient.get<Stats>("/dashboard/stats"),
  getActivity: (limit?: number) => apiClient.get<Activity[]>("/dashboard/activity", { params: { limit } }),
  getUsage: (range: TimeRange) => apiClient.get<UsageData>("/dashboard/usage", { params: { range } }),
  getOverview: () => apiClient.get<Record<string, unknown>>("/dashboard/overview"),
};
