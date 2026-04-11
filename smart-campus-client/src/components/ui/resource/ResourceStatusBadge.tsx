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
  if (explicitDisplayStatus) {
    return explicitDisplayStatus;
  }

  if (!resource) {
    return "AVAILABLE";
  }

  if (resource.isUnderMaintenance) {
    return "UNDER_MAINTENANCE";
  }

  if (resource.status === "OUT_OF_SERVICE") {
    return "OUT_OF_SERVICE";
  }

  if (resource.availableFrom && resource.availableTo) {
    const currentTime = new Date().toTimeString().slice(0, 8);

    if (
      currentTime < resource.availableFrom ||
      currentTime > resource.availableTo
    ) {
      return "NOT_AVAILABLE_NOW";
    }
  }

  return "AVAILABLE";
};

const getBadgeStyles = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "OUT_OF_SERVICE":
      return "border border-red-200 bg-red-50 text-red-700";
    case "UNDER_MAINTENANCE":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "NOT_AVAILABLE_NOW":
      return "border border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border border-slate-200 bg-slate-50 text-slate-700";
  }
};

const getLabel = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "OUT_OF_SERVICE":
      return "Out of Service";
    case "UNDER_MAINTENANCE":
      return "Under Maintenance";
    case "NOT_AVAILABLE_NOW":
      return "Not Available Now";
    default:
      return status;
  }
};

export default function ResourceStatusBadge({
  resource,
  displayStatus,
  className = "",
}: ResourceStatusBadgeProps) {
  const resolvedStatus = resolveDisplayStatus(resource, displayStatus);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeStyles(
        resolvedStatus,
      )} ${className}`}
    >
      {getLabel(resolvedStatus)}
    </span>
  );
}