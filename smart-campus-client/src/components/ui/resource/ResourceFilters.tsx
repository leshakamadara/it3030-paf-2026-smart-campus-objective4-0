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

const RESOURCE_TYPES: ResourceType[] = [
  "LECTURE_HALL",
  "LAB",
  "MEETING_ROOM",
  "PROJECTOR",
  "CAMERA",
];

const RESOURCE_STATUSES: ResourceStatus[] = ["ACTIVE", "OUT_OF_SERVICE"];

const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  PROJECTOR: "Projector",
  CAMERA: "Camera",
};

const createFormState = (filters: ResourceFilterValues): FilterFormState => ({
  type: filters.type ?? "",
  building: filters.building ?? "",
  status: filters.status ?? "",
  isBookable:
    filters.isBookable === undefined ? "" : (String(filters.isBookable) as BooleanSelectValue),
  isUnderMaintenance:
    filters.isUnderMaintenance === undefined
      ? ""
      : (String(filters.isUnderMaintenance) as BooleanSelectValue),
  minCapacity: filters.minCapacity === undefined ? "" : String(filters.minCapacity),
  maxCapacity: filters.maxCapacity === undefined ? "" : String(filters.maxCapacity),
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

const FEATURES = [
  { key: "hasProjector", label: "Projector", icon: "📽️" },
  { key: "hasAc", label: "AC", icon: "❄️" },
  { key: "hasWhiteboard", label: "Whiteboard", icon: "✏️" },
  { key: "hasWifi", label: "Wi-Fi", icon: "📶" },
  { key: "hasComputers", label: "Computers", icon: "💻" },
  { key: "hasWindows", label: "Windows", icon: "🪟" },
] as const;

export default function ResourceFilters({
  initialFilters,
  onApply,
  onReset,
}: ResourceFiltersProps) {
  const [form, setForm] = useState<FilterFormState>(createFormState(initialFilters));

  useEffect(() => {
    setForm(createFormState(initialFilters));
  }, [initialFilters]);

  const activeCount = [
    form.type,
    form.building,
    form.status,
    form.isBookable,
    form.isUnderMaintenance,
    form.minCapacity,
    form.maxCapacity,
    form.hasProjector,
    form.hasAc,
    form.hasWhiteboard,
    form.hasWifi,
    form.hasComputers,
    form.hasWindows,
  ].filter(Boolean).length;

  const handleApply = () => {
    onApply({
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
    <aside className="space-y-1">
      {/* Header */}
      <div className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-100 p-1.5">
              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-800">Filters</span>
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-zinc-400 transition hover:text-indigo-600"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="space-y-5">
          {/* Type */}
          <FilterGroup label="Resource Type">
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as FilterFormState["type"] }))}
              className={selectCls}
            >
              <option value="">All types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </FilterGroup>

          {/* Building */}
          <FilterGroup label="Building">
            <input
              type="text"
              value={form.building}
              onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
              placeholder="Search building..."
              className={inputCls}
            />
          </FilterGroup>

          {/* Status */}
          <FilterGroup label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FilterFormState["status"] }))}
              className={selectCls}
            >
              <option value="">All statuses</option>
              {RESOURCE_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </select>
          </FilterGroup>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

          {/* Bookable */}
          <FilterGroup label="Bookable">
            <div className="flex gap-2">
              {(["", "true", "false"] as BooleanSelectValue[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isBookable: v }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition ${
                    form.isBookable === v
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  {v === "" ? "All" : v === "true" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Maintenance */}
          <FilterGroup label="Under Maintenance">
            <div className="flex gap-2">
              {(["", "true", "false"] as BooleanSelectValue[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isUnderMaintenance: v }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition ${
                    form.isUnderMaintenance === v
                      ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  {v === "" ? "All" : v === "true" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </FilterGroup>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

          {/* Capacity range */}
          <FilterGroup label="Capacity Range">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Min</label>
                <input
                  type="number"
                  min="0"
                  value={form.minCapacity}
                  onChange={(e) => setForm((p) => ({ ...p, minCapacity: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Max</label>
                <input
                  type="number"
                  min="0"
                  value={form.maxCapacity}
                  onChange={(e) => setForm((p) => ({ ...p, maxCapacity: e.target.value }))}
                  placeholder="∞"
                  className={inputCls}
                />
              </div>
            </div>
          </FilterGroup>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

          {/* Features */}
          <FilterGroup label="Amenities">
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((item) => (
                <label
                  key={item.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                    form[item.key as keyof FilterFormState]
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form[item.key as keyof FilterFormState] as boolean}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [item.key]: e.target.checked }))
                    }
                  />
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </FilterGroup>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

          {/* Sort */}
          <FilterGroup label="Sort By">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.sortBy}
                onChange={(e) => setForm((p) => ({ ...p, sortBy: e.target.value }))}
                className={selectCls}
              >
                <option value="id">ID</option>
                <option value="name">Name</option>
                <option value="resourceCode">Code</option>
                <option value="building">Building</option>
                <option value="capacity">Capacity</option>
                <option value="type">Type</option>
              </select>

              <select
                value={form.direction}
                onChange={(e) => setForm((p) => ({ ...p, direction: e.target.value as "asc" | "desc" }))}
                className={selectCls}
              >
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </div>
          </FilterGroup>

          {/* Page size */}
          <FilterGroup label="Results per page">
            <div className="flex gap-1.5">
              {["5", "10", "15", "20"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, size: n }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition ${
                    form.size === n
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </FilterGroup>
        </div>

        {/* Apply */}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:shadow-lg hover:shadow-indigo-200"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";

const selectCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";