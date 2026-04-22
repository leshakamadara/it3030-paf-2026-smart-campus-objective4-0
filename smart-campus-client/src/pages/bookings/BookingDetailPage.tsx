import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { QrCodeDisplay } from "@/components/bookings/QrCodeDisplay";
import { WorkflowTimeline } from "@/components/bookings/WorkflowTimeline";
import { Button } from "@/components/ui/button";
import { cancelBooking, getBooking, getResources } from "@/services/bookings";
import type { Booking, ResourceSummary } from "@/types/booking";

export function BookingDetailPage() {
  const { id } = useParams();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [resource, setResource] = useState<ResourceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) {
      setError("Booking ID is missing in route");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getBooking(id);
      setBooking(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }

  // Resolve resource name from resource list using numeric id
  useEffect(() => {
    if (booking?.resourceId == null) {
      setResource(null);
      return;
    }

    void getResources()
      .then((resources) => {
        // resourceId is a number, ResourceSummary.id is stringified
        const match = resources.find((item) => item.id === String(booking.resourceId)) ?? null;
        setResource(match);
      })
      .catch(() => {
        setResource(null);
      });
  }, [booking?.resourceId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCancel() {
    if (!booking) return;

    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
      toast.success("Booking cancelled successfully.");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Failed to cancel booking");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <p className="text-sm text-[#8a8f98]">Loading booking details…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-3 px-4 py-6">
        <div className="rounded-xl border border-[#f0b8c4] bg-[#fff1f4] p-4">
          <p className="text-sm font-[510] text-[#8f3346]">{error ?? "Booking not found"}</p>
        </div>
        <Link to="/bookings">
          <Button className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]">
            ← Back to bookings
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel = booking.status === "APPROVED" || booking.status === "PENDING";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      {/* Header */}
      <header className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-[510] uppercase tracking-[0.18em] text-[#5e6ad2]">Booking Detail</p>
            <h1 className="mt-1 text-2xl font-[590] tracking-[-0.44px] text-[#191a1b]">
              {resource?.name ?? `Resource #${booking.resourceId}`}
            </h1>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="mt-2 font-mono text-xs text-[#8a8f98]">{booking.id}</p>
      </header>

      {/* Resource info */}
      <section className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-4">
        <p className="mb-3 text-xs font-[510] uppercase tracking-[0.12em] text-[#62666d]">Resource</p>
        <div className="flex items-center gap-3">
          {resource?.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={resource.name ?? "Resource"}
              className="h-14 w-14 rounded-lg border border-[#d0d6e0] object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#d0d6e0] bg-[#f3f4f5]">
              <span className="text-2xl">📦</span>
            </div>
          )}
          <div>
            <p className="text-sm font-[590] text-[#191a1b]">
              {resource?.name ?? `Resource #${booking.resourceId}`}
            </p>
            <p className="text-xs text-[#8a8f98]">{resource?.type ?? "General resource"}</p>
            <Link
              to={`/resources/${booking.resourceId}`}
              className="mt-1 inline-block text-xs text-[#5e6ad2] hover:underline"
            >
              View resource →
            </Link>
          </div>
        </div>
      </section>

      {/* Booking details */}
      <section className="space-y-2 rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-4 text-sm">
        <p className="mb-3 text-xs font-[510] uppercase tracking-[0.12em] text-[#62666d]">Details</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#d0d6e0] bg-[#f7f8f8] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8f98]">Start</p>
            <p className="mt-1 text-xs font-[510] text-[#191a1b]">
              {new Date(booking.startTime).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-[#d0d6e0] bg-[#f7f8f8] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8f98]">End</p>
            <p className="mt-1 text-xs font-[510] text-[#191a1b]">
              {new Date(booking.endTime).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-[#d0d6e0] bg-[#f7f8f8] p-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8f98]">Purpose</p>
          <p className="mt-1 text-xs text-[#191a1b]">{booking.purpose}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-[#d0d6e0] bg-[#f7f8f8] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#8a8f98]">Attendees</p>
            <p className="mt-1 text-xs font-[510] text-[#191a1b]">{booking.attendeeCount ?? "Not specified"}</p>
          </div>
          {booking.reviewReason && (
            <div className="rounded-lg border border-[#f0b8c4] bg-[#fff1f4] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#8f3346]">Review reason</p>
              <p className="mt-1 text-xs text-[#8f3346]">{booking.reviewReason}</p>
            </div>
          )}
        </div>

        <WorkflowTimeline status={booking.status} />
      </section>

      {/* QR Code */}
      <QrCodeDisplay token={booking.qrCodeToken} base64Image={booking.qrCodeImageBase64} />

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {canCancel && (
          <Button
            onClick={() => void handleCancel()}
            className="border border-[#f0b8c4] bg-[#fff1f4] text-[#8f3346] hover:bg-[#ffe6ec]"
          >
            Cancel Booking
          </Button>
        )}
        <Link to="/bookings">
          <Button className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]">
            ← Back to bookings
          </Button>
        </Link>
        <Link to={`/resources/${booking.resourceId}`}>
          <Button className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]">
            View resource
          </Button>
        </Link>
      </div>
    </div>
  );
}
