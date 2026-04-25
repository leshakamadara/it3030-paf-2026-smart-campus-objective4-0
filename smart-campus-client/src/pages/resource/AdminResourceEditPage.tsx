import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Lock, Loader2, AlertCircle } from "lucide-react";
import ResourceForm from "../../components/ui/resource/ResourceForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "../../components/ui/toast-system";
import { useAuth } from "@/context/AuthContext";
import resourceService from "../../services/resourceService";
import type { Resource, ResourceRequest } from "../../types/resource";

const toRequestValues = (resource: Resource): ResourceRequest => ({
  resourceCode: resource.resourceCode,
  name: resource.name,
  type: resource.type,
  building: resource.building,
  status: resource.status,
  availableFrom: resource.availableFrom,
  availableTo: resource.availableTo,
  isBookable: resource.isBookable,
  isUnderMaintenance: resource.isUnderMaintenance,
  description: resource.description ?? undefined,
  capacity: resource.capacity ?? null,
  imageUrl: resource.imageUrl ?? undefined,
  hasProjector: resource.hasProjector,
  hasAc: resource.hasAc,
  hasWhiteboard: resource.hasWhiteboard,
  hasWifi: resource.hasWifi,
  hasComputers: resource.hasComputers,
  hasWindows: resource.hasWindows,
});

export default function AdminResourceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const admin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(admin);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!admin) return;
    if (!id) {
      setPageError("Resource ID is missing.");
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchResource = async () => {
      try {
        setLoading(true);
        setPageError("");
        const data = await resourceService.getResourceById(Number(id));
        if (isMounted) setResource(data);
      } catch (error) {
        if (isMounted)
          setPageError(error instanceof Error ? error.message : "Failed to load resource.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchResource();
    return () => { isMounted = false; };
  }, [id, admin]);

  if (!admin) return <AccessDenied />;

  const handleUpdate = async (values: ResourceRequest) => {
    if (!id) return;
    try {
      setFormError("");
      const updated = await resourceService.updateResource(Number(id), values);
      toast.success("Changes saved!", `"${updated.name}" has been updated.`);
      navigate(`/dashboard/admin/resources/stats`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update resource.";
      toast.error("Update failed", message);
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      <PageHeader
        title="Edit Resource"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Resource Admin", href: "/dashboard/admin/resources/stats" },
          { label: "Edit" }
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#8a8f98" }} />
            <span className="text-sm" style={{ color: "#8a8f98" }}>Loading resource…</span>
          </div>
        ) : pageError || !resource ? (
          <div className="rounded-lg border p-5 flex items-start gap-3"
            style={{ backgroundColor: "#fff1f2", borderColor: "#fecdd3" }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#f43f5e" }} />
            <div>
              <p className="font-semibold text-sm" style={{ color: "#9f1239" }}>Failed to load</p>
              <p className="text-sm" style={{ color: "#be123c" }}>{pageError || "Resource not found."}</p>
            </div>
          </div>
        ) : (
          <ResourceForm
            mode="edit"
            initialValues={toRequestValues(resource)}
            onSubmit={handleUpdate}
            formError={formError}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />
      <div className="border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/dashboard/resources"
            className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600"
            style={{ color: "#43464b" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Resources
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border p-6 flex items-start gap-4"
          style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
          <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#d97706" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#92400e" }}>Admin Access Required</p>
            <p className="text-sm mt-1" style={{ color: "#b45309" }}>
              Only administrators can edit resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}