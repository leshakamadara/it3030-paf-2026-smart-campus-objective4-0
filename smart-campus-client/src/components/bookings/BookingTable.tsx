import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { Booking } from "@/types/booking";

interface BookingTableProps {
  bookings: Booking[];
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onOpenDetail: (booking: Booking) => void;
}

export function BookingTable({ bookings, onApprove, onReject, onOpenDetail }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-[#ffffff] border border-[#e6e6e6]">
        <p className="text-sm font-medium text-[#8a8f98]">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#e6e6e6] bg-[#ffffff] shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#e6e6e6] bg-[#fbfcfc] text-xs font-semibold uppercase tracking-wider text-[#8a8f98]">
          <tr>
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Resource</th>
            <th className="px-4 py-3 font-semibold">Time</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e6e6e6]">
          {bookings.map((booking) => {
            const pending = booking.status === "PENDING";
            return (
              <tr
                key={booking.id}
                className={`transition-colors hover:bg-[#f7f8f8] ${pending ? "bg-[#ede9ff]/30" : "bg-transparent"}`}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#191a1b] truncate max-w-[150px]">
                      {booking.userName || booking.userId}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#191a1b] truncate max-w-[150px]">
                      {booking.resourceName || booking.resourceId}
                    </span>
                    <span className="text-xs text-[#8a8f98]">{booking.building}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[#43464b]">
                  <div className="whitespace-nowrap">
                    {new Date(booking.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="whitespace-nowrap text-[#8a8f98]">
                    {new Date(booking.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(booking)}
                      className="rounded-md border border-[#d0d6e0] bg-[#ffffff] px-2.5 py-1 text-xs font-semibold text-[#43464b] transition-colors hover:bg-[#f3f4f5]"
                    >
                      View
                    </button>
                    {pending && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(booking.id)}
                          className="rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-xs font-semibold text-[#166534] transition-colors hover:bg-[#d1fae5]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(booking.id)}
                          className="rounded-md border border-[#fecdd3] bg-[#fff1f2] px-2.5 py-1 text-xs font-semibold text-[#9f1239] transition-colors hover:bg-[#ffe4e6]"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
