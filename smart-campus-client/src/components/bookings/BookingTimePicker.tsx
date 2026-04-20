interface BookingTimePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export function BookingTimePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: BookingTimePickerProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-1 text-xs text-[#8a8f98]">
        <span className="font-[510] text-[#d0d6e0]">Start</span>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(event) => onStartTimeChange(event.target.value)}
          required
          className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
        />
      </label>

      <label className="space-y-1 text-xs text-[#8a8f98]">
        <span className="font-[510] text-[#d0d6e0]">End</span>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(event) => onEndTimeChange(event.target.value)}
          required
          className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
        />
      </label>
    </div>
  );
}
