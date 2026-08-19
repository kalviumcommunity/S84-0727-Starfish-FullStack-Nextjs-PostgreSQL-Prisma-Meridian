import { Link, createFileRoute } from "@tanstack/react-router";
import { Cloud, TrendingUp, FolderKanban, Building2, ArrowRight, Upload, GitBranch } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listOrganizationsFn, listProjectsFn } from "@/server/app.functions";

export const Route = createFileRoute("/app/")({
  loader: async () => {
    const [organizations, projects] = await Promise.all([listOrganizationsFn(), listProjectsFn()]);
    return { organizations, projects };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext({ from: "/app" });
  const { organizations, projects } = Route.useLoaderData();

  const totalDeployments = projects.reduce((sum, p) => sum + (p._count?.deployments || 0), 0);
  const totalBillingRecords = projects.reduce((sum, p) => sum + (p._count?.billingRecords || 0), 0);
  const totalInsights = projects.reduce((sum, p) => sum + (p._count?.insights || 0), 0);

  const hasData = totalBillingRecords > 0 || totalDeployments > 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="h-8 w-8" />
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Welcome back, {user.name}
            </h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl">
            Your cloud cost attribution platform is ready. Track deployments, upload billing data,
            and get AI-powered insights.
          </p>
          {!hasData && (
            <div className="mt-6 flex gap-3">
              <Link to="/app/projects">
                <Button variant="secondary" size="lg">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 opacity-10">
          <TrendingUp className="h-64 w-64" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Organizations"
          value={organizations.length}
          icon={<Building2 className="h-5 w-5" />}
          href="/app/organizations"
          color="blue"
        />
        <StatCard
          title="Projects"
          value={projects.length}
          icon={<FolderKanban className="h-5 w-5" />}
          href="/app/projects"
          color="purple"
        />
        <StatCard
          title="Deployments"
          value={totalDeployments}
          icon={<GitBranch className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Billing Records"
          value={totalBillingRecords}
          icon={<Upload className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link to="/app/projects">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-4">
                <FolderKanban className="h-12 w-12 mx-auto opacity-50" />
                <div>
                  <p className="font-medium">No projects yet</p>
                  <p className="text-sm mt-1">Create your first project to get started</p>
                </div>
                <Link to="/app/projects">
                  <Button>
                    <FolderKanban className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/app/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {project.organization.name}
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{project._count.deployments} deploys</span>
                        <span>{project._count.insights} insights</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started / Status */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>Complete these steps to start analyzing costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Step
              done={organizations.length > 0}
              label="Create an organization"
              description="Group your projects under organizations"
            />
            <Step
              done={projects.length > 0}
              label="Add a project"
              description="Create projects to track costs"
            />
            <Step
              done={projects.some((p) => p.githubUrl)}
              label="Connect GitHub"
              description="Link repositories to track deployments"
            />
            <Step
              done={totalBillingRecords > 0}
              label="Upload billing data"
              description="Import cost data via CSV"
            />
            <Step
              done={totalInsights > 0}
              label="Generate AI insights"
              description="Get intelligent cost recommendations"
            />

            {organizations.length === 0 && (
              <div className="pt-4">
                <Link to="/app/organizations">
                  <Button className="w-full">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {hasData && totalInsights === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ready for AI Analysis
            </CardTitle>
            <CardDescription>
              You have {totalBillingRecords} billing records and {totalDeployments} deployments.
              Generate AI insights to understand your cost patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI will analyze your costs, correlate them with deployments, and provide
              actionable recommendations.
            </p>
            <Link to="/app/projects">
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  href,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  color?: string;
}) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400",
    green: "text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400",
  };

  const content = (
    <Card className={href ? "transition-all hover:border-primary/40 hover:shadow-md cursor-pointer" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="font-medium">{title}</CardDescription>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            {icon}
          </div>
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function Step({
  done,
  label,
  description,
}: {
  done: boolean;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${
          done
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : "·"}
      </span>
      <div className="flex-1">
        <p className={`font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
