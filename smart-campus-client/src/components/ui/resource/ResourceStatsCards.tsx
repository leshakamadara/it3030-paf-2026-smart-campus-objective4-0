import type { ResourceStats } from "../../../types/resource";

interface ResourceStatsCardsProps {
  stats: ResourceStats;
}

interface StatCardProps {
  label: string;
  value: number;
  helperText?: string;
}

function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>
      {helperText ? (
        <p className="mt-2 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      No {label.toLowerCase()} data available.
    </div>
  );
}

function GroupList({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

      <div className="mt-5 space-y-3">
        {entries.length === 0 ? (
          <EmptyState label={title} />
        ) : (
          entries.map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">
                {key.replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {value}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ResourceStatsCards({
  stats,
}: ResourceStatsCardsProps) {
  const activePercentage =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  const maintenancePercentage =
    stats.total > 0 ? Math.round((stats.underMaintenance / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Resources"
          value={stats.total}
          helperText="All resources currently stored in the catalogue"
        />
        <StatCard
          label="Active Resources"
          value={stats.active}
          helperText={`${activePercentage}% of all resources are active`}
        />
        <StatCard
          label="Out of Service"
          value={stats.outOfService}
          helperText="Resources currently unavailable due to service status"
        />
        <StatCard
          label="Under Maintenance"
          value={stats.underMaintenance}
          helperText={`${maintenancePercentage}% of resources are under maintenance`}
        />
        <StatCard
          label="Bookable Resources"
          value={stats.bookable}
          helperText="Resources currently available for booking"
        />
        <StatCard
          label="Non-bookable Resources"
          value={stats.nonBookable}
          helperText="Resources in the catalogue but not bookable"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GroupList title="Resources by Type" data={stats.byType} />
        <GroupList title="Resources by Building" data={stats.byBuilding} />
      </div>
    </div>
  );
}