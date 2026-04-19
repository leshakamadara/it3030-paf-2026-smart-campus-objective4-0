import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, CheckCircle, AlertCircle, Wrench, Calendar, CalendarX, MapPin } from "lucide-react";
import type { ResourceStats } from "../../../types/resource";

interface ResourceStatsCardsProps {
  stats: ResourceStats;
}

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
    icon: <Package className="h-5 w-5" />,
    gradientFrom: "from-primary/10",
    gradientTo: "to-background",
    iconBg: "bg-primary/10 text-primary",
    textColor: "text-primary",
    progressColor: "bg-primary",
  },
  {
    label: "Active",
    icon: <CheckCircle className="h-5 w-5" />,
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-background",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    textColor: "text-emerald-700",
    progressColor: "bg-emerald-500",
  },
  {
    label: "Out of Service",
    icon: <AlertCircle className="h-5 w-5" />,
    gradientFrom: "from-destructive/10",
    gradientTo: "to-background",
    iconBg: "bg-destructive/10 text-destructive",
    textColor: "text-destructive",
    progressColor: "bg-destructive",
  },
  {
    label: "Under Maintenance",
    icon: <Wrench className="h-5 w-5" />,
    gradientFrom: "from-amber-500/10",
    gradientTo: "to-background",
    iconBg: "bg-amber-500/10 text-amber-600",
    textColor: "text-amber-700",
    progressColor: "bg-amber-500",
  },
  {
    label: "Bookable",
    icon: <Calendar className="h-5 w-5" />,
    gradientFrom: "from-sky-500/10",
    gradientTo: "to-background",
    iconBg: "bg-sky-500/10 text-sky-600",
    textColor: "text-sky-700",
    progressColor: "bg-sky-500",
  },
  {
    label: "Non-Bookable",
    icon: <CalendarX className="h-5 w-5" />,
    gradientFrom: "from-muted",
    gradientTo: "to-background",
    iconBg: "bg-muted text-muted-foreground",
    textColor: "text-muted-foreground",
    progressColor: "bg-muted-foreground",
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

const TYPE_COLORS: Record<string, { bar: string; badge: string }> = {
  LECTURE_HALL: {
    bar: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-700 border-violet-200",
  },
  LAB: {
    bar: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  MEETING_ROOM: {
    bar: "bg-teal-500",
    badge: "bg-teal-500/10 text-teal-700 border-teal-200",
  },
  PROJECTOR: {
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  CAMERA: {
    bar: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-700 border-rose-200",
  },
};

const BUILDING_COLORS = [
  { bar: "bg-primary", badge: "bg-primary/10 text-primary border-primary/20" },
  { bar: "bg-sky-500", badge: "bg-sky-500/10 text-sky-700 border-sky-200" },
  { bar: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  { bar: "bg-violet-500", badge: "bg-violet-500/10 text-violet-700 border-violet-200" },
  { bar: "bg-amber-500", badge: "bg-amber-500/10 text-amber-700 border-amber-200" },
  { bar: "bg-rose-500", badge: "bg-rose-500/10 text-rose-700 border-rose-200" },
];

function StatCard({ config, value, total }: { config: StatConfig; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} shadow-sm transition-all hover:shadow-lg`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className={`rounded-lg p-2 ${config.iconBg} transition-transform group-hover:scale-110`}>
              {config.icon}
            </div>
            <Badge variant="secondary" className="animate-pulse">
              {Math.round(pct)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${config.textColor}`}>{value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{config.label}</p>
          <Progress
            value={pct}
            className={`mt-3 h-1.5 ${config.progressColor} transition-all duration-700 ease-out`}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">{icon}</div>
            <CardTitle className="text-base">{title}</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {entries.length} {entries.length === 1 ? "type" : "types"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No data available</p>
          ) : (
            entries.map(([key, value], idx) => {
              const pct = total > 0 ? (value / total) * 100 : 0;
              const colors =
                colorMap?.[key] ?? colorCycle?.[idx % (colorCycle?.length ?? 1)] ?? {
                  bar: "bg-muted-foreground",
                  badge: "bg-muted text-muted-foreground border-border",
                };

              return (
                <div key={key} className="group">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {key.replaceAll("_", " ")}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
                      <Badge
                        variant="outline"
                        className={`${colors.badge} transition-all group-hover:scale-105`}
                      >
                        {value}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 ${colors.bar} transition-all duration-700 ease-out`}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResourceStatsCards({ stats }: ResourceStatsCardsProps) {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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