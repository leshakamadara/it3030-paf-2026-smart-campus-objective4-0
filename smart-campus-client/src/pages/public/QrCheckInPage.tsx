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

  const resourceLabel =
    (booking && "resourceName" in booking && typeof booking.resourceName === "string" && booking.resourceName) ||
    booking?.resourceId ||
    "Unknown resource"

  const bookerLabel =
    (booking && "bookerName" in booking && typeof booking.bookerName === "string" && booking.bookerName) ||
    (booking && "userName" in booking && typeof booking.userName === "string" && booking.userName) ||
    booking?.userId ||
    "Unknown user"

  return (
    <main className="grid min-h-svh place-items-center bg-[#f7f8f8] px-4 py-10 text-[#191a1b]">
      <Card className="w-full max-w-lg border-[#d0d6e0] bg-white">
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
                {valid ? "Check-in approved. Booking is valid." : "Invalid or expired token."}
              </div>

              {booking && (
                <dl className="space-y-2 rounded-lg border border-[#d0d6e0] bg-[#f9f9fb] p-4 text-[#43464b]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#62666d]">Resource</dt>
                    <dd className="text-right font-[510]">{resourceLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#62666d]">Booked by</dt>
                    <dd className="text-right font-[510]">{bookerLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#62666d]">Time</dt>
                    <dd className="text-right font-[510]">{formatDateRange(booking.startTime, booking.endTime)}</dd>
                  </div>
                </dl>
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
    </main>
  )
}
