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
    classes: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    dotColor: "bg-red-500",
    classes: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-700",
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    dotColor: "bg-amber-500",
    classes: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700",
  },
  NOT_AVAILABLE_NOW: {
    label: "Unavailable Now",
    dotColor: "bg-gray-500",
    classes: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
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
    dotColor: "bg-gray-500",
    classes: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${config.classes} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotColor} ring-2 ring-white dark:ring-gray-900`} />
      {config.label}
    </span>
  );
}