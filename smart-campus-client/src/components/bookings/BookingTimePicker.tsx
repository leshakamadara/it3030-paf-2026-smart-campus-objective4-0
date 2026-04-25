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
        <span className="font-[510] text-[#43464b]">Start</span>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(event) => onStartTimeChange(event.target.value)}
          required
          className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b] focus:border-[#7170ff] focus:outline-none"
        />
      </label>

      <label className="space-y-1 text-xs text-[#8a8f98]">
        <span className="font-[510] text-[#43464b]">End</span>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(event) => onEndTimeChange(event.target.value)}
          required
          className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b] focus:border-[#7170ff] focus:outline-none"
        />
      </label>
    </div>
  );
}
