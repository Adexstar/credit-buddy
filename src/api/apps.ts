import apiClient from "./client";
import type { ConnectedApp } from "@/lib/mock-data";

export const appsApi = {
  getAll: () => apiClient.get<ConnectedApp[]>("/apps"),
  getOne: (id: string) => apiClient.get<ConnectedApp>(`/apps/${id}`),
  connect: (data: { provider: string; apiKey: string; name?: string }) =>
    apiClient.post<ConnectedApp>("/apps/connect", data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put<ConnectedApp>(`/apps/${id}`, data),
  disconnect: (id: string) => apiClient.delete<void>(`/apps/${id}`),
  sync: (id: string) => apiClient.post<{ balance?: number; syncedAt?: string }>(`/apps/${id}/sync`),
  rotateKey: (id: string, data: { apiKey: string }) => apiClient.post<ConnectedApp>(`/apps/${id}/rotate-key`, data),
  testConnection: (data: { provider: string; apiKey: string }) =>
    apiClient.post<{ ok: boolean; balance?: number; message?: string }>("/apps/test-connection", data),
  getHistory: (id: string) => apiClient.get<Record<string, unknown>[]>(`/apps/${id}/history`),
};
