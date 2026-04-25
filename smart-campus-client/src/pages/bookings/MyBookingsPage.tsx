import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BookingCard } from "@/components/bookings/BookingCard";
import { ConflictAlert } from "@/components/bookings/ConflictAlert";
import { StatusTabs, isMatchingStatus, type BookingStatusTab } from "@/components/bookings/StatusTabs";
import { PageHeader } from "@/components/layout/PageHeader";
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
    <div className="min-h-screen bg-[#f7f8f8]">
      <PageHeader
        label="HELAUNI.APP"
        title="My Bookings"
        description="Track booking requests, approvals, and check-in QR codes."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Bookings" },
        ]}
        action={
          <Link to="/dashboard/bookings/new">
            <Button className="bg-[#5e6ad2] text-white hover:bg-[#7170ff] shadow-none rounded-md text-xs font-[510] h-9 px-4">
              + New Booking
            </Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-5">
        <StatusTabs value={tab} counts={counts} onChange={setTab} />

        <div className="grid gap-3 rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-4 md:grid-cols-2">
          <label className="space-y-1 text-xs text-[#8a8f98]">
            <span className="font-[510] text-[#43464b]">From</span>
            <input
              type="datetime-local"
              value={fromTime}
              onChange={(event) => setFromTime(event.target.value)}
              className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b] focus:border-[#7170ff] focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-xs text-[#8a8f98]">
            <span className="font-[510] text-[#43464b]">To</span>
            <input
              type="datetime-local"
              value={toTime}
              onChange={(event) => setToTime(event.target.value)}
              className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b] focus:border-[#7170ff] focus:outline-none"
            />
          </label>
        </div>

        {conflict && <ConflictAlert message={conflict} onClose={() => setConflict(null)} />}
        {error && (
          <p className="rounded-lg border border-[#f0b8c4] bg-[#fff1f4] p-3 text-sm text-[#8f3346]">{error}</p>
        )}

        {loading && <p className="text-sm text-[#8a8f98]">Loading bookings...</p>}

        {!loading && filteredItems.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#d0d6e0] bg-[#ffffff] p-5 text-sm text-[#8a8f98]">
            {tab === "ALL" ? "No bookings found for the selected date range." : `No ${tab.toLowerCase()} bookings found for the selected range.`}
          </p>
        )}

        <div className="space-y-3">
          {filteredItems.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              resource={{ id: String(booking.resourceId), name: `Resource #${booking.resourceId}` }}
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
            className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#e6e6e6]"
          >
            Previous
          </Button>
          <Button
            disabled={last || loading}
            onClick={() => void load(page + 1)}
            className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#e6e6e6]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
