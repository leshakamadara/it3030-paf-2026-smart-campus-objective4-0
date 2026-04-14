import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ResourceStatusBadge from "../../components/ui/resource/ResourceStatusBadge";
import { ConfirmDialog, useToast } from "../../components/ui/toast-system";
import { isAdmin } from "../../lib/mockAuth";
import resourceService from "../../services/resourceService";
import type { Resource } from "../../types/resource";

// ─── Type theming ─────────────────────────────────────────────────────────────

interface TypeTheme {
  heroBg: string;
  accentBar: string;
  iconBg: string;
  iconText: string;
  labelBg: string;
  labelText: string;
}

const TYPE_THEME: Record<string, TypeTheme> = {
  LECTURE_HALL: {
    heroBg: "from-violet-50 via-purple-50/60 to-zinc-50",
    accentBar: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
    labelBg: "bg-violet-100 border-violet-200",
    labelText: "text-violet-700",
  },
  LAB: {
    heroBg: "from-blue-50 via-sky-50/60 to-zinc-50",
    accentBar: "from-blue-500 to-sky-600",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    labelBg: "bg-blue-100 border-blue-200",
    labelText: "text-blue-700",
  },
  MEETING_ROOM: {
    heroBg: "from-teal-50 via-emerald-50/60 to-zinc-50",
    accentBar: "from-teal-500 to-emerald-600",
    iconBg: "bg-teal-100",
    iconText: "text-teal-600",
    labelBg: "bg-teal-100 border-teal-200",
    labelText: "text-teal-700",
  },
  PROJECTOR: {
    heroBg: "from-amber-50 via-yellow-50/60 to-zinc-50",
    accentBar: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    labelBg: "bg-amber-100 border-amber-200",
    labelText: "text-amber-700",
  },
  CAMERA: {
    heroBg: "from-rose-50 via-pink-50/60 to-zinc-50",
    accentBar: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    labelBg: "bg-rose-100 border-rose-200",
    labelText: "text-rose-700",
  },
};

const DEFAULT_THEME: TypeTheme = {
  heroBg: "from-zinc-50 to-slate-50",
  accentBar: "from-zinc-500 to-slate-600",
  iconBg: "bg-zinc-100",
  iconText: "text-zinc-600",
  labelBg: "bg-zinc-100 border-zinc-200",
  labelText: "text-zinc-700",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  PROJECTOR: "Projector",
  CAMERA: "Camera",
};

const TYPE_ICONS: Record<string, string> = {
  LECTURE_HALL: "🏛️",
  LAB: "🖥️",
  MEETING_ROOM: "🤝",
  PROJECTOR: "📽️",
  CAMERA: "📷",
};

