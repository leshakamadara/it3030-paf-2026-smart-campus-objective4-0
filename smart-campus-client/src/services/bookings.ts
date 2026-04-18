import type {
  Booking,
  BookingCreatePayload,
  BookingPageResponse,
  BookingQrVerificationResponse,
  BookingRejectPayload,
  BookingStatus,
  ResourceSummary,
} from "@/types/booking";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

type ApiError = Error & { status?: number };

function buildHeaders(): HeadersInit {
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
      ...buildHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = (await response.json()) as { message?: string; error?: string };
        message = json.message ?? json.error ?? message;
      } else {
        const text = await response.text();
        if (text) {
          message = text;
        }
      }
    } catch {
      // keep fallback message
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function createBooking(payload: BookingCreatePayload): Promise<Booking> {
  return request<Booking>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyBookings(page = 0, size = 10): Promise<BookingPageResponse> {
  return request<BookingPageResponse>(`/api/bookings/my?page=${page}&size=${size}`);
}

export function getBooking(id: string): Promise<Booking> {
  return request<Booking>(`/api/bookings/${id}`);
}

export function getAllBookings(params?: {
  status?: BookingStatus;
  resourceId?: string;
  userId?: string;
  fromTime?: string;
  toTime?: string;
  page?: number;
  size?: number;
}): Promise<BookingPageResponse> {
  const query = new URLSearchParams();

  if (params?.status) {
    query.set("status", params.status);
  }
  if (params?.resourceId) {
    query.set("resourceId", params.resourceId);
  }
  if (params?.userId) {
    query.set("userId", params.userId);
  }
  if (params?.fromTime) {
    query.set("fromTime", params.fromTime);
  }
  if (params?.toTime) {
    query.set("toTime", params.toTime);
  }

  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 10));

  return request<BookingPageResponse>(`/api/bookings?${query.toString()}`);
}

export function approveBooking(id: string): Promise<Booking> {
  return request<Booking>(`/api/bookings/${id}/approve`, {
    method: "PATCH",
  });
}

export function rejectBooking(id: string, payload: BookingRejectPayload): Promise<Booking> {
  return request<Booking>(`/api/bookings/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function cancelBooking(id: string): Promise<Booking> {
  return request<Booking>(`/api/bookings/${id}/cancel`, {
    method: "PATCH",
  });
}

export function verifyQrToken(token: string): Promise<BookingQrVerificationResponse> {
  return request<BookingQrVerificationResponse>(`/api/bookings/qr/${encodeURIComponent(token)}`);
}

function normalizeResource(raw: unknown): ResourceSummary | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const idValue = item.id ?? item.resourceId ?? item.uuid;
  if (typeof idValue !== "string" || idValue.trim().length === 0) {
    return null;
  }

  return {
    id: idValue,
    name:
      typeof item.name === "string"
        ? item.name
        : typeof item.resourceName === "string"
          ? item.resourceName
          : typeof item.title === "string"
            ? item.title
            : undefined,
    type:
      typeof item.type === "string"
        ? item.type
        : typeof item.resourceType === "string"
          ? item.resourceType
          : typeof item.category === "string"
            ? item.category
            : undefined,
    imageUrl:
      typeof item.imageUrl === "string"
        ? item.imageUrl
        : typeof item.thumbnailUrl === "string"
          ? item.thumbnailUrl
          : typeof item.image === "string"
            ? item.image
            : undefined,
  };
}

export async function getResources(): Promise<ResourceSummary[]> {
  const data = await request<unknown>("/api/resources");

  if (Array.isArray(data)) {
    return data.map(normalizeResource).filter((item): item is ResourceSummary => item !== null);
  }

  if (data && typeof data === "object") {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) {
      return content.map(normalizeResource).filter((item): item is ResourceSummary => item !== null);
    }
  }

  return [];
}
