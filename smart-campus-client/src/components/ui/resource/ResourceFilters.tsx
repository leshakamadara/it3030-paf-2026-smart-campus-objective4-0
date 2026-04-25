import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
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
const ALL_VALUE = "all";

interface FilterFormState {
  type: ResourceType | typeof ALL_VALUE;
  building: string;
  status: ResourceStatus | typeof ALL_VALUE;
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

const RESOURCE_TYPES: ResourceType[] = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "PROJECTOR", "CAMERA"];
const RESOURCE_STATUSES: ResourceStatus[] = ["ACTIVE", "OUT_OF_SERVICE"];
const TYPE_LABELS: Record<ResourceType, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  PROJECTOR: "Projector",
  CAMERA: "Camera",
};

const FEATURES = [
  { key: "hasProjector",  label: "Projector",  icon: "📽️" },
  { key: "hasAc",         label: "AC",          icon: "❄️" },
  { key: "hasWhiteboard", label: "Whiteboard",  icon: "✏️" },
  { key: "hasWifi",       label: "Wi-Fi",       icon: "📶" },
  { key: "hasComputers",  label: "Computers",   icon: "💻" },
  { key: "hasWindows",    label: "Windows",     icon: "🪟" },
] as const;

const createFormState = (filters: ResourceFilterValues): FilterFormState => ({
  type:               filters.type ?? ALL_VALUE,
  building:           filters.building ?? "",
  status:             filters.status ?? ALL_VALUE,
  isBookable:         filters.isBookable === undefined ? "" : (String(filters.isBookable) as BooleanSelectValue),
  isUnderMaintenance: filters.isUnderMaintenance === undefined ? "" : (String(filters.isUnderMaintenance) as BooleanSelectValue),
  minCapacity:        filters.minCapacity === undefined ? "" : String(filters.minCapacity),
  maxCapacity:        filters.maxCapacity === undefined ? "" : String(filters.maxCapacity),
  hasProjector:       filters.hasProjector ?? false,
  hasAc:              filters.hasAc ?? false,
  hasWhiteboard:      filters.hasWhiteboard ?? false,
  hasWifi:            filters.hasWifi ?? false,
  hasComputers:       filters.hasComputers ?? false,
  hasWindows:         filters.hasWindows ?? false,
  sortBy:             filters.sortBy ?? "id",
  direction:          filters.direction ?? "asc",
  size:               String(filters.size ?? 10),
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

export default function ResourceFilters({ initialFilters, onApply, onReset }: ResourceFiltersProps) {
  const [form, setForm] = useState<FilterFormState>(() => createFormState(initialFilters));
  const buildingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capacityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const prevFiltersRef = useRef<string>("");
  const formRef = useRef(form);

  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { setForm(createFormState(initialFilters)); }, [initialFilters]);

  const buildFiltersFromState = (state: FilterFormState): ResourceFilterValues => ({
    type:               state.type === ALL_VALUE ? undefined : state.type,
    building:           state.building.trim() || undefined,
    status:             state.status === ALL_VALUE ? undefined : state.status,
    isBookable:         toOptionalBoolean(state.isBookable),
    isUnderMaintenance: toOptionalBoolean(state.isUnderMaintenance),
    minCapacity:        parseOptionalNumber(state.minCapacity),
    maxCapacity:        parseOptionalNumber(state.maxCapacity),
    hasProjector:       state.hasProjector || undefined,
    hasAc:              state.hasAc || undefined,
    hasWhiteboard:      state.hasWhiteboard || undefined,
    hasWifi:            state.hasWifi || undefined,
    hasComputers:       state.hasComputers || undefined,
    hasWindows:         state.hasWindows || undefined,
    sortBy:             state.sortBy,
    direction:          state.direction,
    size:               parseOptionalNumber(state.size) ?? 10,
    page:               0,
  });

  const buildFilters = useCallback((): ResourceFilterValues => buildFiltersFromState(form), [form]);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const newFilters = buildFilters();
    const filterKey = JSON.stringify(newFilters);
    if (filterKey !== prevFiltersRef.current) {
      prevFiltersRef.current = filterKey;
      onApply(newFilters);
    }
  }, [buildFilters, onApply]);

  const updateForm = useCallback((updates: Partial<FilterFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleBuildingChange = (value: string) => {
    setForm((prev) => ({ ...prev, building: value }));
    if (buildingTimeout.current) clearTimeout(buildingTimeout.current);
    buildingTimeout.current = setTimeout(() => { onApply(buildFiltersFromState(formRef.current)); }, 400);
  };

  const handleCapacityChange = (field: "minCapacity" | "maxCapacity", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (capacityTimeout.current) clearTimeout(capacityTimeout.current);
    capacityTimeout.current = setTimeout(() => { onApply(buildFiltersFromState(formRef.current)); }, 500);
  };

  const activeCount = [
    form.type !== ALL_VALUE ? form.type : null,
    form.building,
    form.status !== ALL_VALUE ? form.status : null,
    form.isBookable,
    form.isUnderMaintenance,
    form.minCapacity,
    form.maxCapacity,
    form.hasProjector, form.hasAc, form.hasWhiteboard,
    form.hasWifi, form.hasComputers, form.hasWindows,
  ].filter(Boolean).length;

  const handleReset = () => {
    setForm(createFormState({ page: 0, size: 10, sortBy: "id", direction: "asc" }));
    onReset();
  };

  /* ── Reusable mini-components ──────────────────────────────── */
  const sectionLabel = (text: string, icon?: string) => (
    <p className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5"
      style={{ color: "#8a8f98", letterSpacing: "0.55px" }}>
      {icon && <span>{icon}</span>}
      {text}
    </p>
  );

  const divider = () => (
    <div className="my-4 border-t" style={{ borderColor: "#f3f4f5" }} />
  );

  const ternaryBtn = (
    value: BooleanSelectValue,
    current: BooleanSelectValue,
    label: string,
    onChange: (v: BooleanSelectValue) => void
  ) => {
    const active = current === value;
    return (
      <button
        key={value}
        onClick={() => onChange(value)}
        className="flex-1 h-8 rounded-md text-xs font-medium transition-colors duration-150"
        style={{
          backgroundColor: active ? "#5e6ad2" : "#f7f8f8",
          color: active ? "#ffffff" : "#43464b",
          border: `1px solid ${active ? "#5e6ad2" : "#e6e6e6"}`,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}
      >
        {/* Header stripe */}
        <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3"
          style={{ borderBottom: "1px solid #f3f4f5" }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md" style={{ backgroundColor: "#ede9ff" }}>
              <Filter className="h-3.5 w-3.5" style={{ color: "#5e6ad2" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#191a1b" }}>Filters</span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#5e6ad2", color: "#ffffff" }}>
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-red-600"
              style={{ color: "#8a8f98" }}
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Filter body */}
        <div className="p-4 space-y-4">

          {/* Resource Type */}
          <div>
            {sectionLabel("Resource Type", "🏷️")}
            <Select
              value={form.type}
              onValueChange={(v) => updateForm({ type: v as ResourceType | typeof ALL_VALUE })}
            >
              <SelectTrigger className="h-9 text-sm" style={{ borderColor: "#d0d6e0", borderRadius: "6px" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All types</SelectItem>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Building */}
          <div>
            {sectionLabel("Building", "🏢")}
            <Input
              value={form.building}
              onChange={(e) => handleBuildingChange(e.target.value)}
              placeholder="e.g. Block A"
              className="h-9 text-sm"
              style={{ borderColor: "#d0d6e0", borderRadius: "6px" }}
            />
          </div>

          {/* Status */}
          <div>
            {sectionLabel("Status", "📊")}
            <Select
              value={form.status}
              onValueChange={(v) => updateForm({ status: v as ResourceStatus | typeof ALL_VALUE })}
            >
              <SelectTrigger className="h-9 text-sm" style={{ borderColor: "#d0d6e0", borderRadius: "6px" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                {RESOURCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {divider()}

          {/* Bookable */}
          <div>
            {sectionLabel("Bookable", "📅")}
            <div className="flex gap-1.5">
              {(["", "true", "false"] as BooleanSelectValue[]).map((v) =>
                ternaryBtn(v, form.isBookable, v === "" ? "All" : v === "true" ? "Yes" : "No",
                  (val) => updateForm({ isBookable: val }))
              )}
            </div>
          </div>

          {/* Maintenance */}
          <div>
            {sectionLabel("Maintenance", "🔧")}
            <div className="flex gap-1.5">
              {(["", "true", "false"] as BooleanSelectValue[]).map((v) =>
                ternaryBtn(v, form.isUnderMaintenance, v === "" ? "All" : v === "true" ? "Yes" : "No",
                  (val) => updateForm({ isUnderMaintenance: val }))
              )}
            </div>
          </div>

          {divider()}

          {/* Capacity */}
          <div>
            {sectionLabel("Capacity Range", "👥")}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8a8f98" }}>Min</label>
                <Input type="number" min="0" value={form.minCapacity}
                  onChange={(e) => handleCapacityChange("minCapacity", e.target.value)}
                  placeholder="0" className="h-9 text-sm"
                  style={{ borderColor: "#d0d6e0", borderRadius: "6px" }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#8a8f98" }}>Max</label>
                <Input type="number" min="0" value={form.maxCapacity}
                  onChange={(e) => handleCapacityChange("maxCapacity", e.target.value)}
                  placeholder="∞" className="h-9 text-sm"
                  style={{ borderColor: "#d0d6e0", borderRadius: "6px" }} />
              </div>
            </div>
          </div>

          {divider()}

          {/* Amenities */}
          <div>
            {sectionLabel("Amenities", "✨")}
            <div className="grid grid-cols-2 gap-1.5">
              {FEATURES.map((item) => {
                const isActive = form[item.key as keyof FilterFormState] as boolean;
                return (
                  <button
                    key={item.key}
                    onClick={() => updateForm({ [item.key]: !isActive } as Partial<FilterFormState>)}
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors duration-150 text-left"
                    style={{
                      backgroundColor: isActive ? "#5e6ad2" : "#f7f8f8",
                      color: isActive ? "#ffffff" : "#43464b",
                      border: `1px solid ${isActive ? "#5e6ad2" : "#e6e6e6"}`,
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {divider()}

          {/* Sort */}
          <div>
            {sectionLabel("Sort By", "↕")}
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.sortBy} onValueChange={(v) => updateForm({ sortBy: v })}>
                <SelectTrigger className="h-9 text-sm" style={{ borderColor: "#d0d6e0", borderRadius: "6px" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="resourceCode">Code</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="capacity">Capacity</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              <Select value={form.direction} onValueChange={(v) => updateForm({ direction: v as "asc" | "desc" })}>
                <SelectTrigger className="h-9 text-sm" style={{ borderColor: "#d0d6e0", borderRadius: "6px" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A → Z</SelectItem>
                  <SelectItem value="desc">Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Page size */}
          <div>
            {sectionLabel("Results per page", "📄")}
            <div className="flex gap-1.5">
              {["5", "10", "15", "20"].map((n) => {
                const active = form.size === n;
                return (
                  <button key={n}
                    onClick={() => updateForm({ size: n })}
                    className="flex-1 h-8 rounded-md text-xs font-medium transition-colors duration-150"
                    style={{
                      backgroundColor: active ? "#5e6ad2" : "#f7f8f8",
                      color: active ? "#ffffff" : "#43464b",
                      border: `1px solid ${active ? "#5e6ad2" : "#e6e6e6"}`,
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full h-9 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            style={{ borderColor: "#d0d6e0", color: "#43464b", borderRadius: "6px" }}
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}