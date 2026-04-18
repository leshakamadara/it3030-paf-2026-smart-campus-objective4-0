export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Booking {
  id: string;
  resourceId: string;
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
  resourceId: string;
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
