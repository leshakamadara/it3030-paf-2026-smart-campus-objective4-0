import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, MapPin, Users, Clock, Calendar, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import ResourceStatusBadge from "../../components/ui/resource/ResourceStatusBadge";
import { useToast } from "../../components/ui/toast-system";
import { useAuth } from "@/context/AuthContext";
import resourceService from "../../services/resourceService";
import type { Resource } from "../../types/resource";

interface TypeTheme {
  accent: string;
  bgFill: string;
  chipBg: string;
  chipColor: string;
}

const TYPE_THEME: Record<string, TypeTheme> = {
  LECTURE_HALL: { accent: "#7c3aed", bgFill: "#ede9ff", chipBg: "#ede9ff", chipColor: "#5b21b6" },
  LAB: { accent: "#2563eb", bgFill: "#eff6ff", chipBg: "#eff6ff", chipColor: "#1d4ed8" },
  MEETING_ROOM: { accent: "#0d9488", bgFill: "#f0fdf4", chipBg: "#f0fdf4", chipColor: "#0f766e" },
  PROJECTOR: { accent: "#d97706", bgFill: "#fffbeb", chipBg: "#fffbeb", chipColor: "#92400e" },
  CAMERA: { accent: "#e11d48", bgFill: "#fff1f2", chipBg: "#fff1f2", chipColor: "#9f1239" },
};

