import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Filter, Sparkles } from "lucide-react";
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
  type: filters.type ?? ALL_VALUE,
  building: filters.building ?? "",
  status: filters.status ?? ALL_VALUE,
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
  { key: "hasProjector", label: "Projector", icon: "📽️", color: "from-amber-500 to-orange-500" },
  { key: "hasAc", label: "AC", icon: "❄️", color: "from-sky-400 to-blue-500" },
  { key: "hasWhiteboard", label: "Whiteboard", icon: "✏️", color: "from-emerald-500 to-teal-500" },
  { key: "hasWifi", label: "Wi-Fi", icon: "📶", color: "from-green-500 to-emerald-500" },
  { key: "hasComputers", label: "Computers", icon: "💻", color: "from-purple-500 to-violet-500" },
  { key: "hasWindows", label: "Windows", icon: "🪟", color: "from-rose-500 to-pink-500" },
] as const;

export default function ResourceFilters({
  initialFilters,
  onApply,
  onReset,
}: ResourceFiltersProps) {
  const [form, setForm] = useState<FilterFormState>(() => createFormState(initialFilters));

  useEffect(() => {
    setForm(createFormState(initialFilters));
  }, [initialFilters]);

  const activeCount = [
    form.type !== ALL_VALUE ? form.type : null,
    form.building,
    form.status !== ALL_VALUE ? form.status : null,
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
      type: form.type === ALL_VALUE ? undefined : form.type,
      building: form.building.trim() || undefined,
      status: form.status === ALL_VALUE ? undefined : form.status,
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
    const resetState = createFormState({ page: 0, size: 10, sortBy: "id", direction: "asc" });
    setForm(resetState);
    onReset();
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background via-background to-primary/5 dark:to-primary/10 transition-shadow hover:shadow-lg">
        {/* Animated gradient top border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x" />
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Filter className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Filters
              </CardTitle>
              {activeCount > 0 && (
                <Badge className="ml-2 bg-gradient-to-r from-primary to-purple-500 text-primary-foreground border-0 animate-pulse shadow-sm">
                  {activeCount} active
                </Badge>
              )}
            </div>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="transition-all hover:bg-destructive/10 hover:text-destructive"
              >
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Type */}
          <FilterGroup label="Resource Type" icon="🏷️">
            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((p) => ({ ...p, type: value as ResourceType | typeof ALL_VALUE }))
              }
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All types</SelectItem>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          {/* Building */}
          <FilterGroup label="Building" icon="🏢">
            <Input
              value={form.building}
              onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
              placeholder="Search building..."
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50"
            />
          </FilterGroup>

          {/* Status */}
          <FilterGroup label="Status" icon="📊">
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((p) => ({ ...p, status: value as ResourceStatus | typeof ALL_VALUE }))
              }
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                {RESOURCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Bookable */}
          <FilterGroup label="Bookable" icon="📅">
            <div className="flex gap-2">
              {(["", "true", "false"] as BooleanSelectValue[]).map((v) => (
                <Button
                  key={v}
                  variant={form.isBookable === v ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 transition-all hover:scale-[1.02] ${
                    form.isBookable === v 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md" 
                      : "border-primary/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                  }`}
                  onClick={() => setForm((p) => ({ ...p, isBookable: v }))}
                >
                  {v === "" ? "All" : v === "true" ? "Yes" : "No"}
                </Button>
              ))}
            </div>
          </FilterGroup>

          {/* Maintenance */}
          <FilterGroup label="Under Maintenance" icon="🔧">
            <div className="flex gap-2">
              {(["", "true", "false"] as BooleanSelectValue[]).map((v) => (
                <Button
                  key={v}
                  variant={form.isUnderMaintenance === v ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 transition-all hover:scale-[1.02] ${
                    form.isUnderMaintenance === v 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md" 
                      : "border-primary/20 hover:border-amber-500/50 hover:bg-amber-500/5"
                  }`}
                  onClick={() => setForm((p) => ({ ...p, isUnderMaintenance: v }))}
                >
                  {v === "" ? "All" : v === "true" ? "Yes" : "No"}
                </Button>
              ))}
            </div>
          </FilterGroup>

          <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Capacity range */}
          <FilterGroup label="Capacity Range" icon="👥">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Min</label>
                <Input
                  type="number"
                  min="0"
                  value={form.minCapacity}
                  onChange={(e) => setForm((p) => ({ ...p, minCapacity: e.target.value }))}
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Max</label>
                <Input
                  type="number"
                  min="0"
                  value={form.maxCapacity}
                  onChange={(e) => setForm((p) => ({ ...p, maxCapacity: e.target.value }))}
                  placeholder="∞"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50"
                />
              </div>
            </div>
          </FilterGroup>

          <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Features */}
          <FilterGroup label="Amenities" icon="✨">
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((item) => {
                const isActive = form[item.key as keyof FilterFormState] as boolean;
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`justify-start transition-all hover:scale-[1.02] hover:shadow-sm ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white border-0 shadow-md`
                        : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        [item.key]: !p[item.key as keyof FilterFormState],
                      }))
                    }
                  >
                    <span className="mr-2 transition-transform group-hover:rotate-12">
                      {item.icon}
                    </span>
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </FilterGroup>

          <Separator className="bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Sort */}
          <FilterGroup label="Sort By" icon="🔽">
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={form.sortBy}
                onValueChange={(value) => setForm((p) => ({ ...p, sortBy: value }))}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50">
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

              <Select
                value={form.direction}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, direction: value as "asc" | "desc" }))
                }
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A → Z</SelectItem>
                  <SelectItem value="desc">Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FilterGroup>

          {/* Page size */}
          <FilterGroup label="Results per page" icon="📄">
            <div className="flex gap-1.5">
              {["5", "10", "15", "20"].map((n) => (
                <Button
                  key={n}
                  variant={form.size === n ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 transition-all hover:scale-[1.02] ${
                    form.size === n
                      ? "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground border-0 shadow-md"
                      : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                  onClick={() => setForm((p) => ({ ...p, size: n }))}
                >
                  {n}
                </Button>
              ))}
            </div>
          </FilterGroup>
        </CardContent>
        
        <CardFooter className="flex gap-2 pt-0 pb-4">
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            onClick={handleApply}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            Reset
          </Button>
        </CardFooter>
      </Card>
    </motion.aside>
  );
}

function FilterGroup({ label, icon, children }: { label: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        {label}
      </p>
      {children}
    </div>
  );
}