import { Link } from "react-router-dom";
import type { Resource } from "../../../types/resource";
import ResourceStatusBadge from "./ResourceStatusBadge";

interface ResourceTableProps {
  resources: Resource[];
}

export default function ResourceTable({ resources }: ResourceTableProps) {
  if (resources.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          No resources found
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Try changing the filters and search values.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3 font-semibold">Resource</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Building</th>
              <th className="px-4 py-3 font-semibold">Capacity</th>
              <th className="px-4 py-3 font-semibold">Bookable</th>
              <th className="px-4 py-3 font-semibold">Availability</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((resource) => (
              <tr
                key={resource.id}
                className="border-t border-slate-100 text-slate-700"
              >
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900">
                    {resource.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {resource.resourceCode}
                  </div>
                </td>

                <td className="px-4 py-4">
                  {resource.type.replaceAll("_", " ")}
                </td>

                <td className="px-4 py-4">{resource.building}</td>

                <td className="px-4 py-4">
                  {resource.capacity ?? "Not specified"}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      resource.isBookable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {resource.isBookable ? "Yes" : "No"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {resource.availableFrom} - {resource.availableTo}
                </td>

                <td className="px-4 py-4">
                  <ResourceStatusBadge resource={resource} />
                </td>

                <td className="px-4 py-4">
                  <Link
                    to={`/resources/${resource.id}`}
                    className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}