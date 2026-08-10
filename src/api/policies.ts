import apiClient from "./client";
import type { Policy } from "@/lib/mock-data";

export const policiesApi = {
  getAll: () => apiClient.get<Policy[]>("/policies"),
  getOne: (id: string) => apiClient.get<Policy>(`/policies/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<Policy>("/policies", data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put<Policy>(`/policies/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/policies/${id}`),
  toggle: (id: string) => apiClient.patch<Policy>(`/policies/${id}/toggle`),
  reorder: (data: { ids: string[] }) => apiClient.post<Policy[]>("/policies/reorder", data),
  test: (id: string, data: Record<string, unknown>) =>
    apiClient.post<Record<string, unknown>>(`/policies/${id}/test`, data),
};
