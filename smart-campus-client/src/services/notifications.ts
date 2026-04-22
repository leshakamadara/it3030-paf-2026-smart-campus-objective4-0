import { getStoredToken } from "@/services/auth";
import type { NotificationItem, NotificationPageResponse } from "@/types/notification";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// Re-export for backwards compatibility with components using NotificationRecord
export type NotificationRecord = NotificationItem;

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    let message = `Notification request failed: ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function coerce(raw: unknown): NotificationItem | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const id = String(d.id ?? "");
  if (!id) return null;

  const type = typeof d.type === "string" ? d.type : "SYSTEM";

  return {
    id,
    userId: typeof d.userId === "string" ? d.userId : "",
    type: type as NotificationItem["type"],
    title: typeof d.title === "string" ? d.title : type.replace(/_/g, " "),
    message: typeof d.message === "string" ? d.message : "",
    // Backend record field is "isRead" — Java record serialises component name as-is
    isRead: Boolean(d.isRead ?? d.read ?? false),
    entityType: typeof d.entityType === "string" ? d.entityType : null,
    entityId: typeof d.entityId === "string" ? d.entityId : null,
    readAt: typeof d.readAt === "string" ? d.readAt : null,
    createdAt:
      typeof d.createdAt === "string"
        ? d.createdAt
        : typeof d.timestamp === "string"
          ? d.timestamp
          : new Date().toISOString(),
  };
}

export async function getNotifications(page = 0, size = 20): Promise<NotificationItem[]> {
  // Backend returns NotificationPageResponse { content: [...], page, size, ... }
  const data = await request<NotificationPageResponse>(`/api/notifications?page=${page}&size=${size}`);
  return (data.content ?? []).map(coerce).filter((n): n is NotificationItem => n !== null);
}

export async function getNotificationsPage(page = 0, size = 20): Promise<NotificationPageResponse> {
  return request<NotificationPageResponse>(`/api/notifications?page=${page}&size=${size}`);
}

export async function getUnreadCount(): Promise<number> {
  const data = await request<{ count?: number }>("/api/notifications/unread-count");
  return typeof data.count === "number" ? data.count : 0;
}

export function markNotificationAsRead(id: string): Promise<void> {
  return request<void>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsAsRead(): Promise<void> {
  return request<void>("/api/notifications/read-all", { method: "PATCH" });
}

export function deleteNotification(id: string): Promise<void> {
  return request<void>(`/api/notifications/${id}`, { method: "DELETE" });
}
