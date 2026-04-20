type DateInput = string | number | null | undefined;

const normalizeDateString = (iso: DateInput): string | null => {
  if (iso === null || iso === undefined || iso === "") return null;

  if (typeof iso === "number") {
    return new Date(iso).toISOString();
  }

  if (typeof iso !== "string") {
    return null;
  }

  const trimmed = iso.trim();
  if (!trimmed) return null;


  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.replace(" ", "T");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00`;
  }
  return trimmed;
};

const safeDate = (iso: DateInput) => {
  const normalized = normalizeDateString(iso);
  if (!normalized) return null;
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
};

export const timeAgo = (iso: DateInput) => {
  const date = safeDate(iso);
  if (!date) return "unknown";
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const formatDate = (iso: DateInput) => {
  const date = safeDate(iso);
  if (!date) return "unknown";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (iso: DateInput) => {
  const date = safeDate(iso);
  if (!date) return "unknown";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};