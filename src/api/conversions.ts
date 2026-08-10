import apiClient from "./client";

export const conversionsApi = {
  getAll: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Record<string, unknown>[]>("/conversions", { params }),
  getOne: (id: string) => apiClient.get<Record<string, unknown>>(`/conversions/${id}`),
  getStats: () => apiClient.get<Record<string, unknown>>("/conversions/stats"),
  getAnalytics: () => apiClient.get<Record<string, unknown>>("/conversions/analytics"),
  export: (data: Record<string, unknown>) => apiClient.post<{ url: string }>("/conversions/export", data),
  reportIssue: (id: string, data: { reason: string; details?: string }) =>
    apiClient.post<void>(`/conversions/${id}/report`, data),
  getRates: () => apiClient.get<Record<string, number>>("/conversions/rates"),
  preview: (data: { fromBucketId: string; toAppId: string; amount: number }) =>
    apiClient.post<{ receive: number; fee: number; rate: number }>("/conversions/preview", data),
};
