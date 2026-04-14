import { Link } from "react-router-dom";
import type { Resource } from "../../../types/resource";
import ResourceStatusBadge from "./ResourceStatusBadge";

// ─── Type theming ─────────────────────────────────────────────────────────────

interface TypeConfig {
  label: string;
  icon: string;
  imageBg: string;          // placeholder image section bg
  imageIconColor: string;   // icon opacity/color in placeholder
  chipBg: string;           // type chip background + border + text
  borderAccent: string;     // left border color class
  viewBtn: string;          // hover state of view details button
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  LECTURE_HALL: {
    label: "Lecture Hall",
    icon: "🏛️",
    imageBg: "bg-linear-to-br from-violet-100 to-purple-50",
    imageIconColor: "text-violet-300",
    chipBg: "bg-violet-100 border-violet-200 text-violet-700",
    borderAccent: "border-l-violet-400",
    viewBtn: "hover:border-violet-600 hover:bg-violet-600 hover:text-white",
  },
  LAB: {
    label: "Lab",
    icon: "🖥️",
    imageBg: "bg-linear-to-br from-blue-100 to-sky-50",
    imageIconColor: "text-blue-300",
    chipBg: "bg-blue-100 border-blue-200 text-blue-700",
    borderAccent: "border-l-blue-400",
    viewBtn: "hover:border-blue-600 hover:bg-blue-600 hover:text-white",
  },
  MEETING_ROOM: {
    label: "Meeting Room",
    icon: "🤝",
    imageBg: "bg-linear-to-br from-teal-100 to-emerald-50",
    imageIconColor: "text-teal-300",
    chipBg: "bg-teal-100 border-teal-200 text-teal-700",
    borderAccent: "border-l-teal-400",
    viewBtn: "hover:border-teal-600 hover:bg-teal-600 hover:text-white",
  },
  PROJECTOR: {
    label: "Projector",
    icon: "📽️",
    imageBg: "bg-linear-to-br from-amber-100 to-yellow-50",
    imageIconColor: "text-amber-300",
    chipBg: "bg-amber-100 border-amber-200 text-amber-700",
    borderAccent: "border-l-amber-400",
    viewBtn: "hover:border-amber-500 hover:bg-amber-500 hover:text-white",
  },
  CAMERA: {
    label: "Camera",
    icon: "📷",
    imageBg: "bg-linear-to-br from-rose-100 to-pink-50",
    imageIconColor: "text-rose-300",
    chipBg: "bg-rose-100 border-rose-200 text-rose-700",
    borderAccent: "border-l-rose-400",
    viewBtn: "hover:border-rose-600 hover:bg-rose-600 hover:text-white",
  },
};

const DEFAULT_TYPE_CONFIG: TypeConfig = {
  label: "Resource",
  icon: "📦",
  imageBg: "bg-linear-to-br from-zinc-100 to-slate-50",
  imageIconColor: "text-zinc-300",
  chipBg: "bg-zinc-100 border-zinc-200 text-zinc-700",
  borderAccent: "border-l-zinc-400",
  viewBtn: "hover:border-zinc-800 hover:bg-zinc-900 hover:text-white",
};

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: Resource }) {
  const cfg = TYPE_CONFIG[resource.type] ?? DEFAULT_TYPE_CONFIG;
  const hasImage = !!resource.imageUrl;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 border-l-4 ${cfg.borderAccent}`}
    >
      {/* ── Image / placeholder ────────────────────────────────────────── */}
      <div className="relative h-44 w-full overflow-hidden">
        {hasImage ? (
          <img
            src={resource.imageUrl!}
            alt={resource.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add("flex", "items-center", "justify-center");
                parent.style.background = "var(--tw-gradient-from, #f4f4f5)";
                const span = document.createElement("span");
                span.style.fontSize = "3.5rem";
                span.textContent = cfg.icon;
                parent.appendChild(span);
              }
            }}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${cfg.imageBg}`}>
            <span className={`text-5xl opacity-60 ${cfg.imageIconColor}`}>{cfg.icon}</span>
          </div>
        )}

        {/* Status badge — top right */}
        <div className="absolute right-3 top-3">
          <ResourceStatusBadge resource={resource} />
        </div>

        {/* Bookable pill — top left */}
        {resource.isBookable && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/90 px-2 py-0.5 text-xs font-semibold text-emerald-700 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Bookable
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Type chip */}
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${cfg.chipBg}`}
        >
          {cfg.icon}
          {cfg.label}
        </span>

        {/* Name + code */}
        <h3 className="mt-3 truncate text-base font-bold tracking-tight text-zinc-900">
          {resource.name}
        </h3>
        <p className="text-xs text-zinc-400">{resource.resourceCode}</p>

        {/* Building */}
        <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600">
          <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="truncate">{resource.building}</span>
        </p>

        {/* Divider + meta row */}
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            {/* Capacity */}
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {resource.capacity != null ? `${resource.capacity} seats` : "—"}
            </span>

            {/* Hours */}
            <span className="flex items-center gap-1 font-mono">
              <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {resource.availableFrom.slice(0, 5)}–{resource.availableTo.slice(0, 5)}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View Details button */}
        <Link
          to={`/resources/${resource.id}`}
          className={`mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-800 transition ${cfg.viewBtn}`}
        >
          View Details
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

// ─── Table (Grid) ─────────────────────────────────────────────────────────────

interface ResourceTableProps {
  resources: Resource[];
}

export default function ResourceTable({ resources }: ResourceTableProps) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
          <svg className="h-6 w-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-zinc-900">No resources found</p>
          <p className="mt-1 text-sm text-zinc-500">Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
}
