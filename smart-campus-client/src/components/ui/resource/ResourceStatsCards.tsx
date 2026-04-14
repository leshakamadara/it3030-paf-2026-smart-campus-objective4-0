import type { ResourceStats } from "../../../types/resource";

interface ResourceStatsCardsProps {
  stats: ResourceStats;
}

// ─── Stat card configuration ─────────────────────────────────────────────────

interface StatConfig {
  label: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  textColor: string;
  progressColor: string;
}

const STAT_CONFIGS: StatConfig[] = [
  {
    label: "Total Resources",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradientFrom: "from-indigo-50",
    gradientTo: "to-white",
    iconBg: "bg-indigo-100 text-indigo-600",
    textColor: "text-indigo-700",
    progressColor: "bg-gradient-to-r from-indigo-400 to-indigo-500",
  },
  {
    label: "Active",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradientFrom: "from-emerald-50",
    gradientTo: "to-white",
    iconBg: "bg-emerald-100 text-emerald-600",
    textColor: "text-emerald-700",
    progressColor: "bg-gradient-to-r from-emerald-400 to-emerald-500",
  },
  {
    label: "Out of Service",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradientFrom: "from-rose-50",
    gradientTo: "to-white",
    iconBg: "bg-rose-100 text-rose-600",
    textColor: "text-rose-700",
    progressColor: "bg-gradient-to-r from-rose-400 to-rose-500",
  },
  {
    label: "Under Maintenance",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradientFrom: "from-amber-50",
    gradientTo: "to-white",
    iconBg: "bg-amber-100 text-amber-600",
    textColor: "text-amber-700",
    progressColor: "bg-gradient-to-r from-amber-400 to-amber-500",
  },
  {
    label: "Bookable",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradientFrom: "from-sky-50",
    gradientTo: "to-white",
    iconBg: "bg-sky-100 text-sky-600",
    textColor: "text-sky-700",
    progressColor: "bg-gradient-to-r from-sky-400 to-sky-500",
  },
  {
    label: "Non-Bookable",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    gradientFrom: "from-slate-50",
    gradientTo: "to-white",
    iconBg: "bg-slate-100 text-slate-600",
    textColor: "text-slate-700",
    progressColor: "bg-gradient-to-r from-slate-400 to-slate-500",
  },
];

const STAT_KEYS: Array<keyof ResourceStats> = [
  "total",
  "active",
  "outOfService",
  "underMaintenance",
  "bookable",
  "nonBookable",
];

// ─── Type & Building Colors ─────────────────────────────────────────────────

const TYPE_COLORS: Record<string, { bar: string; badge: string }> = {
  LECTURE_HALL: {
    bar: "bg-gradient-to-r from-violet-400 to-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  LAB: {
    bar: "bg-gradient-to-r from-blue-400 to-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  MEETING_ROOM: {
    bar: "bg-gradient-to-r from-teal-400 to-teal-500",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
  },
  PROJECTOR: {
    bar: "bg-gradient-to-r from-amber-400 to-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CAMERA: {
    bar: "bg-gradient-to-r from-rose-400 to-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

const BUILDING_COLORS = [
  {
    bar: "bg-gradient-to-r from-indigo-400 to-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    bar: "bg-gradient-to-r from-sky-400 to-sky-500",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    bar: "bg-gradient-to-r from-violet-400 to-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    bar: "bg-gradient-to-r from-amber-400 to-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    bar: "bg-gradient-to-r from-rose-400 to-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
];

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ config, value, total }: { config: StatConfig; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/50 bg-linear-to-br ${config.gradientFrom} ${config.gradientTo} p-5 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
    >
      {/* Decorative floating circle */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/30 blur-2xl transition-all group-hover:bg-white/40" />
      <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-white/20 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.iconBg} shadow-sm`}>
            {config.icon}
          </div>
          <span className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-zinc-600 backdrop-blur-sm">
            {Math.round(pct)}%
          </span>
        </div>

        <div className="mt-4">
          <p className={`text-3xl font-bold tracking-tight ${config.textColor}`}>
            {value.toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-600">{config.label}</p>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/50">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${config.progressColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({
  title,
  icon,
  data,
  total,
  colorMap,
  colorCycle,
}: {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number>;
  total: number;
  colorMap?: Record<string, { bar: string; badge: string }>;
  colorCycle?: Array<{ bar: string; badge: string }>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-white/30 via-transparent to-transparent" />
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-100/30 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-sky-100/20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 border-b border-zinc-200/60 pb-4">
          <div className="text-zinc-500">{icon}</div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">{title}</h3>
          <span className="ml-auto rounded-full bg-zinc-100/80 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur-sm">
            {entries.length} {entries.length === 1 ? "type" : "types"}
          </span>
        </div>

        <div className="mt-5 space-y-5">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">No data available</p>
          ) : (
            entries.map(([key, value], idx) => {
              const pct = total > 0 ? (value / total) * 100 : 0;
              const colors =
                colorMap?.[key] ?? colorCycle?.[idx % (colorCycle?.length ?? 1)] ?? {
                  bar: "bg-gradient-to-r from-zinc-400 to-zinc-500",
                  badge: "bg-zinc-50 text-zinc-600 border-zinc-200",
                };

              return (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700">{key.replaceAll("_", " ")}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-zinc-400">{Math.round(pct)}%</span>
                      <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-sm ${colors.badge}`}>
                        {value}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResourceStatsCards({ stats }: ResourceStatsCardsProps) {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CONFIGS.map((config, i) => {
          const key = STAT_KEYS[i];
          const value = stats[key] as number;
          return <StatCard key={config.label} config={config} value={value} total={stats.total} />;
        })}
      </div>

      {/* Breakdown Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GroupCard
          title="By Resource Type"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
          }
          data={stats.byType}
          total={stats.total}
          colorMap={TYPE_COLORS}
        />
        <GroupCard
          title="By Building"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          data={stats.byBuilding}
          total={stats.total}
          colorCycle={BUILDING_COLORS}
        />
      </div>
    </div>
  );
}