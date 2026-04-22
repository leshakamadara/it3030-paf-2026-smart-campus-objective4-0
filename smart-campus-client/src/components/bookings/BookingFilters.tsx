import type { BookingStatus, ResourceSummary } from "@/types/booking";

export interface BookingFilterState {
  status: BookingStatus | "";
  resourceId: string;
  userId: string;
  fromTime: string;
  toTime: string;
}

interface BookingFiltersProps {
  value: BookingFilterState;
  resources: ResourceSummary[];
  onChange: (next: BookingFilterState) => void;
  onApply: () => void;
}

export function BookingFilters({ value, resources, onChange, onApply }: BookingFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-4">
      <h3 className="text-sm font-[590] text-[#191a1b]">Booking Filters</h3>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <select
          value={value.status}
          onChange={(event) => onChange({ ...value, status: event.target.value as BookingStatus | "" })}
          className="h-10 rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b]"
        >
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          value={value.resourceId}
          onChange={(event) => onChange({ ...value, resourceId: event.target.value })}
          className="h-10 rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b]"
        >
          <option value="">All resources</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>
              {resource.name ?? resource.id}
            </option>
          ))}
        </select>

        <input
          value={value.userId}
          onChange={(event) => onChange({ ...value, userId: event.target.value })}
          placeholder="User UUID"
          className="h-10 rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b]"
        />

        <input
          type="datetime-local"
          value={value.fromTime}
          onChange={(event) => onChange({ ...value, fromTime: event.target.value })}
          className="h-10 rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b]"
        />

        <input
          type="datetime-local"
          value={value.toTime}
          onChange={(event) => onChange({ ...value, toTime: event.target.value })}
          className="h-10 rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b]"
        />
      </div>

      <button
        type="button"
        onClick={onApply}
        className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-[510] text-white hover:bg-[#7170ff]"
      >
        Apply Filters
      </button>
    </div>
  );
}
