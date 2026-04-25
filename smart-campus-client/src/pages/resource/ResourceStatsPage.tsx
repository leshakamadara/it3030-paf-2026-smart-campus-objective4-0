import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Lock, Loader2, AlertCircle, BarChart3 } from "lucide-react";
import ResourceStatsCards from "../../components/ui/resource/ResourceStatsCards";
import { useAuth } from "@/context/AuthContext";
import resourceService from "../../services/resourceService";
import type { ResourceStats } from "../../types/resource";

export default function ResourceStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isResourceAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!isResourceAdmin) { setLoading(false); return; }
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true); setError("");
        const data = await resourceService.getResourceStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load statistics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, [isResourceAdmin]);

  /* ── Access denied ─────────────────────────────────────────── */
  if (!isResourceAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
        <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />
        <div className="border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <BackLink />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-lg border p-6 flex items-start gap-4"
            style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}>
            <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "#d97706" }} />
            <div>
              <p className="font-semibold text-sm" style={{ color: "#92400e" }}>Admin Access Required</p>
              <p className="text-sm mt-1" style={{ color: "#b45309" }}>
                Only administrators can view analytics. You are signed in as{" "}
                <strong>{user?.role ?? "USER"}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main page ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8f8" }}>
      {/* Brand accent stripe */}
      <div className="h-0.5 w-full" style={{ backgroundColor: "#5e6ad2" }} />

      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b" style={{ backgroundColor: "#ffffff", borderColor: "#e6e6e6" }}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <BackLink />
              <span style={{ color: "#d0d6e0" }}>/</span>
              <span className="font-medium" style={{ color: "#191a1b" }}>Analytics</span>
            </div>

            <Button
              asChild size="sm"
              className="font-semibold shadow-none hover:opacity-90"
              style={{ backgroundColor: "#5e6ad2", color: "#ffffff", borderRadius: "6px" }}
            >
              <Link to="/dashboard/admin/resources/create">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Resource
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Title row */}
        <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#5e6ad2", letterSpacing: "0.6px" }}>
              Admin Analytics
            </p>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: "#5e6ad2" }} />
              <h1 className="text-2xl font-bold" style={{ color: "#191a1b", letterSpacing: "-0.4px" }}>
                Resource Insights
              </h1>
            </div>
            <p className="text-sm mt-1" style={{ color: "#8a8f98" }}>
              Real‑time overview of campus resources — status, availability, and distribution across types and buildings.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#8a8f98" }} />
            <span className="text-sm" style={{ color: "#8a8f98" }}>Loading statistics…</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border p-5 flex items-start gap-3"
            style={{ backgroundColor: "#fff1f2", borderColor: "#fecdd3" }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#f43f5e" }} />
            <div>
              <p className="font-semibold text-sm" style={{ color: "#9f1239" }}>Failed to load</p>
              <p className="text-sm" style={{ color: "#be123c" }}>{error}</p>
            </div>
          </div>
        ) : stats ? (
          <ResourceStatsCards stats={stats} />
        ) : (
          <div className="text-center py-12" style={{ color: "#8a8f98" }}>
            No statistics available.
          </div>
        )}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/dashboard/resources"
      className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600"
      style={{ color: "#43464b" }}
    >
      <ChevronLeft className="h-4 w-4" />
      Resources
    </Link>
  );
}