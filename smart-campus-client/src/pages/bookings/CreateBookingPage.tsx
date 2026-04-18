import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { BookingTimePicker } from "@/components/bookings/BookingTimePicker";
import { ConflictAlert } from "@/components/bookings/ConflictAlert";
import { ResourceSelector } from "@/components/bookings/ResourceSelector";
import { Button } from "@/components/ui/button";
import { createBooking, getAllBookings, getResources } from "@/services/bookings";
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

  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [resourceId, setResourceId] = useState("");
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

  useEffect(() => {
    if (!resourceId) {
      setAvailabilityWindows([]);
      return;
    }

    let ignore = false;

    void getAllBookings({ resourceId, page: 0, size: 12 })
      .then((response) => {
        if (ignore) {
          return;
        }

        const windows = response.content
          .filter((booking) => booking.status === "PENDING" || booking.status === "APPROVED")
          .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
          .slice(0, 6);

        setAvailabilityWindows(windows);
      })
      .catch(() => {
        if (!ignore) {
          setAvailabilityWindows([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [resourceId]);

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

    void getAllBookings({ resourceId, page: 0, size: 50 })
      .then((response) => {
        if (ignore) {
          return;
        }

        const conflicts = response.content.filter(
          (booking) =>
            (booking.status === "PENDING" || booking.status === "APPROVED") &&
            hasTimeOverlap(startIso, endIso, booking),
        );

        if (conflicts.length > 0) {
          setConflict("Selected slot conflicts with an existing booking on this resource.");
        } else {
          setConflict(null);
        }
      })
      .catch(() => {
        if (!ignore) {
          setConflict(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setCheckingConflict(false);
        }
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
        resourceId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        purpose,
        attendeeCount: attendeeCount === "" ? undefined : Number(attendeeCount),
      });
      toast.success("Booking submitted. Status is now PENDING.");
      navigate(`/bookings/${created.id}`);
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
    <div className="space-y-4">
      <header className="rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
        <h2 className="text-lg font-[590] tracking-tight text-[#f7f8f8]">Create Booking</h2>
        <p className="text-sm text-[#8a8f98]">Select a resource and submit a request for approval.</p>
      </header>

      {conflict && <ConflictAlert message={conflict} onClose={() => setConflict(null)} />}
      {checkingConflict && <p className="text-xs text-[#8a8f98]">Checking conflicts...</p>}
      {error && <p className="rounded-lg border border-[#ff6a8b4d] bg-[#2a1018] p-3 text-sm text-[#ffc2d0]">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
        <ResourceSelector resources={resources} value={resourceId} onChange={setResourceId} />

        {resourceId && (
          <div className="rounded-lg border border-[#ffffff14] bg-[#08090a] p-3">
            <p className="text-xs font-[510] uppercase tracking-[0.12em] text-[#8a8f98]">Availability windows</p>
            <div className="mt-2 space-y-1 text-xs text-[#d0d6e0]">
              {availabilityWindows.length === 0 && <p className="text-[#62666d]">No upcoming blocked windows found.</p>}
              {availabilityWindows.map((booking) => (
                <p key={booking.id}>
                  {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()} ({booking.status})
                </p>
              ))}
            </div>
          </div>
        )}

        <BookingTimePicker
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />

        <textarea
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          placeholder="Purpose"
          required
          rows={4}
          className="w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 py-2 text-sm text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#7170ff] focus:outline-none"
        />

        <input
          type="number"
          value={attendeeCount}
          min={1}
          onChange={(event) => setAttendeeCount(event.target.value === "" ? "" : Number(event.target.value))}
          placeholder="Attendee count (optional)"
          className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#7170ff] focus:outline-none"
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!canSubmit || submitting} className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]">
            {submitting ? "Submitting..." : "Submit Booking"}
          </Button>
          <Link to="/bookings">
            <Button className="border border-[#ffffff22] bg-[#191a1b] text-[#d0d6e0] hover:bg-[#25272a]">Back to list</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
