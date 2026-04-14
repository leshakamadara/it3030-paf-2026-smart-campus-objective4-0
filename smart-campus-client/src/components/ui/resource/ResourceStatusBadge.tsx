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
  dot: string;
  classes: string;
};

const BADGE_MAP: Record<string, BadgeConfig> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-500",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    dot: "bg-red-500",
    classes: "border-red-200 bg-red-50 text-red-700",
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-amber-500",
    classes: "border-amber-200 bg-amber-50 text-amber-700",
  },
  NOT_AVAILABLE_NOW: {
    label: "Unavailable Now",
    dot: "bg-zinc-400",
    classes: "border-zinc-200 bg-zinc-50 text-zinc-600",
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
    dot: "bg-zinc-400",
    classes: "border-zinc-200 bg-zinc-50 text-zinc-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
