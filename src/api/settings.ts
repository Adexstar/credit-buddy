import apiClient from "./client";

/** Remote settings endpoints. The local demo implementation lives in `src/lib/settings.ts`. */
export const settingsRemoteApi = {
  getProfile: () => apiClient.get<Record<string, unknown>>("/settings/profile"),
  updateProfile: (data: Record<string, unknown>) => apiClient.put<Record<string, unknown>>("/settings/profile", data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.upload<{ avatarUrl: string }>("/settings/profile/avatar", formData);
  },
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put<void>("/settings/profile/password", data),
  getNotifications: () => apiClient.get<Record<string, unknown>>("/settings/notifications"),
  updateNotifications: (data: Record<string, unknown>) =>
    apiClient.put<Record<string, unknown>>("/settings/notifications", data),
  getBilling: () => apiClient.get<Record<string, unknown>>("/settings/billing"),
  upgradePlan: (data: { plan: string }) => apiClient.post<Record<string, unknown>>("/settings/billing/upgrade", data),
  cancelSubscription: () => apiClient.post<void>("/settings/billing/cancel"),
  getInvoices: () => apiClient.get<Record<string, unknown>[]>("/settings/billing/invoices"),
  getTeam: () => apiClient.get<Record<string, unknown>[]>("/settings/team"),
  inviteMember: (data: { email: string; role: string }) =>
    apiClient.post<Record<string, unknown>>("/settings/team/invite", data),
  updateMember: (id: string, data: Record<string, unknown>) =>
    apiClient.put<Record<string, unknown>>(`/settings/team/${id}`, data),
  removeMember: (id: string) => apiClient.delete<void>(`/settings/team/${id}`),
  getApiKeys: () => apiClient.get<Record<string, unknown>[]>("/settings/api-keys"),
  generateApiKey: (data: { name: string; scopes?: string[] }) =>
    apiClient.post<Record<string, unknown>>("/settings/api-keys", data),
  revokeApiKey: (id: string) => apiClient.delete<void>(`/settings/api-keys/${id}`),
  exportData: (data: Record<string, unknown>) => apiClient.post<{ url?: string }>("/settings/export", data),
  deleteAccount: (data: { password: string }) => apiClient.delete<void>("/settings/account", data),
  clearData: () => apiClient.delete<void>("/settings/account/data"),
};
