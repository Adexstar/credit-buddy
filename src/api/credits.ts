import apiClient from "./client";
import type { CreditBucket } from "@/lib/mock-data";

export const creditsApi = {
  getBuckets: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<CreditBucket[]>("/credits/buckets", { params }),
  getBucket: (id: string) => apiClient.get<CreditBucket>(`/credits/buckets/${id}`),
  getBalance: () => apiClient.get<{ total: number; byApp: Record<string, number> }>("/credits/balance"),
  getHistory: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<Record<string, unknown>[]>("/credits/history", { params }),
  addCredits: (data: { appId: string; amount: number; sourceType?: string }) =>
    apiClient.post<CreditBucket>("/credits/add", data),
  convert: (data: { fromBucketId: string; toAppId: string; amount: number }) =>
    apiClient.post<Record<string, unknown>>("/credits/convert", data),
  bulkConvert: (data: { bucketIds: string[]; toAppId: string }) =>
    apiClient.post<Record<string, unknown>>("/credits/bulk/convert", data),
  freeze: (id: string) => apiClient.post<CreditBucket>(`/credits/buckets/${id}/freeze`),
  unfreeze: (id: string) => apiClient.post<CreditBucket>(`/credits/buckets/${id}/unfreeze`),
  delete: (id: string) => apiClient.delete<void>(`/credits/buckets/${id}`),
};
