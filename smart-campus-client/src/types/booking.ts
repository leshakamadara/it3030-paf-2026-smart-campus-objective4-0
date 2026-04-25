export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Booking {
  id: string;
  resourceId: number;       // Long from backend (numeric)
  userId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number | null;
  reviewedBy: string | null;
  reviewReason: string | null;
  reviewedAt: string | null;
  qrCodeToken: string | null;
  qrCodeImageBase64: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  resourceName?: string;
  resourceCode?: string;
  resourceType?: string;
  building?: string;
  capacity?: number;
  userName?: string;
}

export interface BookingPageResponse {
  content: Booking[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface BookingCreatePayload {
  resourceId: number;       // Long to backend (numeric)
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount?: number;
}

export interface BookingRejectPayload {
  reason: string;
}

export interface BookingQrVerificationResponse {
  valid: boolean;
  message: string;
  booking: Booking | null;
}

export interface ResourceSummary {
  id: string;               // stringified Long (e.g. "1", "2")
  name?: string;
  type?: string;
  imageUrl?: string;
}
