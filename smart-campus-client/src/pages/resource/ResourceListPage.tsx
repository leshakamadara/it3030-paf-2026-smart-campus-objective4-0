import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ResourceFilters from "../../components/ui/resource/ResourceFilters";
import ResourceTable from "../../components/ui/resource/ResourceTable";
import resourceService from "../../services/resourceService";
import { getMockUser, isAdmin } from "../../lib/mockAuth";
import type {
  PaginatedResponse,
  Resource,
  ResourceFilters as ResourceFilterValues,
} from "../../types/resource";

const DEFAULT_FILTERS: ResourceFilterValues = {
  page: 0,
  size: 10,
  sortBy: "id",
  direction: "asc",
};

export default function ResourceListPage() {
  const [filters, setFilters] = useState<ResourceFilterValues>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageData, setPageData] = useState<PaginatedResponse<Resource> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const currentUser = getMockUser();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch on filter/search change
  useEffect(() => {
    let isMounted = true;

    const fetchResources = async () => {
      try {
        setLoading(true);
        setError("");
        const activeFilters: ResourceFilterValues = {
          ...filters,
          name: debouncedSearch.trim() || undefined,
          ...(debouncedSearch.trim() && { sortBy: "name", direction: "asc" }),
          page: debouncedSearch !== "" ? 0 : filters.page,
        };
        const data = await resourceService.getResources(activeFilters);
        if (isMounted) {
          setPageData(data);
          scrollToTop();
        }
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Failed to load resources.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResources();
    return () => { isMounted = false; };
  }, [filters, debouncedSearch]);

  const handleApplyFilters = (newFilters: ResourceFilterValues) => {
    setFilters({ ...newFilters, page: 0 });
    scrollToTop();
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setDebouncedSearch("");
    scrollToTop();
  };

  const handlePreviousPage = () => {
    if (!pageData?.first)
      setFilters((prev) => ({ ...prev, page: Math.max((prev.page ?? 0) - 1, 0) }));
  };

  const handleNextPage = () => {
    if (!pageData?.last)
      setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-white">
        {/* Rainbow accent strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500" />

        {/* Subtle gradient backdrop */}
        <div className="absolute inset-0 bg-linear-to-br from-white via-indigo-50/30 to-violet-50/20" />

        {/* Decorative blobs */}
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-indigo-200/20 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                Facilities Catalogue
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
                Campus Resources
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                All campus facilities and assets.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {/* Role badge */}
              <span className={`hidden rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex ${
                currentUser.role === "ADMIN"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600"
              }`}>
                {currentUser.role}
              </span>

              {isAdmin() && (
                <>
                  <Link
                    to="/admin/resources/create"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Resource
                  </Link>
                  <Link
                    to="/admin/resources/stats"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                  >
                    <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Filters sidebar */}
          <ResourceFilters
            initialFilters={filters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Results column */}
          <div ref={resultsRef} className="space-y-4">
            {/* Search bar with FIXED icon visibility */}
<div className="relative">
  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
    {loading && debouncedSearch ? (
      <svg
        className="h-5 w-5 animate-spin text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    ) : (
      <svg
        className="h-5 w-5 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    )}
  </div>
  <input
    ref={searchRef}
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search Name..."
    className="w-full rounded-2xl border border-white/50 bg-white/80 py-3.5 pl-11 pr-10 text-sm text-zinc-800 shadow-md backdrop-blur-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
  />
  {searchQuery && (
    <button
      type="button"
      onClick={() => {
        setSearchQuery("");
        searchRef.current?.focus();
      }}
      className="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-zinc-400 transition hover:text-zinc-600"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  )}
</div>
            {/* Search active indicator */}
            {debouncedSearch && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Searching for{" "}
                <span className="font-semibold text-indigo-700">"{debouncedSearch}"</span>
                <span className="text-zinc-400">— A → Z order</span>
              </div>
            )}

            {/* Results header */}
            <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900">Results</h2>
                <p className="text-sm text-zinc-500">
                  {loading
                    ? "Loading..."
                    : pageData
                    ? `${pageData.content.length} of ${pageData.totalElements} resource${pageData.totalElements !== 1 ? "s" : ""}`
                    : "No data"}
                </p>
              </div>
              {pageData && pageData.totalPages > 1 && (
                <p className="text-sm text-zinc-500">
                  Page {(pageData.number ?? 0) + 1} / {pageData.totalPages}
                </p>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-16 shadow-sm">
                <svg className="h-5 w-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-zinc-500">Loading resources...</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : (
              <>
                <ResourceTable resources={pageData?.content ?? []} />

                {/* Pagination */}
                {pageData && pageData.totalElements > 0 && pageData.totalPages > 1 && (
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <button
                      type="button"
                      onClick={handlePreviousPage}
                      disabled={pageData.first}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pageData.totalPages, 7) }, (_, i) => {
                        const currentPage = pageData.number;
                        const totalPages = pageData.totalPages;
                        let page: number | null;

                        if (totalPages <= 7) {
                          page = i;
                        } else if (i === 0) {
                          page = 0;
                        } else if (i === 6) {
                          page = totalPages - 1;
                        } else if (i === 1 && currentPage > 3) {
                          page = null;
                        } else if (i === 5 && currentPage < totalPages - 4) {
                          page = null;
                        } else {
                          const start = Math.max(1, Math.min(currentPage - 1, totalPages - 5));
                          page = start + (i - 1);
                        }

                        if (page === null) {
                          return <span key={i} className="px-1 text-zinc-400">…</span>;
                        }

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFilters((p) => ({ ...p, page }))}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                              page === currentPage
                                ? "bg-indigo-600 text-white"
                                : "text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            {page! + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={pageData.last}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
