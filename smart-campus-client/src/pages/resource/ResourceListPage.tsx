import { useEffect, useState } from "react";
import ResourceFilters from "../../components/ui/resource/ResourceFilters";
import ResourceTable from "../../components/ui/resource/ResourceTable";
//import { getMockUser } from "../../lib/mockAuth";
import resourceService from "../../services/resourceService";
import { Link } from "react-router-dom";
import { getMockUser, isAdmin } from "../../lib/mockAuth";


import type {
  PaginatedResponse,
  Resource,
  ResourceFilters as ResourceFilterValues,
} from "../../types/resource";

const defaultFilters: ResourceFilterValues = {
  page: 0,
  size: 10,
  sortBy: "id",
  direction: "asc",
};

export default function ResourceListPage() {
  const [filters, setFilters] = useState<ResourceFilterValues>(defaultFilters);
  const [pageData, setPageData] = useState<PaginatedResponse<Resource> | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const currentUser = getMockUser();

  useEffect(() => {
    let isMounted = true;

    const fetchResources = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await resourceService.getResources(filters);

        if (isMounted) {
          setPageData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load resources.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResources();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleApplyFilters = (newFilters: ResourceFilterValues) => {
    setFilters({
      ...newFilters,
      page: 0,
    });
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handlePreviousPage = () => {
    if (!pageData?.first) {
      setFilters((prev) => ({
        ...prev,
        page: Math.max((prev.page ?? 0) - 1, 0),
      }));
    }
  };

  const handleNextPage = () => {
    if (!pageData?.last) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page ?? 0) + 1,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Facilities Catalogue
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Browse Campus Resources
        {isAdmin() ? (
  <div className="flex flex-wrap gap-3">
    <Link
      to="/admin/resources/create"
      className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
    >
      Add Resource
    </Link>

    <Link
      to="/admin/resources/stats"
      className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
    >
      View Dashboard
    </Link>
  </div>
) : null}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Search, filter, and explore facilities and assets available in the
              smart campus system.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Viewing as{" "}
            <span className="font-semibold text-slate-900">
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <ResourceFilters
            initialFilters={filters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Resource Results
                  </h2>
                  <p className="text-sm text-slate-500">
                    {pageData
                      ? `Showing ${pageData.content.length} of ${pageData.totalElements} resources`
                      : "Loading resources..."}
                  </p>
                </div>

                {pageData && (
                  <div className="text-sm text-slate-500">
                    Page {(pageData.number ?? 0) + 1} of{" "}
                    {Math.max(pageData.totalPages, 1)}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                Loading resources...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            ) : (
              <>
                <ResourceTable resources={pageData?.content ?? []} />

                {pageData && pageData.totalElements > 0 && (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={pageData.first}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-slate-600">
                      Page {pageData.number + 1} /{" "}
                      {Math.max(pageData.totalPages, 1)}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={pageData.last}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}