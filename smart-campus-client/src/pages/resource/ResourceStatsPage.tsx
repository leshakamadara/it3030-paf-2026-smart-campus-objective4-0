import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResourceStatsCards from "../../components/ui/resource/ResourceStatsCards";
import { getMockUser, isAdmin } from "../../lib/mockAuth";
import resourceService from "../../services/resourceService";
import type { ResourceStats } from "../../types/resource";

export default function ResourceStatsPage() {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = getMockUser();

  useEffect(() => {
    if (!isAdmin()) { setLoading(false); return; }

    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await resourceService.getResourceStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Failed to load statistics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Resources
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100 text-xl">
              🔒
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Access Restricted</p>
              <h1 className="mt-1 font-semibold text-amber-900">Admin access required</h1>
              <p className="mt-1 text-sm text-amber-700">
                Only administrators can view analytics. You are signed in as{" "}
                <strong>{currentUser.role}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/resources"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Resources
              </Link>
              <span className="text-zinc-300">/</span>
              <span className="text-sm font-medium text-zinc-900">Analytics Dashboard</span>
            </div>

            <Link
              to="/admin/resources/create"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Resource
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Page intro */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Admin Analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
            Resource Insights
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            A real-time summary of all campus resources — their operational status,
            booking availability, and distribution across types and buildings.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-16 shadow-sm">
            <svg className="h-5 w-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-zinc-500">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <span className="text-xl">⚠️</span>
            <div>
              <h2 className="font-semibold text-red-900">Failed to load</h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : stats ? (
          <ResourceStatsCards stats={stats} />
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-zinc-400">No statistics available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
