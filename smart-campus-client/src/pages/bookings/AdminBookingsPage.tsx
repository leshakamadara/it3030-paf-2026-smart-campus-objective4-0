import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { QrCodeDisplay } from "@/components/bookings/QrCodeDisplay";
import { approveBooking, getAllBookings, rejectBooking } from "@/services/bookings";
import type { Booking, BookingStatus } from "@/types/booking";

const STATUSES: BookingStatus[] = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function StatusPill({ status }: { status: BookingStatus }) {
  const palette: Record<BookingStatus, string> = {
    PENDING: "bg-[#2a2d3a] text-[#d0d6e0]",
    APPROVED: "bg-[#153124] text-[#8ee8b0]",
    REJECTED: "bg-[#32181f] text-[#ffb3c5]",
    CANCELLED: "bg-[#2a2a2a] text-[#b3b3b3]",
  };

  return <span className={`rounded-full px-2 py-1 text-[10px] font-[590] ${palette[status]}`}>{status}</span>;
}

export function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [resourceId, setResourceId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvedBooking, setApprovedBooking] = useState<Booking | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllBookings({
        status: status || undefined,
        resourceId: resourceId || undefined,
        userId: userId || undefined,
        page: 0,
        size: 20,
      });
      setItems(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load all bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleApprove(id: string) {
    try {
      const approved = await approveBooking(id);
      setApprovedBooking(approved);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Enter rejection reason");
    if (!reason) {
      return;
    }

    try {
      await rejectBooking(id, { reason });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
      <h3 className="text-sm font-[590] text-[#f7f8f8]">Admin booking moderation</h3>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as BookingStatus | "")}
          className="h-10 rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>

        <input
          value={resourceId}
          onChange={(event) => setResourceId(event.target.value)}
          placeholder="Filter by resource UUID"
          className="h-10 rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0]"
        />

        <input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Filter by user UUID"
          className="h-10 rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0]"
        />
      </div>

      <Button onClick={() => void load()} className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]">
        Apply filters
      </Button>

      {error && <p className="rounded-lg border border-[#ff6a8b4d] bg-[#2a1018] p-3 text-sm text-[#ffc2d0]">{error}</p>}
      {loading && <p className="text-sm text-[#8a8f98]">Loading all bookings...</p>}

      <div className="space-y-3">
        {items.map((booking) => (
          <article key={booking.id} className="rounded-lg border border-[#ffffff14] bg-[#08090a] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-[510] text-[#f7f8f8]">{booking.purpose}</p>
              <StatusPill status={booking.status} />
            </div>
            <p className="mt-1 text-xs text-[#8a8f98]">Resource {booking.resourceId}</p>
            <p className="text-xs text-[#8a8f98]">User {booking.userId}</p>
            <p className="text-xs text-[#62666d]">{new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>

            {booking.status === "PENDING" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => void handleApprove(booking.id)}
                  className="border border-[#1f4d33] bg-[#163623] text-[#9af0bc] hover:bg-[#1e442d]"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => void handleReject(booking.id)}
                  className="border border-[#5a2031] bg-[#341522] text-[#ffc2d0] hover:bg-[#462030]"
                >
                  Reject
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      {approvedBooking && (
        <QrCodeDisplay token={approvedBooking.qrCodeToken} base64Image={approvedBooking.qrCodeImageBase64} />
      )}
    </section>
  );
}
