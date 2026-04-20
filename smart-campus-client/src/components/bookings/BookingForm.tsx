import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createBooking } from "@/services/bookings";
import type { Booking } from "@/types/booking";

interface BookingFormProps {
  onCreated: (booking: Booking) => void;
  onConflict: (message: string) => void;
  onError: (message: string) => void;
}

export function BookingForm({ onCreated, onConflict, onError }: BookingFormProps) {
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendeeCount, setAttendeeCount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const created = await createBooking({
        resourceId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        purpose,
        attendeeCount: attendeeCount === "" ? undefined : Number(attendeeCount),
      });

      onCreated(created);
      setPurpose("");
      setAttendeeCount("");
    } catch (error) {
      const status = (error as { status?: number }).status;
      const message = error instanceof Error ? error.message : "Failed to create booking";
      if (status === 409) {
        onConflict(message);
      } else {
        onError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4">
      <h3 className="text-sm font-[590] tracking-tight text-[#f7f8f8]">Create booking request</h3>

      <input
        value={resourceId}
        onChange={(event) => setResourceId(event.target.value)}
        placeholder="Resource UUID"
        required
        className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#7170ff] focus:outline-none"
      />

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="datetime-local"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
          className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          required
          className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
        />
      </div>

      <textarea
        value={purpose}
        onChange={(event) => setPurpose(event.target.value)}
        placeholder="Purpose"
        required
        rows={3}
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

      <Button
        type="submit"
        disabled={submitting}
        className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]"
      >
        {submitting ? "Submitting..." : "Submit booking"}
      </Button>
    </form>
  );
}
