import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ResourceForm from "../../components/ui/resource/ResourceForm";
import { useToast } from "../../components/ui/toast-system";
import { isAdmin } from "../../lib/mockAuth";
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
  const admin = isAdmin();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(admin);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!admin) return;
    if (!id) { setPageError("Resource ID is missing."); setLoading(false); return; }
    let isMounted = true;
    const fetchResource = async () => {
      try {
        setLoading(true);
        setPageError("");
        const data = await resourceService.getResourceById(Number(id));
        if (isMounted) setResource(data);
      } catch (error) {
        if (isMounted) setPageError(error instanceof Error ? error.message : "Failed to load resource.");
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
      navigate(`/resources/${updated.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update resource.";
      toast.error("Update failed", message);
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-sky-50 to-blue-50">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />
      </div>
      <div className="sticky top-0 z-20 border-b border-sky-100/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 pt-1">
            <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Resources
            </Link>
            <span className="text-zinc-300">/</span>
            {id && (
              <>
                <Link to={`/resources/${id}`} className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900">#{id}</Link>
                <span className="text-zinc-300">/</span>
              </>
            )}
            <span className="text-sm font-medium text-zinc-700">Edit</span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/50 bg-white/80 p-12 shadow-md backdrop-blur-sm">
            <svg className="h-5 w-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-zinc-500">Loading resource...</span>
          </div>
        ) : pageError || !resource ? (
          <div className="flex items-start gap-4 rounded-2xl border border-rose-200/70 bg-rose-50/80 p-6 shadow-md backdrop-blur-sm">
            <span className="text-xl">⚠️</span>
            <div>
              <h2 className="font-semibold text-rose-800">Failed to load</h2>
              <p className="mt-1 text-sm text-rose-700">{pageError || "Resource not found."}</p>
            </div>
          </div>
        ) : (
          <ResourceForm mode="edit" initialValues={toRequestValues(resource)} onSubmit={handleUpdate} formError={formError} submitLabel="Save Changes" />
        )}
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="min-h-screen bg-linear-to-br from-white via-sky-50 to-blue-50">
      <div className="border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
          <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resources
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-xl">🔒</div>
          <div>
            <h2 className="font-semibold text-amber-800">Admin Access Required</h2>
            <p className="mt-1 text-sm text-amber-700">Only administrators can edit resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}