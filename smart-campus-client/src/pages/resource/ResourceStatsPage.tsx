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
    if (!isAdmin()) {
      setLoading(false);
      return;
    }

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
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white via-sky-50 to-blue-50">
        <div className="border-b border-white/50 bg-white/70 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Resources
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-100/80 shadow-sm">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Access Restricted</p>
              <h1 className="mt-1 font-semibold text-amber-800">Admin access required</h1>
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
    <div className="min-h-screen bg-linear-to-br from-white via-sky-50 to-blue-50">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />
      </div>

      {/* Page Header */}
      <div className="sticky top-0 z-20 border-b border-sky-100/50 bg-white/80 backdrop-blur-xl">
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
              <span className="text-sm font-medium text-zinc-700">Analytics</span>
            </div>

            <Link
              to="/admin/resources/create"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Resource
            </Link>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Admin Analytics</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-800">Resource Insights</h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-500">
              Real‑time overview of campus resources — status, availability, and distribution across types and buildings.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-16 shadow-lg backdrop-blur-sm">
            <svg className="h-6 w-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-zinc-600">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-4 rounded-2xl border border-rose-200/70 bg-rose-50/70 p-6 shadow-lg backdrop-blur-sm">
            <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h2 className="font-semibold text-rose-800">Failed to load</h2>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
            </div>
          </div>
        ) : stats ? (
          <ResourceStatsCards stats={stats} />
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300/70 bg-white/70 p-16 text-center shadow-lg backdrop-blur-sm">
            <p className="text-sm text-zinc-400">No statistics available.</p>
          </div>
        )}
      </div>
    </div>
  );
}