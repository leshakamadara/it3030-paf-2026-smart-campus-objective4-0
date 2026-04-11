import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ResourceForm from "../../components/ui/resource/ResourceForm";
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

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  if (!isAdmin()) {
    return (
      <AccessDeniedCard
        title="Admin access required"
        message="Only administrators can edit or delete resources."
      />
    );
  }

  useEffect(() => {
    let isMounted = true;

    const fetchResource = async () => {
      if (!id) {
        setPageError("Resource id is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageError("");
        const data = await resourceService.getResourceById(Number(id));

        if (isMounted) {
          setResource(data);
        }
      } catch (error) {
        if (isMounted) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Failed to load resource.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResource();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpdate = async (values: ResourceRequest) => {
    if (!id) return;

    try {
      setFormError("");
      const updatedResource = await resourceService.updateResource(Number(id), values);
      navigate(`/resources/${updatedResource.id}`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update resource. Please try again.",
      );
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setFormError("");
      await resourceService.deleteResource(Number(id));
      navigate("/resources");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to delete resource. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/resources"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Resources
          </Link>

          {id ? (
            <Link
              to={`/resources/${id}`}
              className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              View Details
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading resource details...
          </div>
        ) : pageError || !resource ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {pageError || "Resource not found."}
          </div>
        ) : (
          <ResourceForm
            mode="edit"
            initialValues={toRequestValues(resource)}
            onSubmit={handleUpdate}
            onDelete={handleDelete}
            formError={formError}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
}

interface AccessDeniedCardProps {
  title: string;
  message: string;
}

function AccessDeniedCard({ title, message }: AccessDeniedCardProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/resources"
          className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to Resources
        </Link>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-amber-800">{title}</h1>
          <p className="mt-2 text-sm text-amber-700">{message}</p>
        </div>
      </div>
    </div>
  );
}