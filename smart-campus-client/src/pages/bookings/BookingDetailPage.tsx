import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

  useEffect(() => {
    if (!booking?.resourceId) {
      setResource(null);
      return;
    }

    void getResources()
      .then((resources) => {
        const match = resources.find((item) => item.id === booking.resourceId) ?? null;
        setResource(match);
      })
      .catch(() => {
        setResource(null);
      });
  }, [booking?.resourceId]);

  useEffect(() => {
    void load();
  }, [id]);

  async function handleCancel() {
    if (!booking) {
      return;
    }

    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Failed to cancel booking");
    }
  }

  if (loading) {
    return <p className="text-sm text-[#8a8f98]">Loading booking details...</p>;
  }

  if (error || !booking) {
    return (
      <div className="space-y-3 rounded-xl border border-[#ff6a8b4d] bg-[#2a1018] p-4">
        <p className="text-sm text-[#ffc2d0]">{error ?? "Booking not found"}</p>
        <Link to="/bookings">
          <Button className="border border-[#ffffff22] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]">Back to bookings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-[590] tracking-tight text-[#f7f8f8]">Booking Detail</h2>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="mt-2 font-mono text-xs text-[#8a8f98]">{booking.id}</p>
      </header>

      <section className="grid gap-3 rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4 text-sm text-[#d0d6e0]">
        <div className="rounded-lg border border-[#ffffff14] bg-[#15171b] p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[#8a8f98]">Resource</p>
          <div className="mt-2 flex items-center gap-3">
            {resource?.imageUrl ? (
              <img
                src={resource.imageUrl}
                alt={resource.name ?? "Resource"}
                className="h-12 w-12 rounded-md border border-[#ffffff14] object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-md border border-[#ffffff14] bg-[#0f1011]" />
            )}
            <div>
              <p className="text-sm font-[510] text-[#f7f8f8]">{resource?.name ?? booking.resourceId}</p>
              <p className="text-xs text-[#8a8f98]">{resource?.type ?? "General resource"}</p>
            </div>
          </div>
        </div>
        <p>
          Time: {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
        </p>
        <p>Purpose: {booking.purpose}</p>
        <p>Attendee count: {booking.attendeeCount ?? "N/A"}</p>
        <p>Reviewed by: {booking.reviewedBy ?? "-"}</p>
        <p>Review reason: {booking.reviewReason ?? "-"}</p>

        <WorkflowTimeline status={booking.status} />
      </section>

      <QrCodeDisplay token={booking.qrCodeToken} base64Image={booking.qrCodeImageBase64} />

      <div className="flex flex-wrap gap-2">
        {booking.status === "APPROVED" && (
          <Button
            onClick={() => void handleCancel()}
            className="border border-[#5a2031] bg-[#341522] text-[#ffc2d0] hover:bg-[#462030]"
          >
            Cancel Booking
          </Button>
        )}

        <Link to="/bookings">
          <Button className="border border-[#ffffff22] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]">Back to bookings</Button>
        </Link>
      </div>
    </div>
  );
}
