import type { NotificationItem, NotificationPageResponse } from "@/types/notification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getNotifications(page = 0, size = 10): Promise<NotificationPageResponse> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  }).toString();

  return request<NotificationPageResponse>(`/api/notifications?${query}`);
}

export async function getUnreadCount(): Promise<number> {
  const data = await request<{ count: number }>("/api/notifications/unread-count");
  return data.count;
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  return request<NotificationItem>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const data = await request<{ updated: number }>("/api/notifications/read-all", {
    method: "PATCH",
  });
  return data.updated;
}

export async function deleteNotification(id: string): Promise<void> {
  await request<void>(`/api/notifications/${id}`, {
    method: "DELETE",
  });
}
