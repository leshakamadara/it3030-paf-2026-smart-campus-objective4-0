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
  const canCancel = booking.status === "APPROVED" || booking.status === "PENDING";
  const resourceName = resource?.name ?? `Resource #${booking.resourceId}`;

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
    <article className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {resource?.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resourceName}
            className="h-16 w-16 flex-shrink-0 rounded-lg border border-[#d0d6e0] object-cover"
          />
        ) : (
          <div className="h-16 w-16 flex-shrink-0 rounded-lg border border-[#d0d6e0] bg-[#f3f4f5] flex items-center justify-center">
            <span className="text-xl">📦</span>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="truncate text-sm font-[590] text-[#191a1b]">{resourceName}</h3>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-[#43464b]">{booking.purpose}</p>
          <p className="text-xs text-[#8a8f98]">
            {new Date(booking.startTime).toLocaleString()} — {new Date(booking.endTime).toLocaleString()}
          </p>
          <p className="text-[10px] text-[#8a8f98]">
            Attendees: {booking.attendeeCount ?? "N/A"} · Resource #{booking.resourceId}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/dashboard/bookings/${booking.id}`}>
          <Button className="h-8 border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-xs text-[#43464b] hover:bg-[#f3f4f5]">
            View details
          </Button>
        </Link>

        {canCancel && (
          <Button
            onClick={() => onCancel?.(booking.id)}
            className="h-8 border border-[#f0b8c4] bg-[#fff1f4] px-3 text-xs text-[#8f3346] hover:bg-[#ffe6ec]"
          >
            Cancel
          </Button>
        )}

        {booking.status === "APPROVED" && booking.qrCodeToken && (
          <Button
            onClick={() => void handleQrDownload()}
            className="h-8 border border-[#bbf7d0] bg-[#f0fdf4] px-3 text-xs text-[#166534] hover:bg-[#dcfce7]"
          >
            Download QR
          </Button>
        )}
      </div>
    </article>
  );
}