const DEFAULT_THEME: TypeTheme = {
  accent: "#5e6ad2", bgFill: "#f7f8f8", chipBg: "#f3f4f5", chipColor: "#43464b",
};

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

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchResource = async () => {
      if (!id) { setError("Resource ID is missing."); setLoading(false); return; }
      try {
        setLoading(true); setError("");
        const data = await resourceService.getResourceById(Number(id));
        if (isMounted) setResource(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load resource.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchResource();
    return () => { isMounted = false; };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await resourceService.deleteResource(Number(id));
      setShowDeleteConfirm(false);
      toast.success("Resource deleted", `The resource has been permanently removed.`);
      navigate("/dashboard/resources");
    } catch (err) {
      setDeleting(false); setShowDeleteConfirm(false);
      toast.error("Delete failed", err instanceof Error ? err.message : "Could not delete resource.");
    }
  };

  /* ── Loader ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f7f8f8" }}>
        <div className="flex items-center gap-3" style={{ color: "#8a8f98" }}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading resource…</span>
        </div>
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────── */
  if (error || !resource) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
        <div className="border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
            <Link
              to="/dashboard/resources"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600"
              style={{ color: "#43464b" }}
            >
              <ChevronLeft className="h-4 w-4" /> Resources
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-lg border p-5 flex items-start gap-3"
            style={{ backgroundColor: "#fff1f2", borderColor: "#fecdd3" }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#f43f5e" }} />
            <div>
              <p className="font-semibold text-sm" style={{ color: "#9f1239" }}>Failed to load</p>
              <p className="text-sm mt-1" style={{ color: "#be123c" }}>{error || "Resource not found."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const theme = TYPE_THEME[resource.type] ?? DEFAULT_THEME;
  const enabledFeatures = FEATURES.filter((f) => resource[f.key as keyof Resource]);
  const disabledFeatures = FEATURES.filter((f) => !resource[f.key as keyof Resource]);
  const admin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      {/* Brand accent stripe */}
      <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />

      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-md"
        style={{ borderColor: "#e6e6e6" }}>
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/dashboard/resources"
                className="inline-flex items-center gap-1 font-medium transition-colors hover:text-indigo-600"
                style={{ color: "#43464b" }}
              >
                <ChevronLeft className="h-4 w-4" /> Resources
              </Link>
              <span style={{ color: "#d0d6e0" }}>/</span>
              <span className="font-medium" style={{ color: "#191a1b" }}>{resource.resourceCode}</span>
            </div>

            <div className="flex items-center gap-3">
              <ResourceStatusBadge resource={resource} />
              {admin && (
                <Button asChild size="sm"
                  className="font-semibold shadow-none transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#5e6ad2", color: "#ffffff", borderRadius: "6px" }}
                >
                  <Link to={`/dashboard/admin/resources/edit/${resource.id}`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-lg overflow-hidden shadow-sm flex flex-col"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6", borderTop: `4px solid ${theme.accent}` }}>
            
            <div className="p-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Info left */}
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: theme.bgFill }}>
                  {TYPE_ICONS[resource.type] ?? "📦"}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#8a8f98", letterSpacing: "0.5px" }}>
                    {resource.resourceCode}
                  </p>
                  <h1 className="text-2xl font-bold" style={{ color: "#191a1b", letterSpacing: "-0.4px" }}>
                    {resource.name}
                  </h1>
                  {resource.description && (
                    <p className="mt-2 text-sm leading-relaxed max-w-2xl" style={{ color: "#43464b" }}>
                      {resource.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Badges right */}
              <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: theme.chipBg, color: theme.chipColor }}>
                  {TYPE_ICONS[resource.type]} {TYPE_LABELS[resource.type] ?? resource.type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#f7f8f8", color: "#43464b", border: "1px solid #e6e6e6" }}>
                  <MapPin className="h-3 w-3" style={{ color: "#8a8f98" }} />
                  {resource.building}
                </span>
                {resource.isBookable && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Bookable
                  </span>
                )}
              </div>
            </div>

            {/* Image section */}
            {resource.imageUrl && (
              <div className="px-6 pb-6">
                <div className="rounded-lg overflow-hidden flex items-center justify-center h-64 w-full"
                  style={{ backgroundColor: "#f3f4f5" }}>
                  <img
                    src={resource.imageUrl}
                    alt={resource.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const p = (e.target as HTMLImageElement).parentElement;
                      if(p) { p.innerHTML = `<span class="text-5xl opacity-40">${TYPE_ICONS[resource.type] ?? '📦'}</span>`; }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Details grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info Card */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-lg overflow-hidden shadow-sm h-full"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "#f3f4f5" }}>
                <h3 className="font-semibold text-base" style={{ color: "#191a1b" }}>Resource Information</h3>
              </div>
              <div className="p-5 space-y-2">
                <InfoRow label="Code" value={resource.resourceCode} />
                <InfoRow label="Type" value={TYPE_LABELS[resource.type] ?? resource.type} />
                <InfoRow label="Building" value={resource.building} icon={<MapPin className="h-4 w-4" />} />
                <InfoRow label="Capacity" value={resource.capacity != null ? `${resource.capacity} people` : "—"} icon={<Users className="h-4 w-4" />} />
                <InfoRow label="Bookable" value={resource.isBookable ? "Yes" : "No"} />
                <InfoRow label="Under Maintenance" value={resource.isUnderMaintenance ? "Yes" : "No"} />
                
                <div className="my-3 border-t" style={{ borderColor: "#f3f4f5" }} />
                
                <InfoRow label="Created" value={formatDateTime(resource.createdAt)} icon={<Calendar className="h-4 w-4" />} />
                <InfoRow label="Last Updated" value={formatDateTime(resource.updatedAt)} />
              </div>
            </div>
          </motion.div>

          {/* Availability Card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-lg overflow-hidden shadow-sm h-full"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "#f3f4f5" }}>
                <h3 className="font-semibold text-base" style={{ color: "#191a1b" }}>Availability</h3>
              </div>
              <div className="p-5">
                <div className="rounded-xl p-6 text-center flex flex-col items-center justify-center"
                  style={{ backgroundColor: theme.bgFill }}>
                  <Clock className="mb-3 h-8 w-8" style={{ color: theme.accent }} />
                  <p className="font-mono text-2xl font-bold" style={{ color: "#191a1b" }}>
                    {resource.availableFrom.slice(0, 5)} – {resource.availableTo.slice(0, 5)}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#8a8f98" }}>Daily operational hours</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="rounded-lg overflow-hidden shadow-sm"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "#f3f4f5" }}>
              <h3 className="font-semibold text-base" style={{ color: "#191a1b" }}>Features & Amenities</h3>
            </div>
            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {enabledFeatures.map((f) => (
                  <div key={f.key} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: "#ede9ff", border: "1px solid #c4b5fd" }}>
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-sm font-semibold" style={{ color: "#5b21b6" }}>{f.label}</span>
                    <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-white text-xs text-indigo-600 font-bold shadow-sm">
                      ✓
                    </span>
                  </div>
                ))}
                {disabledFeatures.map((f) => (
                  <div key={f.key} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: "#f7f8f8", border: "1px solid #e6e6e6" }}>
                    <span className="text-lg opacity-40 grayscale">{f.icon}</span>
                    <span className="text-sm font-medium" style={{ color: "#8a8f98" }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        {resource.isBookable && !resource.isUnderMaintenance && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              style={{ backgroundColor: "#ede9ff", border: "1px solid #c4b5fd" }}>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2 mb-1" style={{ color: "#5b21b6" }}>
                  <CalendarPlus className="h-5 w-5" />
                  Ready to book?
                </h3>
                <p className="text-sm" style={{ color: "#4c1d95" }}>
                  This resource is available. Submit a booking request for review.
                </p>
              </div>
              <Button asChild
                className="font-semibold shadow-none transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: "#5e6ad2", color: "#ffffff", borderRadius: "6px" }}
              >
                <Link to={`/dashboard/bookings/new?resourceId=${resource.id}`}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Create Booking
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Admin Danger Zone */}
        {admin && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              style={{ backgroundColor: "#ffffff", border: "1px solid #fca5a5" }}>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: "#b91c1c" }}>Delete Resource</h3>
                <p className="text-sm" style={{ color: "#991b1b" }}>
                  Permanently remove this resource from the catalogue. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="font-semibold shadow-none transition-colors hover:bg-red-700 whitespace-nowrap"
                style={{ backgroundColor: "#dc2626", color: "#ffffff", borderRadius: "6px" }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="border-0 shadow-xl sm:rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              This will permanently delete <strong>{resource.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700 shadow-none border-0"
            >
              {deleting ? "Deleting..." : "Yes, delete resource"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "#f3f4f5" }}>
      <span className="flex items-center gap-2 text-sm font-medium" style={{ color: "#8a8f98" }}>
        {icon} {label}
      </span>
      <span className="text-sm font-semibold text-right max-w-[50%] truncate" style={{ color: "#191a1b" }}>
        {value}
      </span>
    </div>
  );
}