import { createFileRoute } from "@tanstack/react-router";
import { getAdminDashboardStatsFn } from "@/server/admin.functions";
import { Users, Building2, FolderKanban, DollarSign, Brain, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    return getAdminDashboardStatsFn();
  },
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading global stats...</p>
    </div>
  ),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = Route.useLoaderData();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Global metrics and system health for Meridian.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active workspaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Managed repositories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Spend Tracked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {stats.totalSpend.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total cloud costs indexed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-500" />
              AI Utilization
            </CardTitle>
            <CardDescription>Global generation metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div>
                <p className="font-medium">Total Insights Generated</p>
                <p className="text-sm text-muted-foreground">Across all projects</p>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.insightsCount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
