import type { Resource, ResourceDisplayStatus } from "../../../types/resource";

interface ResourceStatusBadgeProps {
  resource?: Partial<Resource>;
  displayStatus?: string;
  className?: string;
}

export const resolveDisplayStatus = (
  resource?: Partial<Resource>,
  explicitDisplayStatus?: string,
): ResourceDisplayStatus | string => {
  if (explicitDisplayStatus) return explicitDisplayStatus;
  if (!resource) return "AVAILABLE";

  if (resource.isUnderMaintenance) return "UNDER_MAINTENANCE";
  if (resource.status === "OUT_OF_SERVICE") return "OUT_OF_SERVICE";

  if (resource.availableFrom && resource.availableTo) {
    const currentTime = new Date().toTimeString().slice(0, 8);
    if (currentTime < resource.availableFrom || currentTime > resource.availableTo) {
      return "NOT_AVAILABLE_NOW";
    }
  }

  return "AVAILABLE";
};

type BadgeConfig = {
  label: string;
  dotColor: string;
  classes: string;
};

const BADGE_MAP: Record<string, BadgeConfig> = {
  AVAILABLE: {
    label: "Available",
    dotColor: "bg-emerald-500",
    classes: "bg-emerald-50/80 text-emerald-700 border-emerald-200 backdrop-blur-sm",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    dotColor: "bg-rose-500",
    classes: "bg-rose-50/80 text-rose-700 border-rose-200 backdrop-blur-sm",
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    dotColor: "bg-amber-500",
    classes: "bg-amber-50/80 text-amber-700 border-amber-200 backdrop-blur-sm",
  },
  NOT_AVAILABLE_NOW: {
    label: "Unavailable Now",
    dotColor: "bg-slate-500",
    classes: "bg-slate-50/80 text-slate-600 border-slate-200 backdrop-blur-sm",
  },
};

export default function ResourceStatusBadge({
  resource,
  displayStatus,
  className = "",
}: ResourceStatusBadgeProps) {
  const resolved = resolveDisplayStatus(resource, displayStatus);
  const config = BADGE_MAP[resolved] ?? {
    label: resolved,
    dotColor: "bg-zinc-400",
    classes: "bg-zinc-50/80 text-zinc-600 border-zinc-200 backdrop-blur-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:shadow ${config.classes} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotColor} ring-2 ring-white/50`} />
      {config.label}
    </span>
  );
}