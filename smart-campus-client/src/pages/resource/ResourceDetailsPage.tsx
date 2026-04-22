import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2, MapPin, Users, Clock, Calendar, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import ResourceStatusBadge from "../../components/ui/resource/ResourceStatusBadge";
import { useToast } from "../../components/ui/toast-system";
import { useAuth } from "@/context/AuthContext";
import resourceService from "../../services/resourceService";
import type { Resource } from "../../types/resource";

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
    heroBg: "from-violet-500/10 via-purple-500/5 to-background",
    accentBar: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600",
    labelBg: "bg-violet-500/10 border-violet-200",
    labelText: "text-violet-700",
  },
  LAB: {
    heroBg: "from-blue-500/10 via-sky-500/5 to-background",
    accentBar: "from-blue-500 to-sky-500",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600",
    labelBg: "bg-blue-500/10 border-blue-200",
    labelText: "text-blue-700",
  },
  MEETING_ROOM: {
    heroBg: "from-teal-500/10 via-emerald-500/5 to-background",
    accentBar: "from-teal-500 to-emerald-500",
    iconBg: "bg-teal-500/10",
    iconText: "text-teal-600",
    labelBg: "bg-teal-500/10 border-teal-200",
    labelText: "text-teal-700",
  },
  PROJECTOR: {
    heroBg: "from-amber-500/10 via-yellow-500/5 to-background",
    accentBar: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600",
    labelBg: "bg-amber-500/10 border-amber-200",
    labelText: "text-amber-700",
  },
  CAMERA: {
    heroBg: "from-rose-500/10 via-pink-500/5 to-background",
    accentBar: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-600",
    labelBg: "bg-rose-500/10 border-rose-200",
    labelText: "text-rose-700",
  },
};

const DEFAULT_THEME: TypeTheme = {
  heroBg: "from-muted to-background",
  accentBar: "from-primary to-primary/90",
  iconBg: "bg-muted",
  iconText: "text-muted-foreground",
  labelBg: "bg-muted border-border",
  labelText: "text-muted-foreground",
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
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading resource...</span>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
            <Button variant="ghost" asChild className="transition-all hover:bg-muted">
              <Link to="/resources">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Resources
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-start gap-4 py-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h2 className="font-semibold text-destructive">Failed to load</h2>
                <p className="text-sm text-destructive">{error || "Resource not found."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const theme = TYPE_THEME[resource.type] ?? DEFAULT_THEME;
  const enabledFeatures = FEATURES.filter((f) => resource[f.key as keyof Resource]);
  const disabledFeatures = FEATURES.filter((f) => !resource[f.key as keyof Resource]);
  const admin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.accentBar} animate-gradient-x`} />
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4 pt-1"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="transition-all hover:bg-muted">
                <Link to="/resources">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Resources
                </Link>
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">{resource.resourceCode}</span>
            </div>
            <div className="flex items-center gap-3">
              <ResourceStatusBadge resource={resource} />
              {admin && (
                <Button asChild className="transition-all hover:scale-105 hover:shadow-md">
                  <Link to={`/admin/resources/edit/${resource.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`border-t-4 ${theme.accentBar} overflow-hidden transition-shadow hover:shadow-xl`}>
            <CardHeader>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`rounded-lg p-3 ${theme.iconBg} transition-transform group-hover:scale-110`}>
                    <span className="text-2xl">{TYPE_ICONS[resource.type] ?? "📦"}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{resource.resourceCode}</p>
                    <h1 className="text-2xl font-bold">{resource.name}</h1>
                    {resource.description && (
                      <p className="mt-1 text-muted-foreground">{resource.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Badge variant="outline" className={`${theme.labelBg} transition-all hover:scale-105`}>
                    {TYPE_ICONS[resource.type]} {TYPE_LABELS[resource.type] ?? resource.type}
                  </Badge>
                  <Badge variant="outline" className="gap-1 transition-all hover:scale-105">
                    <MapPin className="h-3.5 w-3.5" />
                    {resource.building}
                  </Badge>
                  {resource.isBookable && (
                    <Badge variant="secondary" className="gap-1 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Bookable
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            {resource.imageUrl && (
  <div className="px-6 pb-6">
    <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
      <img
        src={resource.imageUrl}
        alt={resource.name}
        className="h-52 w-full object-contain transition-transform duration-500 hover:scale-[1.02]"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.classList.add('flex', 'items-center', 'justify-center', 'bg-muted');
            const span = document.createElement('span');
            span.className = 'text-4xl opacity-50';
            span.textContent = TYPE_ICONS[resource.type] ?? '📦';
            parent.appendChild(span);
          }
        }}
      />
    </div>
  </div>
)}
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Resource Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Code" value={resource.resourceCode} />
                <InfoRow label="Type" value={TYPE_LABELS[resource.type] ?? resource.type} />
                <InfoRow
                  label="Building"
                  value={resource.building}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <InfoRow
                  label="Capacity"
                  value={resource.capacity != null ? `${resource.capacity} people` : "—"}
                  icon={<Users className="h-4 w-4" />}
                />
                <InfoRow label="Bookable" value={resource.isBookable ? "Yes" : "No"} />
                <InfoRow
                  label="Under Maintenance"
                  value={resource.isUnderMaintenance ? "Yes" : "No"}
                />
                <Separator />
                <InfoRow
                  label="Created"
                  value={formatDateTime(resource.createdAt)}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <InfoRow label="Last Updated" value={formatDateTime(resource.updatedAt)} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Availability Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`rounded-lg bg-gradient-to-br ${theme.heroBg} p-4 text-center transition-all hover:scale-[1.02]`}>
                  <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="font-mono text-2xl font-bold">
                    {resource.availableFrom.slice(0, 5)} – {resource.availableTo.slice(0, 5)}
                  </p>
                  <p className="text-sm text-muted-foreground">Daily hours</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {enabledFeatures.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 transition-all hover:scale-[1.02] hover:shadow-md cursor-default"
                  >
                    <span className="text-xl">{f.icon}</span>
                    <span className="font-medium text-primary">{f.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      ✓
                    </Badge>
                  </div>
                ))}
                {disabledFeatures.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center gap-3 rounded-lg border bg-muted p-3 text-muted-foreground transition-all hover:scale-[1.02] cursor-default"
                  >
                    <span className="text-xl opacity-40">{f.icon}</span>
                    <span className="font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone (Admin only) */}
        {admin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-destructive/50 transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Delete this resource</p>
                    <p className="text-sm text-muted-foreground">
                      Once deleted, it will be permanently removed. This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="transition-all hover:scale-105 hover:shadow-md"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Book This Resource CTA */}
        {resource.isBookable && !resource.isUnderMaintenance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-[#5e6ad2]/30 bg-gradient-to-br from-[#eef2ff] to-[#f7f8ff] transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#5e6ad2]">
                  <CalendarPlus className="h-5 w-5" />
                  Book This Resource
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-[#43464b]">
                  This resource is available for booking. Submit a request and an admin will review it.
                </p>
                <Button
                  asChild
                  className="bg-[#5e6ad2] text-white transition-all hover:bg-[#7170ff] hover:scale-105 hover:shadow-md"
                >
                  <Link to={`/bookings/new?resourceId=${resource.id}`}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Create Booking
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{resource.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all hover:scale-105"
            >
              {deleting ? "Deleting..." : "Yes, delete resource"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between transition-all hover:bg-muted/50 p-1 rounded">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}