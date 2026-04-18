import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/bookings/BookingForm";
import { ConflictAlert } from "@/components/bookings/ConflictAlert";
import { cancelBooking, getMyBookings } from "@/services/bookings";
import type { Booking } from "@/types/booking";

function StatusPill({ status }: { status: Booking["status"] }) {
  const palette: Record<Booking["status"], string> = {
    PENDING: "bg-[#2a2d3a] text-[#d0d6e0]",
    APPROVED: "bg-[#153124] text-[#8ee8b0]",
    REJECTED: "bg-[#32181f] text-[#ffb3c5]",
    CANCELLED: "bg-[#2a2a2a] text-[#b3b3b3]",
  };

  return <span className={`rounded-full px-2 py-1 text-[10px] font-[590] ${palette[status]}`}>{status}</span>;
}

export function MyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
      <BookingForm
        onCreated={() => void load(0)}
        onConflict={(message) => setConflict(message)}
        onError={(message) => setError(message)}
      />

      {conflict && <ConflictAlert message={conflict} onClose={() => setConflict(null)} />}
      {error && (
        <p className="rounded-lg border border-[#ffffff14] bg-[#1a1b1d] p-3 text-sm text-[#ffb3c5]">{error}</p>
      )}

      <section className="rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
        <h3 className="mb-3 text-sm font-[590] text-[#f7f8f8]">My bookings</h3>

        {loading && <p className="text-sm text-[#8a8f98]">Loading bookings...</p>}

        {!loading && items.length === 0 && (
          <p className="rounded-lg border border-dashed border-[#ffffff22] p-4 text-sm text-[#8a8f98]">
            No bookings yet.
          </p>
        )}

        <div className="space-y-3">
          {items.map((booking) => (
            <article key={booking.id} className="rounded-lg border border-[#ffffff14] bg-[#08090a] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-[510] text-[#f7f8f8]">{booking.purpose}</p>
                <StatusPill status={booking.status} />
              </div>
              <p className="mt-1 text-xs text-[#8a8f98]">{new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>
              <p className="mt-1 text-xs text-[#62666d]">Resource: {booking.resourceId}</p>
              {booking.reviewReason && <p className="mt-2 text-xs text-[#ffb3c5]">Reason: {booking.reviewReason}</p>}

              {booking.status === "APPROVED" && (
                <div className="mt-3">
                  <Button
                    onClick={() =>
                      void cancelBooking(booking.id)
                        .then(() => load(page))
                        .catch((err: unknown) =>
                          setError(err instanceof Error ? err.message : "Failed to cancel booking"),
                        )
                    }
                    className="border border-[#ffffff22] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]"
                  >
                    Cancel booking
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
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
      </section>
    </div>
  );
}
