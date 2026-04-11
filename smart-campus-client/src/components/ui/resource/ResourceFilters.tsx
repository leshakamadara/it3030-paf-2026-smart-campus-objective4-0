import { useEffect, useState } from "react";
import type {
  ResourceFilters as ResourceFilterValues,
  ResourceStatus,
  ResourceType,
} from "../../../types/resource";

interface ResourceFiltersProps {
  initialFilters: ResourceFilterValues;
  onApply: (filters: ResourceFilterValues) => void;
  onReset: () => void;
}

type BooleanSelectValue = "" | "true" | "false";

interface FilterFormState {
  name: string;
  type: "" | ResourceType;
  building: string;
  status: "" | ResourceStatus;
  isBookable: BooleanSelectValue;
  isUnderMaintenance: BooleanSelectValue;
  minCapacity: string;
  maxCapacity: string;
  hasProjector: boolean;
  hasAc: boolean;
  hasWhiteboard: boolean;
  hasWifi: boolean;
  hasComputers: boolean;
  hasWindows: boolean;
  sortBy: string;
  direction: "asc" | "desc";
  size: string;
}

const resourceTypes: ResourceType[] = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

const resourceStatuses: ResourceStatus[] = ["ACTIVE", "OUT_OF_SERVICE"];

const createFormState = (
  filters: ResourceFilterValues,
): FilterFormState => ({
  name: filters.name ?? "",
  type: filters.type ?? "",
  building: filters.building ?? "",
  status: filters.status ?? "",
  isBookable:
    filters.isBookable === undefined ? "" : String(filters.isBookable) as BooleanSelectValue,
  isUnderMaintenance:
    filters.isUnderMaintenance === undefined
      ? ""
      : (String(filters.isUnderMaintenance) as BooleanSelectValue),
  minCapacity:
    filters.minCapacity === undefined ? "" : String(filters.minCapacity),
  maxCapacity:
    filters.maxCapacity === undefined ? "" : String(filters.maxCapacity),
  hasProjector: filters.hasProjector ?? false,
  hasAc: filters.hasAc ?? false,
  hasWhiteboard: filters.hasWhiteboard ?? false,
  hasWifi: filters.hasWifi ?? false,
  hasComputers: filters.hasComputers ?? false,
  hasWindows: filters.hasWindows ?? false,
  sortBy: filters.sortBy ?? "id",
  direction: filters.direction ?? "asc",
  size: String(filters.size ?? 10),
});

const toOptionalBoolean = (value: BooleanSelectValue): boolean | undefined => {
  if (value === "") return undefined;
  return value === "true";
};

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export default function ResourceFilters({
  initialFilters,
  onApply,
  onReset,
}: ResourceFiltersProps) {
  const [form, setForm] = useState<FilterFormState>(createFormState(initialFilters));

  useEffect(() => {
    setForm(createFormState(initialFilters));
  }, [initialFilters]);

  const handleApply = () => {
    onApply({
      name: form.name.trim() || undefined,
      type: form.type || undefined,
      building: form.building.trim() || undefined,
      status: form.status || undefined,
      isBookable: toOptionalBoolean(form.isBookable),
      isUnderMaintenance: toOptionalBoolean(form.isUnderMaintenance),
      minCapacity: parseOptionalNumber(form.minCapacity),
      maxCapacity: parseOptionalNumber(form.maxCapacity),
      hasProjector: form.hasProjector || undefined,
      hasAc: form.hasAc || undefined,
      hasWhiteboard: form.hasWhiteboard || undefined,
      hasWifi: form.hasWifi || undefined,
      hasComputers: form.hasComputers || undefined,
      hasWindows: form.hasWindows || undefined,
      sortBy: form.sortBy,
      direction: form.direction,
      size: parseOptionalNumber(form.size) ?? 10,
    });
  };

  const handleReset = () => {
    setForm(createFormState({ page: 0, size: 10, sortBy: "id", direction: "asc" }));
    onReset();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search resources by metadata, availability, capacity, and features.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Search by name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Computer Lab"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value as FilterFormState["type"],
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">All types</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Building
          </label>
          <input
            type="text"
            value={form.building}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, building: e.target.value }))
            }
            placeholder="Engineering Building"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as FilterFormState["status"],
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">All statuses</option>
            {resourceStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Bookable
          </label>
          <select
            value={form.isBookable}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                isBookable: e.target.value as BooleanSelectValue,
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">All</option>
            <option value="true">Bookable only</option>
            <option value="false">Non-bookable only</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Under maintenance
          </label>
          <select
            value={form.isUnderMaintenance}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                isUnderMaintenance: e.target.value as BooleanSelectValue,
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">All</option>
            <option value="true">Maintenance only</option>
            <option value="false">Not under maintenance</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Min capacity
          </label>
          <input
            type="number"
            min="0"
            value={form.minCapacity}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, minCapacity: e.target.value }))
            }
            placeholder="30"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Max capacity
          </label>
          <input
            type="number"
            min="0"
            value={form.maxCapacity}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maxCapacity: e.target.value }))
            }
            placeholder="100"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Sort by
          </label>
          <select
            value={form.sortBy}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, sortBy: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="resourceCode">Resource Code</option>
            <option value="building">Building</option>
            <option value="capacity">Capacity</option>
            <option value="type">Type</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Direction
          </label>
          <select
            value={form.direction}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                direction: e.target.value as "asc" | "desc",
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Page size
          </label>
          <select
            value={form.size}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, size: e.target.value }))
            }
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Feature filters
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "hasProjector", label: "Projector" },
            { key: "hasAc", label: "AC" },
            { key: "hasWhiteboard", label: "Whiteboard" },
            { key: "hasWifi", label: "WiFi" },
            { key: "hasComputers", label: "Computers" },
            { key: "hasWindows", label: "Windows" },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={form[item.key as keyof FilterFormState] as boolean}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApply}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}