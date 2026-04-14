import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResourceStatusBadge from "../../components/ui/resource/ResourceStatusBadge";
import resourceService from "../../services/resourceService";
import type { Resource } from "../../types/resource";
import { isAdmin } from "../../lib/mockAuth";

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

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchResource = async () => {
      if (!id) { setError("Resource ID is missing."); setLoading(false); return; }

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
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
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
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
            <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
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

  const enabledFeatures = FEATURES.filter((f) => resource[f.key as keyof Resource]);
  const disabledFeatures = FEATURES.filter((f) => !resource[f.key as keyof Resource]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sub-header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
              {isAdmin() && (
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

        {/* Hero card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* Image */}
          {resource.imageUrl && (
            <div className="h-56 w-full overflow-hidden">
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-2xl">
                  {TYPE_ICONS[resource.type] ?? "📦"}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
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

              <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                <div className="text-zinc-500">
                  Type: <span className="font-semibold text-zinc-900">{TYPE_LABELS[resource.type] ?? resource.type}</span>
                </div>
                <div className="mt-1 text-zinc-500">
                  Building: <span className="font-semibold text-zinc-900">{resource.building}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resource info */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
              <span className="text-base">📋</span>
              Resource Information
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Code", value: resource.resourceCode },
                { label: "Type", value: TYPE_LABELS[resource.type] ?? resource.type },
                { label: "Building", value: resource.building },
                {
                  label: "Capacity",
                  value: resource.capacity != null ? `${resource.capacity} people` : "—",
                },
                { label: "Bookable", value: resource.isBookable ? "Yes" : "No" },
                { label: "Maintenance", value: resource.isUnderMaintenance ? "Yes" : "No" },
              ].map((item) => (
                <InfoCell key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>

          {/* Availability & dates */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
              <span className="text-base">🕐</span>
              Availability
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Daily Hours</p>
                <p className="mt-2 font-mono text-xl font-bold text-zinc-900">
                  {resource.availableFrom.slice(0, 5)}
                  <span className="px-2 text-zinc-400">–</span>
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

        {/* Features */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-900">
            <span className="text-base">⚙️</span>
            Features & Amenities
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
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
