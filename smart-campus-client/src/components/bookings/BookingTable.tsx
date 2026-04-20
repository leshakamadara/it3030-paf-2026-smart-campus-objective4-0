import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { Booking } from "@/types/booking";

interface BookingTableProps {
  bookings: Booking[];
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onOpenDetail: (booking: Booking) => void;
}

export function BookingTable({ bookings, onApprove, onReject, onOpenDetail }: BookingTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#ffffff14] bg-[#0f1011]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#ffffff14] bg-[#121316] text-xs uppercase tracking-[0.12em] text-[#8a8f98]">
          <tr>
            <th className="px-3 py-3">User</th>
            <th className="px-3 py-3">Resource</th>
            <th className="px-3 py-3">Time</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const pending = booking.status === "PENDING";
            return (
              <tr
                key={booking.id}
                className={`border-b border-[#ffffff0d] ${pending ? "bg-[#1a1c28]" : "bg-transparent"}`}
              >
                <td className="px-3 py-3 text-xs text-[#d0d6e0]">{booking.userId}</td>
                <td className="px-3 py-3 text-xs text-[#d0d6e0]">{booking.resourceId}</td>
                <td className="px-3 py-3 text-xs text-[#8a8f98]">
                  {new Date(booking.startTime).toLocaleString()}<br />
                  {new Date(booking.endTime).toLocaleString()}
                </td>
                <td className="px-3 py-3"><BookingStatusBadge status={booking.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(booking)}
                      className="rounded-md border border-[#ffffff14] bg-[#191a1b] px-2 py-1 text-xs text-[#d0d6e0] hover:bg-[#25272a]"
                    >
                      View
                    </button>
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(booking.id)}
                          className="rounded-md border border-[#1f4d33] bg-[#163623] px-2 py-1 text-xs text-[#9af0bc] hover:bg-[#1e442d]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(booking.id)}
                          className="rounded-md border border-[#5a2031] bg-[#341522] px-2 py-1 text-xs text-[#ffc2d0] hover:bg-[#462030]"
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
