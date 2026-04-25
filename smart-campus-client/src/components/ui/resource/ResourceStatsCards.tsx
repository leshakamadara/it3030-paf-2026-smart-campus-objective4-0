import { motion } from "framer-motion";
import { Package, CheckCircle, AlertCircle, Wrench, Calendar, CalendarX, MapPin } from "lucide-react";
import type { ResourceStats } from "../../../types/resource";

interface ResourceStatsCardsProps {
  stats: ResourceStats;
}

interface StatConfig {
  label: string;
  icon: React.ReactNode;
  bg: string;
  accent: string;
  textColor: string;
}

const STAT_CONFIGS: StatConfig[] = [
  { label: "Total Resources", icon: <Package className="h-5 w-5" />, bg: "#ede9ff", accent: "#5e6ad2", textColor: "#5b21b6" },
  { label: "Active", icon: <CheckCircle className="h-5 w-5" />, bg: "#f0fdf4", accent: "#10b981", textColor: "#166534" },
  { label: "Out of Service", icon: <AlertCircle className="h-5 w-5" />, bg: "#fff1f2", accent: "#f43f5e", textColor: "#9f1239" },
  { label: "Under Maintenance", icon: <Wrench className="h-5 w-5" />, bg: "#fffbeb", accent: "#f59e0b", textColor: "#92400e" },
  { label: "Bookable", icon: <Calendar className="h-5 w-5" />, bg: "#e0f2fe", accent: "#0ea5e9", textColor: "#075985" },
  { label: "Non-Bookable", icon: <CalendarX className="h-5 w-5" />, bg: "#f3f4f6", accent: "#9ca3af", textColor: "#4b5563" },
];

const STAT_KEYS: Array<keyof ResourceStats> = [
  "total", "active", "outOfService", "underMaintenance", "bookable", "nonBookable",
];

const TYPE_COLORS: Record<string, { bar: string; badgeBg: string; badgeText: string }> = {
  LECTURE_HALL: { bar: "#8b5cf6", badgeBg: "#ede9ff", badgeText: "#6d28d9" },
  LAB: { bar: "#3b82f6", badgeBg: "#dbeafe", badgeText: "#1d4ed8" },
  MEETING_ROOM: { bar: "#14b8a6", badgeBg: "#ccfbf1", badgeText: "#0f766e" },
  PROJECTOR: { bar: "#f59e0b", badgeBg: "#fef3c7", badgeText: "#b45309" },
  CAMERA: { bar: "#f43f5e", badgeBg: "#ffe4e6", badgeText: "#be123c" },
};

const BUILDING_COLORS = [
  { bar: "#5e6ad2", badgeBg: "#ede9ff", badgeText: "#5b21b6" },
  { bar: "#0ea5e9", badgeBg: "#e0f2fe", badgeText: "#0369a1" },
  { bar: "#10b981", badgeBg: "#d1fae5", badgeText: "#047857" },
  { bar: "#8b5cf6", badgeBg: "#ede9ff", badgeText: "#6d28d9" },
  { bar: "#f59e0b", badgeBg: "#fef3c7", badgeText: "#b45309" },
  { bar: "#f43f5e", badgeBg: "#ffe4e6", badgeText: "#be123c" },
];

function StatCard({ config, value, total }: { config: StatConfig; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <div className="rounded-lg p-5 flex flex-col h-full shadow-sm"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}>
        
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: config.bg, color: config.accent }}>
            {config.icon}
          </div>
          <div className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: "#f3f4f5", color: "#43464b" }}>
            {Math.round(pct)}%
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-3xl font-bold mb-1" style={{ color: config.textColor }}>
            {value.toLocaleString()}
          </p>
          <p className="text-sm font-medium" style={{ color: "#8a8f98" }}>{config.label}</p>
          
          <div className="w-full h-1.5 mt-3 rounded-full overflow-hidden" style={{ backgroundColor: "#f3f4f5" }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${pct}%`, backgroundColor: config.accent }} />
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function GroupCard({
  title, icon, data, total, colorMap, colorCycle,
}: {
  title: string; icon: React.ReactNode; data: Record<string, number>; total: number;
  colorMap?: Record<string, { bar: string; badgeBg: string; badgeText: string }>;
  colorCycle?: Array<{ bar: string; badgeBg: string; badgeText: string }>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-lg flex flex-col shadow-sm"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e6e6e6" }}>
      
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#f3f4f5" }}>
        <div className="flex items-center gap-2">
          <span style={{ color: "#8a8f98" }}>{icon}</span>
          <h3 className="font-semibold text-base" style={{ color: "#191a1b" }}>{title}</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
          style={{ backgroundColor: "#f3f4f5", color: "#43464b" }}>
          {entries.length} items
        </span>
      </div>

      <div className="p-5 space-y-5">
        {entries.length === 0 ? (
          <p className="text-center py-4 text-sm" style={{ color: "#8a8f98" }}>No data available</p>
        ) : (
          entries.map(([key, value], idx) => {
            const pct = total > 0 ? (value / total) * 100 : 0;
            const colors = colorMap?.[key] ?? colorCycle?.[idx % (colorCycle?.length ?? 1)] ?? {
              bar: "#9ca3af", badgeBg: "#f3f4f6", badgeText: "#4b5563"
            };

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: "#43464b" }}>
                    {key.replaceAll("_", " ")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium" style={{ color: "#8a8f98" }}>{Math.round(pct)}%</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}>
                      {value}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f3f4f5" }}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: colors.bar }} />
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CONFIGS.map((config, i) => {
          const key = STAT_KEYS[i];
          const value = stats[key] as number;
          return <StatCard key={config.label} config={config} value={value} total={stats.total} />;
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GroupCard
          title="By Resource Type"
          icon={<Package className="h-5 w-5" />}
          data={stats.byType}
          total={stats.total}
          colorMap={TYPE_COLORS}
        />
        <GroupCard
          title="By Building"
          icon={<MapPin className="h-5 w-5" />}
          data={stats.byBuilding}
          total={stats.total}
          colorCycle={BUILDING_COLORS}
        />
      </div>
    </div>
  );
}