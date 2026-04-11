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
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await resourceService.getResourceStats();

        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load resource statistics.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isAdmin()) {
      fetchStats();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            to="/resources"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Resources
          </Link>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Access Restricted
            </p>
            <h1 className="mt-2 text-2xl font-bold text-amber-900">
              Admin access required
            </h1>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              Only administrators can view the resource analytics dashboard.
            </p>
            <p className="mt-2 text-xs text-amber-700">
              Current role: {currentUser.role}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/resources"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to Resources
          </Link>

          <Link
            to="/admin/resources/create"
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Add Resource
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Resource Analytics Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Admin Resource Insights
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This dashboard gives administrators a clear summary of the campus
            resource catalogue, including operational status, booking
            availability, and grouped counts by resource type and building.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading dashboard statistics...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        ) : stats ? (
          <ResourceStatsCards stats={stats} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
            No statistics available.
          </div>
        )}
      </div>
    </div>
  );
}