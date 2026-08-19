import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/app/projects/$id")({
  loader: async ({ params }) => {
    const { getProjectWithData, getProjectAnalysis, getProjectDeployments, getProjectInsights } = 
      await import("@/server/project.functions");

    // Fetch all data in parallel
    const [project, analysis, deployments, insights] = await Promise.all([
      getProjectWithData(params.id),
      getProjectAnalysis(params.id),
      getProjectDeployments(params.id, 10),
      getProjectInsights(params.id, 5),
    ]);

    if (!project) {
      throw new Error("Project not found");
    }

    return { project, analysis, deployments, insights };
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { project, analysis, deployments, insights } = Route.useLoaderData();
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
                      {new Date(deployment.createdAt).toLocaleDateString()}
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
                    {new Date(spike.date).toLocaleDateString()}
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

function CostsTab({ analysis, projectId }: any) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
                          {new Date(spike.date).toLocaleDateString()}
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

function DeploymentsTab({ deployments, projectId, githubUrl }: any) {
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
      const res = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate insights");
      }

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
                      {new Date(insight.createdAt).toLocaleDateString()}
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
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ className, children }: any) {
  return <label className={className}>{children}</label>;
}
