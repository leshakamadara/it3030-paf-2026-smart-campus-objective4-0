import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Plus, Lock, Loader2, AlertCircle } from "lucide-react";
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
  const userRoleLabel = user?.role ?? "USER";

  useEffect(() => {
    if (!isResourceAdmin) {
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
  }, [isResourceAdmin]);

  if (!isResourceAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <Button variant="ghost" asChild className="transition-all hover:bg-muted">
              <Link to="/resources">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Resources
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-amber-200 bg-amber-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-amber-800">
                <Lock className="h-5 w-5" />
                Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                Only administrators can view analytics. You are signed in as{" "}
                <strong>{userRoleLabel}</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated gradient border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient-x" />

      {/* Page Header */}
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="transition-all hover:bg-muted">
                <Link to="/resources">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Resources
                </Link>
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">Analytics</span>
            </div>

            <Button asChild className="transition-all hover:scale-105 hover:shadow-md">
              <Link to="/admin/resources/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Admin Analytics
            </p>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Resource Insights
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Real‑time overview of campus resources — status, availability, and distribution
              across types and buildings.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading statistics...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="flex items-start gap-4 py-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h2 className="font-semibold text-destructive">Failed to load</h2>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : stats ? (
          <ResourceStatsCards stats={stats} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No statistics available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}