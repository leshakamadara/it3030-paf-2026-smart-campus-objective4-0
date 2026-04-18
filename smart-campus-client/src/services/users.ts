const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type Role = "USER" | "TECHNICIAN" | "ADMIN" | "SUPER_ADMIN";

export interface UserProfile {
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

interface AuthMeResponse {
  token: string | null;
  user: UserProfile | null;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return {
      "Content-Type": "application/json",
    };
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
    throw new Error(text || `Request failed with status ${response.status}`);
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

export function getAuthMe() {
  return request<AuthMeResponse>("/api/auth/me");
}

export function getMyProfile() {
  return request<UserProfile>("/api/users/me/profile");
}

export function updateMyNotificationPrefs(notificationPrefs: Record<string, boolean>) {
  return request<UserProfile>("/api/users/me/notification-prefs", {
    method: "PATCH",
    body: JSON.stringify({ notificationPrefs }),
  });
}

export function getAllUsers() {
  return request<UserProfile[]>("/api/users");
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

export function activateUser(userId: string) {
  return request<void>(`/api/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify({ active: true }),
  });
}