const FEATURES = [
  { key: "hasProjector", label: "Projector", icon: "📽️" },
  { key: "hasAc", label: "Air Conditioning", icon: "❄️" },
  { key: "hasWhiteboard", label: "Whiteboard", icon: "✏️" },
  { key: "hasWifi", label: "Wi-Fi", icon: "📶" },
  { key: "hasComputers", label: "Computers", icon: "💻" },
  { key: "hasWindows", label: "Windows", icon: "🪟" },
] as const;

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchResource = async () => {
      if (!id) {
        setError("Resource ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const data = await resourceService.getResourceById(Number(id));
        if (isMounted) setResource(data);
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Failed to load resource.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResource();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await resourceService.deleteResource(Number(id));
      setShowDeleteConfirm(false);
      toast.success("Resource deleted", `The resource has been permanently removed.`);
      navigate("/resources");
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      toast.error("Delete failed", err instanceof Error ? err.message : "Could not delete resource.");
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3 text-zinc-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading resource...</span>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="relative overflow-hidden border-b border-zinc-200 bg-white">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <Link to="/resources" className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Resources
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
            <span className="text-xl">⚠️</span>
            <div>
              <h2 className="font-semibold text-red-900">Failed to load</h2>
              <p className="mt-1 text-sm text-red-700">{error || "Resource not found."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const theme = TYPE_THEME[resource.type] ?? DEFAULT_THEME;
  const enabledFeatures = FEATURES.filter((f) => resource[f.key as keyof Resource]);
  const disabledFeatures = FEATURES.filter((f) => !resource[f.key as keyof Resource]);
  const admin = isAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── Sub-header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-white">
        <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${theme.accentBar}`} />
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4">
              <Link
                to="/resources"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Resources
              </Link>
              <span className="text-zinc-300">/</span>
              <span className="text-sm text-zinc-500">{resource.resourceCode}</span>
            </div>

            <div className="flex items-center gap-3">
              <ResourceStatusBadge resource={resource} />
              {admin && (
                <Link
                  to={`/admin/resources/edit/${resource.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Type-coloured gradient banner */}
          <div className={`bg-linear-to-br ${theme.heroBg} px-6 pb-6 pt-7`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/80 text-2xl shadow-sm ${theme.iconBg}`}>
                  {TYPE_ICONS[resource.type] ?? "📦"}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {resource.resourceCode}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
                    {resource.name}
                  </h1>
                  {resource.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                      {resource.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {/* Type badge */}
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme.labelBg} ${theme.labelText}`}>
                  {TYPE_ICONS[resource.type]}
                  {TYPE_LABELS[resource.type] ?? resource.type}
                </span>
                {/* Building badge */}
                <span className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-700">
                  <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {resource.building}
                </span>
                {/* Bookable pill */}
                {resource.isBookable && (
                  <span className="inline-flex w-fit items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Bookable
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resource image if available */}
          {resource.imageUrl && (
            <div className="border-t border-zinc-100">
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="h-52 w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* ── Detail grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resource info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${theme.iconBg} ${theme.iconText}`}>📋</span>
              Resource Information
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Code", value: resource.resourceCode, color: theme },
                { label: "Type", value: TYPE_LABELS[resource.type] ?? resource.type, color: null },
                { label: "Building", value: resource.building, color: null },
                { label: "Capacity", value: resource.capacity != null ? `${resource.capacity} people` : "—", color: null },
                { label: "Bookable", value: resource.isBookable ? "Yes" : "No", color: null },
                { label: "Maintenance", value: resource.isUnderMaintenance ? "Active" : "None", color: null },
              ].map((item) => (
                <InfoCell key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>

          {/* Availability & dates */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm text-sky-600">🕐</span>
              Availability
            </h2>
            <div className="mt-5 space-y-4">
              {/* Hours banner */}
              <div className={`rounded-xl border bg-linear-to-br ${theme.heroBg} px-4 py-4`}>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Daily Hours</p>
                <p className="mt-2 font-mono text-2xl font-bold text-zinc-900">
                  {resource.availableFrom.slice(0, 5)}
                  <span className="mx-2 text-zinc-400">–</span>
                  {resource.availableTo.slice(0, 5)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoCell label="Created" value={formatDateTime(resource.createdAt)} />
                <InfoCell label="Updated" value={formatDateTime(resource.updatedAt)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-sm text-violet-600">⚙️</span>
            Features &amp; Amenities
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enabledFeatures.map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
              >
                <span className="text-base">{f.icon}</span>
                <span className="text-sm font-semibold text-emerald-800">{f.label}</span>
                <svg className="ml-auto h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ))}
            {disabledFeatures.map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <span className="text-base opacity-40">{f.icon}</span>
                <span className="text-sm font-medium text-zinc-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Admin Danger Zone (Delete button lives here) ─────────────────── */}
        {admin && (
          <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
            <div className="h-1 bg-linear-to-r from-rose-400 to-red-500" />
            <div className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-100">
                    <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-rose-900">Danger Zone</h2>
                    <p className="mt-1 text-sm text-rose-700">
                      Deleting this resource is permanent and cannot be undone. All associated data will be removed.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-rose-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-400 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? "Deleting..." : "Delete Resource"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Delete Dialog ────────────────────────────────────────────── */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this resource?"
        description={`"${resource.name}" will be permanently removed from the catalogue. This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
