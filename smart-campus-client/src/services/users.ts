import { getStoredToken, type AuthUser } from "@/services/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type Role = "USER" | "TECHNICIAN" | "ADMIN" | "SUPER_ADMIN";

export interface UserProfile extends AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  googleSub: string | null;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
  notificationPrefs: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPrefsPayload {
  notificationPrefs: Record<string, boolean>;
}

export interface GeneratedAdminSignupKey {
  signupKey: string;
  expiresAt: string;
  createdAt: string;
  createdByEmail: string;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) {
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getMyProfile() {
  return request<UserProfile>("/api/users/me/profile");
}

export function getAllUsers() {
  return request<UserProfile[]>("/api/users");
}

export function getTechnicians() {
  return request<UserProfile[]>("/api/users/technicians");
}

export function updateMyNotificationPrefs(payload: NotificationPrefsPayload) {
  return request<UserProfile>("/api/users/me/notification-prefs", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateUserRole(userId: string, role: Role) {
  return request<void>(`/api/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function deactivateUser(userId: string) {
  return request<void>(`/api/users/${userId}/deactivate`, {
    method: "PATCH",
  });
}

export function updateUserStatus(userId: string, active: boolean) {
  return request<void>(`/api/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify({ active }),
  });
}

export function generateAdminSignupKey() {
  return request<GeneratedAdminSignupKey>("/api/admin/admin-signup-keys/generate", {
    method: "POST",
  });
}
