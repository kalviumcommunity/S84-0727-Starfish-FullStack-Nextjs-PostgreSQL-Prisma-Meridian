import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  GitBranch,
  Brain,
  Upload,
  RefreshCw,
  Calendar,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  getProjectWithData, 
  getProjectAnalysis, 
  getProjectDeployments, 
  getProjectInsights, 
  getProjectCorrelations,
  generateProjectInsightsFn
} from "@/server/project.functions";

export const Route = createFileRoute("/app/projects/$id")({
  loader: async ({ params }) => {

    // Fetch all data in parallel
    const [project, analysis, deployments, insights, correlations] = await Promise.all([
      getProjectWithData({ data: params.id }),
      getProjectAnalysis({ data: params.id }),
      getProjectDeployments({ data: { projectId: params.id, limit: 10 } }),
      getProjectInsights({ data: { projectId: params.id, limit: 5 } }),
      getProjectCorrelations({ data: params.id }),
    ]);

    if (!project) {
      throw new Error("Project not found");
    }

    return { project, analysis, deployments, insights, correlations };
  },
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading project data...</p>
    </div>
  ),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { project, analysis, deployments, insights, correlations } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/app/projects" className="hover:text-foreground">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Projects
            </Link>
            <span>/</span>
            <span>{project.organization?.name}</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {project.name}
          </h1>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <GitBranch className="h-3 w-3" />
              {project.githubUrl}
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href={`/api/projects/${project.id}/export?format=pdf`} download>
                  Download PDF Report
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/api/projects/${project.id}/export?format=csv`} download>
                  Download Billing CSV
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {analysis && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Cost
              </CardDescription>
              <CardTitle className="text-2xl">
                ${analysis.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Avg Daily Cost
              </CardDescription>
              <CardTitle className="text-2xl">
                ${analysis.averageDailyCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Cost Spikes
              </CardDescription>
              <CardTitle className="text-2xl">{analysis.spikes.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Deployments
              </CardDescription>
              <CardTitle className="text-2xl">{deployments.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* No Data Alert */}
      {!analysis && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Get Started</AlertTitle>
          <AlertDescription>
            Upload billing data and connect your GitHub repository to start analyzing costs.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab
            analysis={analysis}
            deployments={deployments}
            insights={insights}
            projectId={project.id}
          />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <CostsTab analysis={analysis} projectId={project.id} />
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <DeploymentsTab
            deployments={deployments}
            correlations={correlations}
            projectId={project.id}
            githubUrl={project.githubUrl}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <InsightsTab insights={insights} projectId={project.id} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ analysis, deployments, insights, projectId }: any) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Cost Breakdown */}
      {analysis && analysis.costByService.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cost by Service</CardTitle>
            <CardDescription>Top services by spending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.costByService.slice(0, 5).map((item: any) => (
              <div key={item.service} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.service}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold">
                  ${item.cost.toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recent Insights
          </CardTitle>
          <CardDescription>AI-generated cost analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No insights yet</p>
              <p className="text-xs mt-1">Generate insights after uploading billing data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, 2).map((insight: any) => (
                <div key={insight.id} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {insight.description}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {insight.confidenceScore}% confidence
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
          <CardDescription>Latest commits</CardDescription>
        </CardHeader>
        <CardContent>
          {deployments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No deployments tracked</p>
              <p className="text-xs mt-1">Connect a GitHub repository to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deployments.slice(0, 5).map((deployment: any) => (
                <div key={deployment.id} className="flex gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{deployment.message}</p>
                    <p className="text-xs text-muted-foreground">
                      by {deployment.author} •{" "}
                      {new Date(deployment.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Spikes */}
      {analysis && analysis.spikes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Cost Anomalies
            </CardTitle>
            <CardDescription>Detected cost spikes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.spikes.slice(0, 3).map((spike: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                <TrendingUp className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{spike.service}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Increased {spike.percentageIncrease.toFixed(1)}% on{" "}
                    {new Date(spike.date).toLocaleDateString('en-US')}
                  </p>
                  <p className="text-xs mt-1">
                    ${spike.previousCost.toFixed(2)} → ${spike.currentCost.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CostsTab({ analysis: initialAnalysis, projectId }: any) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [dateRange, setDateRange] = useState("all");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (dateRange === "all") {
      setAnalysis(initialAnalysis);
      return;
    }

    const fetchFiltered = async () => {
      setLoadingAnalysis(true);
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(dateRange));
        
        const res = await fetch(`/api/billing/analysis?projectId=${projectId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data.analysis);
        }
      } catch (error) {
        console.error("Failed to fetch filtered analysis", error);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchFiltered();
  }, [dateRange, projectId, initialAnalysis]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const csvContent = await file.text();
      const res = await fetch("/api/billing/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, csvContent }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      setUploadSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Billing Data
          </CardTitle>
          <CardDescription>
            Upload a CSV file with columns: Date, Service, Cost
            <br />
            <a 
              href="/sample-billing.csv" 
              download 
              className="text-primary hover:underline text-sm mt-1 inline-block"
            >
              Download sample CSV template
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-sm"
            />
          </div>
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {uploadError && <Alert variant="destructive"><AlertDescription>{uploadError}</AlertDescription></Alert>}
          {uploadSuccess && <Alert><AlertDescription>✓ Upload successful!</AlertDescription></Alert>}
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="flex justify-end mb-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card className={loadingAnalysis ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Daily total cost over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysis.dailyCosts} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} 
                      tick={{fontSize: 12, fill: "var(--muted-foreground)"}} 
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `$${val}`} 
                      tick={{fontSize: 12, fill: "var(--muted-foreground)"}} 
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Total Cost"]} 
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US')}
                      contentStyle={{ 
                        borderRadius: "8px", 
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)"
                      }}
                      itemStyle={{ color: "var(--primary)" }}
                      labelStyle={{ color: "var(--foreground)", marginBottom: "4px" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Cost" 
                      stroke="var(--primary)" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: "var(--background)", stroke: "var(--primary)", strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.costByService.map((item: any) => (
                  <div key={item.service} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.service}</span>
                      <span>${item.cost.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {analysis.spikes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Cost Spikes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.spikes.map((spike: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{spike.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(spike.date).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-destructive">
                          +{spike.percentageIncrease.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${spike.previousCost.toFixed(2)} → ${spike.currentCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function DeploymentsTab({ deployments, correlations, projectId, githubUrl }: any) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Sync failed");
      }

      window.location.reload();
    } catch (error: any) {
      setSyncError(error.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      {githubUrl ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sync Deployments</CardTitle>
              <CardDescription>Fetch latest commits from GitHub</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
              {syncError && <p className="text-sm text-destructive mt-2">{syncError}</p>}
            </CardContent>
          </Card>

          {correlations?.correlations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deployment Impact Timeline</CardTitle>
                <CardDescription>Correlated cost changes and engineering activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {correlations.correlations.map((correlation: any, idx: number) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {correlation.deployment ? <GitBranch className="h-4 w-4" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                        <div className="flex flex-col gap-2">
                          {correlation.deployment && (
                            <div>
                              <Badge variant="outline" className="mb-2 bg-muted">Deployment</Badge>
                              <p className="font-medium text-sm">{correlation.deployment.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(correlation.deployment.date).toLocaleDateString('en-US')} by {correlation.deployment.author}
                              </p>
                            </div>
                          )}
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <Badge variant="destructive" className="mb-2">Cost Spike</Badge>
                            <p className="text-sm">
                              <span className="font-semibold">{correlation.spike.service}</span> cost increased by <span className="font-semibold text-destructive">{correlation.spike.percentageIncrease.toFixed(1)}%</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ${correlation.spike.previousCost.toFixed(2)} → ${correlation.spike.currentCost.toFixed(2)} on {new Date(correlation.spike.date).toLocaleDateString('en-US')}
                            </p>
                          </div>
                          <div className="mt-2 bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                            {correlation.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
              {deployments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No deployments tracked yet. Click Sync Now to fetch commits.
                </p>
              ) : (
                <div className="space-y-4">
                  {deployments.map((deployment: any) => (
                    <div key={deployment.id} className="border-l-2 border-primary pl-4 py-2">
                      <p className="font-medium">{deployment.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {deployment.author} •{" "}
                        {new Date(deployment.createdAt).toLocaleString()}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                        {deployment.commitHash.slice(0, 7)}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No GitHub Repository Connected</AlertTitle>
          <AlertDescription>
            Add a GitHub URL in project settings to track deployments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function InsightsTab({ insights, projectId }: any) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      await generateProjectInsightsFn({ data: { projectId } });
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Generate AI-powered cost analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={generating}>
            <Brain className={`h-4 w-4 mr-2 ${generating ? "animate-pulse" : ""}`} />
            {generating ? "Generating..." : "Generate New Insight"}
          </Button>
          {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight: any) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription>
                      {new Date(insight.createdAt).toLocaleDateString('en-US')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{insight.confidenceScore}% confidence</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ project }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Project Name</Label>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Organization</Label>
          <p className="text-sm text-muted-foreground">{project.organization?.name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">GitHub URL</Label>
          <p className="text-sm text-muted-foreground">
            {project.githubUrl || "Not connected"}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p className="text-sm text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ className, children }: any) {
  return <label className={className}>{children}</label>;
}