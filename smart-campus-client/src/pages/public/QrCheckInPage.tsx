import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyQrToken, type BookingQrVerificationResponse } from "@/services/bookings.ts"

function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) {
    return "Unavailable"
  }

  return `${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}`
}

export function QrCheckInPage() {
  const { token } = useParams<{ token: string }>()

  const [state, setState] = useState<{
    loading: boolean
    data: BookingQrVerificationResponse | null
    error: string | null
  }>({
    loading: true,
    data: null,
    error: null,
  })

  useEffect(() => {
    if (!token) {
      setState({ loading: false, data: null, error: "QR token is missing" })
      return
    }

    setState({ loading: true, data: null, error: null })

    void verifyQrToken(token)
      .then((data: BookingQrVerificationResponse) => {
        setState({ loading: false, data, error: null })
      })
      .catch((error: unknown) => {
        setState({
          loading: false,
          data: null,
          error: error instanceof Error ? error.message : "Invalid or expired QR token",
        })
      })
  }, [token])

  const booking = state.data?.booking ?? null
  const valid = state.data?.valid ?? false

  const getResourceLabel = (): string => {
    if (!booking) return "Unknown resource";
    if ("resourceName" in booking && typeof booking.resourceName === "string" && booking.resourceName) {
      return booking.resourceName;
    }
    return booking?.resourceId ?? "Unknown resource";
  };

  const getBookerLabel = (): string => {
    if (!booking) return "Unknown user";
    if ("bookerName" in booking && typeof booking.bookerName === "string" && booking.bookerName) {
      return booking.bookerName;
    }
    if ("userName" in booking && typeof booking.userName === "string" && booking.userName) {
      return booking.userName;
    }
    return booking?.userId ?? "Unknown user";
  };

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f8f8] text-[#191a1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(113,112,255,0.2),transparent_44%),radial-gradient(circle_at_84%_82%,rgba(94,106,210,0.14),transparent_40%)]" />

      <div className="relative grid min-h-svh place-items-center px-4 py-10 w-full">
        <Card className="relative z-10 w-full max-w-lg border-[#d0d6e0] bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl tracking-[-0.028em]">QR Check-in Verification</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            {state.loading && (
              <div className="rounded-lg border border-[#d0d6e0] bg-[#f5f6f7] p-4 text-[#62666d]">
                Verifying QR token...
              </div>
            )}

            {!state.loading && state.error && (
              <div className="rounded-lg border border-[#f1c7d3] bg-[#fff5f7] p-4 text-[#8f2547]">
                {state.error}
              </div>
            )}

            {!state.loading && !state.error && (
              <>
                <div
                  className={`rounded-lg border p-4 ${
                    valid
                      ? "border-[#b7e6c3] bg-[#f1fff5] text-[#1f6b38]"
                      : "border-[#f1c7d3] bg-[#fff5f7] text-[#8f2547]"
                  }`}
                >
                  {valid ? "Check-in approved. Booking is valid." : (state.data?.message || "Invalid or expired token.")}
                </div>

                {booking && (
                  <div className="space-y-4">
                    <dl className="space-y-2 rounded-lg border border-[#d0d6e0] bg-[#f9f9fb] p-4 text-[#43464b]">
                      <h3 className="font-semibold text-[#191a1b] mb-3 pb-2 border-b border-[#e2e6eb]">Resource Information</h3>
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#62666d]">Name</dt>
                        <dd className="text-right font-[510]">{getResourceLabel()}</dd>
                      </div>
                      {booking.resourceCode && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#62666d]">Code</dt>
                          <dd className="text-right font-[510]">{booking.resourceCode}</dd>
                        </div>
                      )}
                      {booking.resourceType && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#62666d]">Type</dt>
                          <dd className="text-right font-[510] capitalize">{booking.resourceType.toLowerCase().replace(/_/g, ' ')}</dd>
                        </div>
                      )}
                      {booking.building && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#62666d]">Building</dt>
                          <dd className="text-right font-[510]">{booking.building}</dd>
                        </div>
                      )}
                      {booking.capacity != null && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#62666d]">Capacity</dt>
                          <dd className="text-right font-[510]">{booking.capacity} people</dd>
                        </div>
                      )}
                    </dl>

                    <dl className="space-y-2 rounded-lg border border-[#d0d6e0] bg-[#f9f9fb] p-4 text-[#43464b]">
                      <h3 className="font-semibold text-[#191a1b] mb-3 pb-2 border-b border-[#e2e6eb]">Booking Details</h3>
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#62666d]">Booked by</dt>
                        <dd className="text-right font-[510]">{getBookerLabel()}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-[#62666d]">Time</dt>
                        <dd className="text-right font-[510]">{formatDateRange(booking.startTime, booking.endTime)}</dd>
                      </div>
                      {booking.purpose && (
                        <div className="flex justify-between gap-2 border-t border-[#e2e6eb] pt-2 mt-2">
                          <dt className="text-[#62666d]">Purpose</dt>
                          <dd className="text-right font-[510] max-w-[200px] truncate" title={booking.purpose}>{booking.purpose}</dd>
                        </div>
                      )}
                      {booking.attendeeCount != null && (
                        <div className="flex justify-between gap-2">
                          <dt className="text-[#62666d]">Attendees</dt>
                          <dd className="text-right font-[510]">{booking.attendeeCount}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </>
            )}

            <div className="pt-2">
              <Link to="/login">
                <Button className="w-full bg-[#5e6ad2] text-white hover:bg-[#7170ff]">Go to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
