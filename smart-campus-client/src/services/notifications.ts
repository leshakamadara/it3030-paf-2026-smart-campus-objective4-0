import { getStoredToken } from "@/services/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export interface NotificationRecord {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  entityType?: string | null;
  entityId?: string | null;
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
    throw new Error(text || `Notification request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function coerceNotification(raw: unknown): NotificationRecord | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = String(data.id ?? "");
  if (!id) {
    return null;
  }

  const message = typeof data.message === "string" ? data.message : "";
  const type = typeof data.type === "string" ? data.type : "NOTICE";

  return {
    id,
    type,
    title: typeof data.title === "string" ? data.title : type.replace(/_/g, " "),
    message,
    read: Boolean(data.read ?? data.isRead ?? false),
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : typeof data.timestamp === "string"
          ? data.timestamp
          : new Date().toISOString(),
    entityType: typeof data.entityType === "string" ? data.entityType : null,
    entityId: typeof data.entityId === "string" ? data.entityId : null,
  };
}

export async function getNotifications(): Promise<NotificationRecord[]> {
  const data = await request<unknown[]>("/api/notifications");
  return data.map(coerceNotification).filter((item): item is NotificationRecord => item !== null);
}

export async function getUnreadCount(): Promise<number> {
  const data = await request<unknown>("/api/notifications/unread-count");
  if (typeof data === "number") {
    return data;
  }

  if (data && typeof data === "object") {
    const count = (data as { count?: unknown }).count;
    if (typeof count === "number") {
      return count;
    }
  }

  return 0;
}

export function markNotificationAsRead(notificationId: string) {
  return request<void>(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export function markAllNotificationsAsRead() {
  return request<void>("/api/notifications/read-all", {
    method: "PATCH",
  });
}

export function deleteNotification(notificationId: string) {
  return request<void>(`/api/notifications/${notificationId}`, {
    method: "DELETE",
  });
}
