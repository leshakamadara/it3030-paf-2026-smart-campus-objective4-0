import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, BarChart3, ChevronLeft, ChevronRight, X, Loader2, Info } from "lucide-react";
import ResourceFilters from "../../components/ui/resource/ResourceFilters";
import ResourceTable from "../../components/ui/resource/ResourceTable";
import resourceService from "../../services/resourceService";
import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();
  const [filters, setFilters] = useState<ResourceFilterValues>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageData, setPageData] = useState<PaginatedResponse<Resource> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const isResourceAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        if (isMounted) { setPageData(data); scrollToTop(); }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load resources.");
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
    if (!pageData?.last) setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      {/* Brand accent stripe */}
      <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />

      {/* Page header */}
      <div className="border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "#5e6ad2", letterSpacing: "0.6px" }}>
                Facilities Catalogue
              </p>
              <h1 className="text-2xl font-bold" style={{ color: "#191a1b", letterSpacing: "-0.4px" }}>
                Campus Resources
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#8a8f98" }}>
                Browse and filter all campus facilities and assets.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="flex items-center gap-2"
            >
              {/* Role pill */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#ede9ff", color: "#5e6ad2", border: "1px solid #c4b5fd" }}>
                {user?.role ?? "USER"}
              </span>

              {isResourceAdmin && (
                <>
                  <Button asChild size="sm"
                    className="text-white font-semibold shadow-none hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#5e6ad2", borderRadius: "6px" }}>
                    <Link to="/dashboard/admin/resources/create">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Resource
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="sm"
                    className="font-medium transition-colors"
                    style={{ borderColor: "#d0d6e0", color: "#43464b", borderRadius: "6px" }}>
                    <Link to="/dashboard/admin/resources/stats">
                      <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                      Stats
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[288px_minmax(0,1fr)]">
          {/* Filters sidebar */}
          <ResourceFilters
            initialFilters={filters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Results column */}
          <div className="space-y-4">
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "#8a8f98" }} />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name…"
                className="pl-10 pr-10 transition-all duration-200"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#d0d6e0",
                  color: "#191a1b",
                  borderRadius: "6px",
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  style={{ color: "#8a8f98" }}
                  onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </motion.div>

            {/* Search hint */}
            {debouncedSearch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-md"
                style={{ backgroundColor: "#ede9ff", color: "#5e6ad2", border: "1px solid #c4b5fd" }}
              >
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Results matching <strong>"{debouncedSearch}"</strong>
                </span>
              </motion.div>
            )}

            {/* Results meta bar */}
            <div className="flex items-center justify-between px-1 py-1 text-xs border-b"
              style={{ borderColor: "#e6e6e6", color: "#8a8f98" }}>
              <span className="font-medium" style={{ color: "#43464b" }}>Results</span>
              <div className="flex items-center gap-3 tabular-nums">
                {pageData && pageData.totalPages > 1 && (
                  <span>Page {(pageData.number ?? 0) + 1} / {pageData.totalPages}</span>
                )}
                <span>
                  {loading ? "…" : pageData
                    ? `${pageData.totalElements} item${pageData.totalElements !== 1 ? "s" : ""}`
                    : "—"}
                </span>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#8a8f98" }} />
              </div>
            ) : error ? (
              <div className="rounded-lg border px-5 py-4 flex items-center gap-3"
                style={{ backgroundColor: "#fff1f1", borderColor: "#fca5a5", color: "#991b1b" }}>
                <Info className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              <>
                <ResourceTable resources={pageData?.content ?? []} />

                {/* Pagination */}
                {pageData && pageData.totalElements > 0 && pageData.totalPages > 1 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="rounded-lg border px-4 py-3 flex items-center justify-between"
                      style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
                      <Button
                        variant="outline" size="sm"
                        onClick={handlePreviousPage}
                        disabled={pageData.first}
                        style={{ borderColor: "#d0d6e0", color: "#43464b", borderRadius: "6px" }}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(pageData.totalPages, 7) }, (_, i) => {
                          const currentPage = pageData.number;
                          const totalPages = pageData.totalPages;
                          let page: number | null;
                          if (totalPages <= 7) { page = i; }
                          else if (i === 0) { page = 0; }
                          else if (i === 6) { page = totalPages - 1; }
                          else if (i === 1 && currentPage > 3) { page = null; }
                          else if (i === 5 && currentPage < totalPages - 4) { page = null; }
                          else {
                            const start = Math.max(1, Math.min(currentPage - 1, totalPages - 5));
                            page = start + (i - 1);
                          }

                          if (page === null) {
                            return <span key={i} className="px-1 text-xs" style={{ color: "#8a8f98" }}>…</span>;
                          }

                          const isActive = page === currentPage;
                          return (
                            <button
                              key={i}
                              onClick={() => setFilters((p) => ({ ...p, page }))}
                              className="h-8 w-8 rounded-md text-xs font-medium transition-colors"
                              style={{
                                backgroundColor: isActive ? "#5e6ad2" : "transparent",
                                color: isActive ? "#ffffff" : "#43464b",
                                border: isActive ? "none" : "1px solid #d0d6e0",
                              }}
                            >
                              {page! + 1}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline" size="sm"
                        onClick={handleNextPage}
                        disabled={pageData.last}
                        style={{ borderColor: "#d0d6e0", color: "#43464b", borderRadius: "6px" }}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}