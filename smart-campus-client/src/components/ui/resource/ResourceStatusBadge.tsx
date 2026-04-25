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
    if (currentTime < resource.availableFrom || currentTime > resource.availableTo)
      return "NOT_AVAILABLE_NOW";
  }
  return "AVAILABLE";
};

type BadgeConfig = { label: string; bg: string; color: string; border: string; dot: string };

const BADGE_MAP: Record<string, BadgeConfig> = {
  AVAILABLE: {
    label: "Available",
    bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", dot: "#10b981",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    bg: "#fff1f2", color: "#9f1239", border: "#fecdd3", dot: "#f43f5e",
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    bg: "#fffbeb", color: "#92400e", border: "#fde68a", dot: "#f59e0b",
  },
  NOT_AVAILABLE_NOW: {
    label: "Unavailable Now",
    bg: "#f7f8f8", color: "#43464b", border: "#d0d6e0", dot: "#8a8f98",
  },
};

export default function ResourceStatusBadge({
  resource,
  displayStatus,
  className = "",
}: ResourceStatusBadgeProps) {
  const resolved = resolveDisplayStatus(resource, displayStatus);
  const cfg = BADGE_MAP[resolved] ?? {
    label: resolved, bg: "#f7f8f8", color: "#43464b", border: "#d0d6e0", dot: "#8a8f98",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}