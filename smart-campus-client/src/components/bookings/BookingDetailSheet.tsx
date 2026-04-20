import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { QrCodeDisplay } from "@/components/bookings/QrCodeDisplay";
import { WorkflowTimeline } from "@/components/bookings/WorkflowTimeline";
import type { Booking } from "@/types/booking";

interface BookingDetailSheetProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

export function BookingDetailSheet({ booking, open, onClose }: BookingDetailSheetProps) {
  if (!open || !booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60">
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-[#ffffff14] bg-[#0f1011] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-[590] text-[#f7f8f8]">Booking Details</h3>
          <Button onClick={onClose} className="border border-[#ffffff14] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]">Close</Button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-[#d0d6e0]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-[#8a8f98]">{booking.id}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p>Resource: {booking.resourceId}</p>
          <p>User: {booking.userId}</p>
          <p>
            Time: {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
          </p>
          <p>Purpose: {booking.purpose}</p>
          <p>Attendee count: {booking.attendeeCount ?? "N/A"}</p>

          <WorkflowTimeline status={booking.status} />

          {booking.reviewReason && (
            <div className="rounded-lg border border-[#5a2031] bg-[#32181f] p-3 text-[#ffc2d0]">
              Rejection reason: {booking.reviewReason}
            </div>
          )}

          <div className="grid gap-2 rounded-lg border border-[#ffffff14] bg-[#08090a] p-3 text-xs text-[#8a8f98]">
            <p>Reviewed by: {booking.reviewedBy ?? "-"}</p>
            <p>Reviewed at: {booking.reviewedAt ? new Date(booking.reviewedAt).toLocaleString() : "-"}</p>
            <p>Updated at: {new Date(booking.updatedAt).toLocaleString()}</p>
          </div>

          <QrCodeDisplay token={booking.qrCodeToken} base64Image={booking.qrCodeImageBase64} />
        </div>
      </aside>
    </div>
  );
}
