import apiClient from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan?: string;
  emailVerified?: boolean;
};

export type AuthSession = {
  token: string;
  refreshToken?: string;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export const authApi = {
  register: (data: RegisterPayload) => apiClient.post<AuthSession>("/auth/register", data),
  login: (data: { email: string; password: string }) => apiClient.post<AuthSession>("/auth/login", data),
  logout: () => apiClient.post<void>("/auth/logout"),
  refresh: (refreshToken: string) => apiClient.post<AuthSession>("/auth/refresh", { refreshToken }),
  forgotPassword: (email: string) => apiClient.post<void>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => apiClient.post<void>("/auth/reset-password", { token, password }),
  verifyEmail: (token: string) => apiClient.post<void>("/auth/verify-email", { token }),
  getProfile: () => apiClient.get<AuthUser>("/auth/profile"),
  updateProfile: (data: Partial<AuthUser>) => apiClient.put<AuthUser>("/auth/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put<void>("/auth/password", data),
};
