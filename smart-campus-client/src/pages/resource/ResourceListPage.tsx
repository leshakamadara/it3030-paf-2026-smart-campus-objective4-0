import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BarChart3, ChevronLeft, ChevronRight, X, Loader2, Info } from "lucide-react";
import ResourceFilters from "../../components/ui/resource/ResourceFilters";
import ResourceTable from "../../components/ui/resource/ResourceTable";
import resourceService from "../../services/resourceService";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const resultsRef = useRef<HTMLDivElement>(null);
  const isResourceAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const userRoleLabel = user?.role ?? "USER";

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
    return () => {
      isMounted = false;
    };
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
    <div className="min-h-screen bg-background">
      {/* Animated gradient border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x" />

      {/* Page header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Facilities Catalogue
              </p>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Campus Resources
              </h1>
              <p className="text-sm text-muted-foreground">
                All campus facilities and assets.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <Badge variant="outline" className="animate-pulse">
                {userRoleLabel}
              </Badge>
              {isResourceAdmin && (
                <>
                  <Button asChild className="transition-all hover:scale-105 hover:shadow-md">
                    <Link to="/dashboard/admin/resources/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="transition-all hover:scale-105 hover:shadow-md"
                  >
                    <Link to="/dashboard/admin/resources/stats">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Body */}
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
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name..."
                className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 transition-all hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setSearchQuery("");
                    searchRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>

            {/* Search hint */}
            {debouncedSearch && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md"
              >
                <Info className="h-3.5 w-3.5 text-primary" />
                <span>
                  Showing resources whose name contains{" "}
                  <span className="font-semibold text-primary">"{debouncedSearch}"</span>
                </span>
              </motion.div>
            )}

            {/* Ultra-compact results header */}
<div className="flex items-center justify-between py-1 px-1 text-muted-foreground border-b border-border/30">
  <span className="text-[12px] font-medium">Results</span>
  <div className="flex items-center gap-2">
    {pageData && pageData.totalPages > 1 && (
      <span className="text-[12px] tabular-nums">
        Pg {(pageData.number ?? 0) + 1}/{pageData.totalPages}
      </span>
    )}
    <span className="text-[12px] tabular-nums">
      {loading
        ? "…"
        : pageData
        ? `${pageData.totalElements} item${pageData.totalElements !== 1 ? "s" : ""}`
        : "—"}
    </span>
  </div>
</div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="py-6 text-center text-destructive">
                  {error}
                </CardContent>
              </Card>
            ) : (
              <>
                <ResourceTable resources={pageData?.content ?? []} />

                {/* Pagination */}
                {pageData && pageData.totalElements > 0 && pageData.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center justify-between py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={pageData.first}
                          className="transition-all hover:scale-105 disabled:hover:scale-100"
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(pageData.totalPages, 7) },
                            (_, i) => {
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
                                const start = Math.max(
                                  1,
                                  Math.min(currentPage - 1, totalPages - 5)
                                );
                                page = start + (i - 1);
                              }

                              if (page === null) {
                                return (
                                  <span key={i} className="px-1 text-muted-foreground">
                                    …
                                  </span>
                                );
                              }

                              return (
                                <Button
                                  key={i}
                                  variant={page === currentPage ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 w-8 transition-all hover:scale-110"
                                  onClick={() => setFilters((p) => ({ ...p, page }))}
                                >
                                  {page! + 1}
                                </Button>
                              );
                            }
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={pageData.last}
                          className="transition-all hover:scale-105 disabled:hover:scale-100"
                        >
                          Next
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
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