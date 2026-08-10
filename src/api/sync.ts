import apiClient from "./client";

export const syncApi = {
  trigger: (appId: string) => apiClient.post<{ balance?: number; syncedAt?: string }>(`/sync/${appId}`),
  getAll: () => apiClient.get<Record<string, unknown>[]>("/sync/all"),
  getHistory: (appId: string) => apiClient.get<Record<string, unknown>[]>(`/sync/${appId}/history`),
  getStatus: (appId: string) => apiClient.get<{ status: string; lastSync?: string }>(`/sync/${appId}/status`),
  reconcile: (appId: string) => apiClient.post<Record<string, unknown>>(`/sync/${appId}/reconcile`),
};
