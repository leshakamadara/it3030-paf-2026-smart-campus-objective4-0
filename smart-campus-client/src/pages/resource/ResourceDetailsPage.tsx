import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResourceStatusBadge from "../../components/ui/resource/ResourceStatusBadge";
import resourceService from "../../services/resourceService";
import type { Resource } from "../../types/resource";
import { getMockUser, isAdmin } from "../../lib/mockAuth";

const featureItems = (resource: Resource) => [
  { label: "Projector", enabled: resource.hasProjector },
  { label: "AC", enabled: resource.hasAc },
  { label: "Whiteboard", enabled: resource.hasWhiteboard },
  { label: "WiFi", enabled: resource.hasWifi },
  { label: "Computers", enabled: resource.hasComputers },
  { label: "Windows", enabled: resource.hasWindows },
];

const formatLabel = (value: string) => value.replaceAll("_", " ");

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const fetchResource = async () => {
      if (!id) {
        setError("Resource id is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await resourceService.getResourceById(Number(id));

        if (isMounted) {
          setResource(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load resource.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading resource details...
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <Link
            to="/resources"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Resources
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {error || "Resource not found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/resources"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Resources
          </Link>

{isAdmin() ? (
  <Link
    to={`/admin/resources/edit/${resource.id}`}
    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
  >
    Edit Resource
  </Link>
) : null}
          <ResourceStatusBadge resource={resource} />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {resource.resourceCode}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {resource.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                {resource.description || "No description provided for this resource."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Type:</span>{" "}
                {formatLabel(resource.type)}
              </div>
              <div className="mt-1">
                <span className="font-semibold text-slate-900">Building:</span>{" "}
                {resource.building}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Resource Information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Resource Code" value={resource.resourceCode} />
              <InfoCard label="Type" value={formatLabel(resource.type)} />
              <InfoCard label="Building" value={resource.building} />
              <InfoCard
                label="Capacity"
                value={
                  resource.capacity !== null && resource.capacity !== undefined
                    ? String(resource.capacity)
                    : "Not specified"
                }
              />
              <InfoCard
                label="Bookable"
                value={resource.isBookable ? "Yes" : "No"}
              />
              <InfoCard
                label="Under Maintenance"
                value={resource.isUnderMaintenance ? "Yes" : "No"}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Availability & Dates
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoCard label="Available From" value={resource.availableFrom} />
              <InfoCard label="Available To" value={resource.availableTo} />
              <InfoCard label="Created At" value={resource.createdAt} />
              <InfoCard label="Updated At" value={resource.updatedAt} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Features & Facilities
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems(resource).map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  item.enabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                {item.label}: {item.enabled ? "Available" : "Not Available"}
              </div>
            ))}
          </div>
        </div>

        {resource.imageUrl && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Image</h2>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="h-72 w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900 wrap-break-word">
        {value}
      </p>
    </div>
  );
}