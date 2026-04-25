import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { BookingTimePicker } from "@/components/bookings/BookingTimePicker";
import { ConflictAlert } from "@/components/bookings/ConflictAlert";
import { ResourceSelector } from "@/components/bookings/ResourceSelector";
import { Button } from "@/components/ui/button";
import {
  createBooking,
  getResourceUpcomingBookings,
  getResources,
} from "@/services/bookings";
import type { Booking, ResourceSummary } from "@/types/booking";

function hasTimeOverlap(candidateStartIso: string, candidateEndIso: string, booking: Booking) {
  const candidateStart = Date.parse(candidateStartIso);
  const candidateEnd = Date.parse(candidateEndIso);
  const bookingStart = Date.parse(booking.startTime);
  const bookingEnd = Date.parse(booking.endTime);
  return candidateStart < bookingEnd && candidateEnd > bookingStart;
}

export function CreateBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill resourceId from URL ?resourceId=1
  const prefilledId = searchParams.get("resourceId") ?? "";

  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [resourceId, setResourceId] = useState(prefilledId);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendeeCount, setAttendeeCount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [availabilityWindows, setAvailabilityWindows] = useState<Booking[]>([]);
  const [conflict, setConflict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getResources()
      .then((response) => {
        setResources(response);
      })
      .catch((requestError) => {
        const message = requestError instanceof Error ? requestError.message : "Failed to load resources";
        setError(message);
        setResources([]);
      });
  }, []);

  // Fetch upcoming bookings for this resource (availability windows display)
  useEffect(() => {
    if (!resourceId) {
      setAvailabilityWindows([]);
      return;
    }

    let ignore = false;

    void getResourceUpcomingBookings(resourceId, 0, 12)
      .then((response) => {
        if (ignore) return;
        const windows = response.content
          .filter((b) => b.status === "PENDING" || b.status === "APPROVED")
          .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
          .slice(0, 6);
        setAvailabilityWindows(windows);
      })
      .catch(() => {
        if (!ignore) setAvailabilityWindows([]);
      });

    return () => {
      ignore = true;
    };
  }, [resourceId]);

  // Client-side conflict detection
  useEffect(() => {
    if (!resourceId || !startTime || !endTime) {
      setConflict(null);
      return;
    }

    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    if (Date.parse(endIso) <= Date.parse(startIso)) {
      setConflict("End time must be after start time.");
      return;
    }

    let ignore = false;
    setCheckingConflict(true);

    void getResourceUpcomingBookings(resourceId, 0, 50)
      .then((response) => {
        if (ignore) return;
        const conflicts = response.content.filter(
          (b) =>
            (b.status === "PENDING" || b.status === "APPROVED") &&
            hasTimeOverlap(startIso, endIso, b),
        );
        setConflict(
          conflicts.length > 0
            ? "Selected slot conflicts with an existing booking on this resource."
            : null,
        );
      })
      .catch(() => {
        if (!ignore) setConflict(null);
      })
      .finally(() => {
        if (!ignore) setCheckingConflict(false);
      });

    return () => {
      ignore = true;
    };
  }, [resourceId, startTime, endTime]);

  const canSubmit = useMemo(() => {
    return (
      resourceId.trim().length > 0 &&
      startTime.trim().length > 0 &&
      endTime.trim().length > 0 &&
      purpose.trim().length > 0 &&
      !conflict
    );
  }, [resourceId, startTime, endTime, purpose, conflict]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setConflict(null);
    setError(null);

    try {
      const created = await createBooking({
        resourceId: Number(resourceId),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        purpose,
        attendeeCount: attendeeCount === "" ? undefined : Number(attendeeCount),
      });
      toast.success("Booking submitted — status is now PENDING.");
      navigate(`/dashboard/bookings/${created.id}`);
    } catch (submitError) {
      const status = (submitError as { status?: number }).status;
      const message = submitError instanceof Error ? submitError.message : "Failed to create booking";
      if (status === 409) {
        setConflict(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      {/* Page header */}
      <header className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-5">
        <p className="text-xs font-[510] uppercase tracking-[0.18em] text-[#5e6ad2]">Module B</p>
        <h1 className="mt-1 text-2xl font-[590] tracking-[-0.44px] text-[#191a1b]">
          Create Booking
        </h1>
        <p className="mt-1 text-sm text-[#62666d]">
          Select a resource and time slot, then submit for admin approval.
        </p>
      </header>

      {/* Alerts */}
      {conflict && <ConflictAlert message={conflict} onClose={() => setConflict(null)} />}
      {checkingConflict && (
        <p className="text-xs text-[#8a8f98]">Checking availability…</p>
      )}
      {error && (
        <p className="rounded-lg border border-[#f0b8c4] bg-[#fff1f4] p-3 text-sm text-[#8f3346]">
          {error}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-5">
        {/* Resource selector */}
        <ResourceSelector resources={resources} value={resourceId} onChange={setResourceId} />

        {/* Availability windows */}
        {resourceId && (
          <div className="rounded-lg border border-[#d0d6e0] bg-[#f7f8f8] p-3">
            <p className="text-xs font-[510] uppercase tracking-[0.12em] text-[#62666d]">
              Blocked windows for this resource
            </p>
            <div className="mt-2 space-y-1">
              {availabilityWindows.length === 0 ? (
                <p className="text-xs text-[#8a8f98]">No upcoming blocked windows — slot looks free.</p>
              ) : (
                availabilityWindows.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 text-xs text-[#43464b]">
                    <span className={`h-1.5 w-1.5 rounded-full ${b.status === "APPROVED" ? "bg-[#5e6ad2]" : "bg-amber-400"}`} />
                    <span>
                      {new Date(b.startTime).toLocaleString()} — {new Date(b.endTime).toLocaleString()}
                    </span>
                    <span className="text-[#8a8f98]">({b.status})</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Time picker */}
        <BookingTimePicker
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />

        {/* Purpose */}
        <div className="space-y-1">
          <label className="text-xs font-[510] text-[#43464b]">Purpose *</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Describe the purpose of this booking…"
            required
            rows={3}
            className="w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 py-2 text-sm text-[#191a1b] placeholder:text-[#8a8f98] focus:border-[#7170ff] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/20"
          />
        </div>

        {/* Attendee count */}
        <div className="space-y-1">
          <label className="text-xs font-[510] text-[#43464b]">Attendee count (optional)</label>
          <input
            type="number"
            value={attendeeCount}
            min={1}
            onChange={(e) =>
              setAttendeeCount(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="e.g. 25"
            className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#191a1b] placeholder:text-[#8a8f98] focus:border-[#7170ff] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/20"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="submit"
            disabled={!canSubmit || submitting}
            className="bg-[#5e6ad2] text-white hover:bg-[#7170ff] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Booking"}
          </Button>
          <Link to="/dashboard/bookings">
            <Button
              type="button"
              className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]"
            >
              Back to list
            </Button>
          </Link>
          <Link to="/dashboard/resources">
            <Button
              type="button"
              className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#f3f4f5]"
            >
              Browse resources
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
