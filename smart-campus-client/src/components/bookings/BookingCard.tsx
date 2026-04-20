import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { verifyQrToken } from "@/services/bookings";
import type { Booking, ResourceSummary } from "@/types/booking";

interface BookingCardProps {
  booking: Booking;
  resource?: ResourceSummary;
  onCancel?: (bookingId: string) => void;
  onError?: (message: string) => void;
}

function triggerDownload(base64: string, fileName: string) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64}`;
  link.download = fileName;
  link.click();
}

export function BookingCard({ booking, resource, onCancel, onError }: BookingCardProps) {
  const canCancel = booking.status === "APPROVED";
  const resourceName = resource?.name ?? "Resource";

  async function handleQrDownload() {
    try {
      const base64 = booking.qrCodeImageBase64
        ? booking.qrCodeImageBase64
        : booking.qrCodeToken
          ? (await verifyQrToken(booking.qrCodeToken)).booking?.qrCodeImageBase64 ?? null
          : null;

      if (!base64) {
        throw new Error("QR code is not available for this booking");
      }

      triggerDownload(base64, `booking-${booking.id}-qr.png`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to download QR code";
      onError?.(message);
    }
  }

  return (
    <article className="rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-start gap-4">
        {resource?.imageUrl ? (
          <img src={resource.imageUrl} alt={resourceName} className="h-16 w-16 rounded-lg border border-[#ffffff14] object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-lg border border-[#ffffff14] bg-[#15171b]" />
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="truncate text-sm font-[590] text-[#f7f8f8]">{resourceName}</h3>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-[#d0d6e0]">{booking.purpose}</p>
          <p className="text-xs text-[#8a8f98]">
            {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
          </p>
          <p className="text-[10px] text-[#62666d]">Attendees: {booking.attendeeCount ?? "N/A"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/bookings/${booking.id}`}>
          <Button className="border border-[#ffffff14] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]">View details</Button>
        </Link>

        {canCancel && (
          <Button
            onClick={() => onCancel?.(booking.id)}
            className="border border-[#5a2031] bg-[#341522] text-[#ffc2d0] hover:bg-[#462030]"
          >
            Cancel
          </Button>
        )}

        {booking.status === "APPROVED" && booking.qrCodeToken && (
          <Button
            onClick={() => void handleQrDownload()}
            className="border border-[#1f4d33] bg-[#163623] text-[#9af0bc] hover:bg-[#1e442d]"
          >
            Download QR
          </Button>
        )}
      </div>
    </article>
  );
}
