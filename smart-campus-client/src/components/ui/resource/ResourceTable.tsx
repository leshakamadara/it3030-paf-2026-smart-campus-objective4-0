import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Clock, MapPin, AlertCircle } from "lucide-react";
import ResourceStatusBadge from "./ResourceStatusBadge";
import type { Resource } from "../../../types/resource";

/* ── Type metadata ───────────────────────────────────────────── */
interface TypeConfig {
  label: string;
  icon: string;
  accentLeft: string;   // left border color (CSS value)
  imageBg: string;      // tailwind bg for placeholder
  chipBg: string;       // inline style string
  chipColor: string;
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  LECTURE_HALL: {
    label: "Lecture Hall", icon: "🏛️",
    accentLeft: "#7c3aed",
    imageBg: "bg-violet-50",
    chipBg: "#ede9ff", chipColor: "#5b21b6",
  },
  LAB: {
    label: "Lab", icon: "🖥️",
    accentLeft: "#2563eb",
    imageBg: "bg-blue-50",
    chipBg: "#eff6ff", chipColor: "#1d4ed8",
  },
  MEETING_ROOM: {
    label: "Meeting Room", icon: "🤝",
    accentLeft: "#0d9488",
    imageBg: "bg-teal-50",
    chipBg: "#f0fdf4", chipColor: "#0f766e",
  },
  PROJECTOR: {
    label: "Projector", icon: "📽️",
    accentLeft: "#d97706",
    imageBg: "bg-amber-50",
    chipBg: "#fffbeb", chipColor: "#92400e",
  },
  CAMERA: {
    label: "Camera", icon: "📷",
    accentLeft: "#e11d48",
    imageBg: "bg-rose-50",
    chipBg: "#fff1f2", chipColor: "#9f1239",
  },
};

const DEFAULT_TYPE_CONFIG: TypeConfig = {
  label: "Resource", icon: "📦",
  accentLeft: "#5e6ad2",
  imageBg: "bg-slate-50",
  chipBg: "#f3f4f5", chipColor: "#43464b",
};

/* ── Resource card ───────────────────────────────────────────── */
function ResourceCard({ resource }: { resource: Resource }) {
  const cfg = TYPE_CONFIG[resource.type] ?? DEFAULT_TYPE_CONFIG;
  const hasImage = !!resource.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="h-full"
    >
      <div
        className="group h-full flex flex-col rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-md"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e6e6e6",
          borderLeft: `3px solid ${cfg.accentLeft}`,
        }}
      >
        {/* Image / placeholder */}
        <div className="relative h-36 w-full overflow-hidden flex-shrink-0">
          {hasImage ? (
            <>
              <img
                src={resource.imageUrl!}
                alt={resource.name}
                className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${cfg.imageBg}`}>
              <span className="text-4xl opacity-50 transition-transform duration-300 group-hover:scale-110">
                {cfg.icon}
              </span>
            </div>
          )}

          {/* Status badge overlay */}
          <div className="absolute right-2 top-2 z-10">
            <ResourceStatusBadge resource={resource} />
          </div>
          {/* Bookable badge */}
          {resource.isBookable && (
            <div className="absolute left-2 top-2 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#059669", border: "1px solid #d1fae5" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Bookable
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-3 gap-2">
          {/* Type chip */}
          <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.chipBg, color: cfg.chipColor, border: `1px solid ${cfg.chipBg}` }}>
            {cfg.icon} {cfg.label}
          </span>

          {/* Name */}
          <h3 className="text-sm font-semibold truncate transition-colors group-hover:text-indigo-600"
            style={{ color: "#191a1b" }}>
            {resource.name}
          </h3>
          <p className="text-xs" style={{ color: "#8a8f98" }}>{resource.resourceCode}</p>

          {/* Building */}
          <p className="flex items-center gap-1 text-xs" style={{ color: "#43464b" }}>
            <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: "#8a8f98" }} />
            <span className="truncate">{resource.building}</span>
          </p>

          {/* Capacity + hours row */}
          <div className="mt-auto pt-2 flex items-center justify-between text-xs border-t"
            style={{ borderColor: "#f3f4f5", color: "#8a8f98" }}>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {resource.capacity != null ? `${resource.capacity} seats` : "—"}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3" />
              {resource.availableFrom.slice(0, 5)}–{resource.availableTo.slice(0, 5)}
            </span>
          </div>

          {/* View button */}
          <Link
            to={`/dashboard/resources/${resource.id}`}
            className="mt-1 flex items-center justify-center h-8 w-full rounded-md text-xs font-semibold transition-colors duration-150"
            style={{
              backgroundColor: "#f3f4f5",
              color: "#43464b",
              border: "1px solid #e6e6e6",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5e6ad2";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "#5e6ad2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f5";
              e.currentTarget.style.color = "#43464b";
              e.currentTarget.style.borderColor = "#e6e6e6";
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── ResourceTable (grid of cards) ──────────────────────────── */
interface ResourceTableProps {
  resources: Resource[];
}

export default function ResourceTable({ resources }: ResourceTableProps) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-lg"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}>
        <div className="p-3 rounded-full mb-3" style={{ backgroundColor: "#f3f4f5" }}>
          <AlertCircle className="h-6 w-6" style={{ color: "#8a8f98" }} />
        </div>
        <p className="font-semibold text-sm" style={{ color: "#191a1b" }}>No resources found</p>
        <p className="text-sm mt-1" style={{ color: "#8a8f98" }}>Try adjusting your search or filters.</p>
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