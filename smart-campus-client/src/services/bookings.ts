const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

export interface PublicBookingSummary {
  id: string
  resourceId?: string | null
  resourceName?: string | null
  userId?: string | null
  userName?: string | null
  bookerName?: string | null
  startTime?: string | null
  endTime?: string | null
  status?: string | null
}

export interface BookingQrVerificationResponse {
  valid: boolean
  message: string
  booking: PublicBookingSummary | null
}

export async function verifyQrToken(token: string): Promise<BookingQrVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/bookings/qr/${encodeURIComponent(token)}`)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "QR validation failed")
  }

  return (await response.json()) as BookingQrVerificationResponse
}
