import type { ResourceStats } from "../../../types/resource";

interface ResourceStatsCardsProps {
  stats: ResourceStats;
}

const TYPE_ICONS: Record<string, string> = {
  LECTURE_HALL: "🏛️",
  LAB: "🖥️",
  MEETING_ROOM: "🤝",
  PROJECTOR: "📽️",
  CAMERA: "📷",
};

// Explicit colour pairs — Tailwind v4 purges dynamically generated class names,
// so we must never use string manipulation like color.replace("text-","bg-").
interface ColourPair {
  text: string;
  bar: string;
  badge: string;
}

const COLOURS: Record<string, ColourPair> = {
  zinc:    { text: "text-zinc-500",   bar: "bg-zinc-500",   badge: "bg-zinc-100 text-zinc-600" },
  emerald: { text: "text-emerald-600", bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  red:     { text: "text-red-600",    bar: "bg-red-500",    badge: "bg-red-50 text-red-700" },
  amber:   { text: "text-amber-600",  bar: "bg-amber-500",  badge: "bg-amber-50 text-amber-700" },
  blue:    { text: "text-blue-600",   bar: "bg-blue-500",   badge: "bg-blue-50 text-blue-700" },
  slate:   { text: "text-slate-500",  bar: "bg-slate-400",  badge: "bg-slate-100 text-slate-600" },
};

function StatCard({
  label,
  value,
  total,
  icon,
  colour,
}: {
  label: string;
  value: number;
  total?: number;
  icon: string;
  colour: ColourPair;
}) {
  const pct = total && total > 0 ? Math.round((value / total) * 100) : null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {pct !== null && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${colour.badge}`}>
            {pct}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-zinc-900">{value.toLocaleString()}</p>
        <p className="mt-1 text-sm text-zinc-500">{label}</p>
      </div>
      {pct !== null && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${colour.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function GroupCard({
  title,
  icon,
  data,
  total,
}: {
  title: string;
  icon: string;
  data: Record<string, number>;
  total: number;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h2 className="font-semibold text-zinc-900">{title}</h2>
        <span className="ml-auto text-xs text-zinc-400">{entries.length} entries</span>
      </div>

      <div className="mt-5 space-y-4">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">No data available</p>
        ) : (
          entries.map(([key, value]) => {
            const pct = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                    {TYPE_ICONS[key] && <span>{TYPE_ICONS[key]}</span>}
                    {key.replaceAll("_", " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{Math.round(pct)}%</span>
                    <span className="min-w-[2rem] rounded-full bg-zinc-900 px-2 py-0.5 text-center text-xs font-bold text-white">
                      {value}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-1.5 rounded-full bg-zinc-900 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ResourceStatsCards({ stats }: ResourceStatsCardsProps) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Resources"
          value={stats.total}
          icon="📦"
          colour={COLOURS.zinc}
        />
        <StatCard
          label="Active"
          value={stats.active}
          total={stats.total}
          icon="✅"
          colour={COLOURS.emerald}
        />
        <StatCard
          label="Out of Service"
          value={stats.outOfService}
          total={stats.total}
          icon="🔴"
          colour={COLOURS.red}
        />
        <StatCard
          label="Under Maintenance"
          value={stats.underMaintenance}
          total={stats.total}
          icon="🔧"
          colour={COLOURS.amber}
        />
        <StatCard
          label="Bookable"
          value={stats.bookable}
          total={stats.total}
          icon="📅"
          colour={COLOURS.blue}
        />
        <StatCard
          label="Non-bookable"
          value={stats.nonBookable}
          total={stats.total}
          icon="🚫"
          colour={COLOURS.slate}
        />
      </div>

      {/* Group breakdown */}
      <div className="grid gap-6 xl:grid-cols-2">
        <GroupCard
          title="By Resource Type"
          icon="🏷️"
          data={stats.byType}
          total={stats.total}
        />
        <GroupCard
          title="By Building"
          icon="🏢"
          data={stats.byBuilding}
          total={stats.total}
        />
      </div>
    </div>
  );
}
