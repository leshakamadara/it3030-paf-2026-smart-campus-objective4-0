import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BookingCard } from "@/components/bookings/BookingCard";
import { ConflictAlert } from "@/components/bookings/ConflictAlert";
import { StatusTabs, isMatchingStatus, type BookingStatusTab } from "@/components/bookings/StatusTabs";
import { cancelBooking, getMyBookings } from "@/services/bookings";
import type { Booking } from "@/types/booking";

export function MyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [tab, setTab] = useState<BookingStatusTab>("ALL");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  async function load(currentPage: number) {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyBookings(currentPage, 8);
      setItems(response.content);
      setLast(response.last);
      setPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(0);
  }, []);

  const counts = useMemo(() => {
    return {
      ALL: items.length,
      PENDING: items.filter((booking) => booking.status === "PENDING").length,
      APPROVED: items.filter((booking) => booking.status === "APPROVED").length,
      REJECTED: items.filter((booking) => booking.status === "REJECTED").length,
      CANCELLED: items.filter((booking) => booking.status === "CANCELLED").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const fromTimestamp = fromTime ? Date.parse(fromTime) : null;
    const toTimestamp = toTime ? Date.parse(toTime) : null;

    return items.filter((booking) => {
      if (!isMatchingStatus(tab, booking.status)) {
        return false;
      }

      const bookingStart = Date.parse(booking.startTime);
      const bookingEnd = Date.parse(booking.endTime);

      if (fromTimestamp !== null && bookingEnd < fromTimestamp) {
        return false;
      }

      if (toTimestamp !== null && bookingStart > toTimestamp) {
        return false;
      }

      return true;
    });
  }, [items, tab, fromTime, toTime]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
        <div>
          <h2 className="text-lg font-[590] tracking-tight text-[#f7f8f8]">My Bookings</h2>
          <p className="text-sm text-[#8a8f98]">Track booking requests, approvals, and check-in QR codes.</p>
        </div>

        <Link to="/bookings/new">
          <Button className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]">New Booking</Button>
        </Link>
      </header>

      <StatusTabs value={tab} counts={counts} onChange={setTab} />

      <div className="grid gap-3 rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4 md:grid-cols-2">
        <label className="space-y-1 text-xs text-[#8a8f98]">
          <span className="font-[510] text-[#d0d6e0]">From</span>
          <input
            type="datetime-local"
            value={fromTime}
            onChange={(event) => setFromTime(event.target.value)}
            className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
          />
        </label>
        <label className="space-y-1 text-xs text-[#8a8f98]">
          <span className="font-[510] text-[#d0d6e0]">To</span>
          <input
            type="datetime-local"
            value={toTime}
            onChange={(event) => setToTime(event.target.value)}
            className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
          />
        </label>
      </div>

      {conflict && <ConflictAlert message={conflict} onClose={() => setConflict(null)} />}
      {error && (
        <p className="rounded-lg border border-[#ffffff14] bg-[#1a1b1d] p-3 text-sm text-[#ffb3c5]">{error}</p>
      )}

      {loading && <p className="text-sm text-[#8a8f98]">Loading bookings...</p>}

      {!loading && filteredItems.length === 0 && (
        <p className="rounded-xl border border-dashed border-[#ffffff22] bg-[#0f1011] p-5 text-sm text-[#8a8f98]">
          {tab === "ALL" ? "No bookings found for the selected date range." : `No ${tab.toLowerCase()} bookings found for the selected range.`}
        </p>
      )}

      <div className="space-y-3">
        {filteredItems.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            resource={{ id: booking.resourceId, name: `Resource ${booking.resourceId.slice(0, 8)}` }}
            onCancel={(bookingId) =>
              void cancelBooking(bookingId)
                .then(() => {
                  toast.success("Booking cancelled successfully");
                  return load(page);
                })
                .catch((err: unknown) =>
                  setError(err instanceof Error ? err.message : "Failed to cancel booking"),
                )
            }
            onError={(message) => setError(message)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          disabled={page === 0 || loading}
          onClick={() => void load(Math.max(page - 1, 0))}
          className="border border-[#ffffff22] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]"
        >
          Previous
        </Button>
        <Button
          disabled={last || loading}
          onClick={() => void load(page + 1)}
          className="border border-[#ffffff22] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
