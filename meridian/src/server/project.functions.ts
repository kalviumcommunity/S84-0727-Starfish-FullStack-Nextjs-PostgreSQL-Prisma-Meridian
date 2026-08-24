import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { analyzeCosts as analyzeProjectCosts } from "./services/billing.service";

export const getProjectWithData = createServerFn({ method: "GET" })
  .validator((projectId: unknown) => {
    if (typeof projectId !== "string") throw new Error("Invalid projectId");
    return projectId;
  })
  .handler(async ({ data: projectId }) => {
    const db = getDb();
    
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        _count: {
          select: {
            deployments: true,
            billingRecords: true,
            insights: true,
          },
        },
      },
    });

    return project;
  });

export const getProjectAnalysis = createServerFn({ method: "GET" })
  .validator((projectId: unknown) => {
    if (typeof projectId !== "string") throw new Error("Invalid projectId");
    return projectId;
  })
  .handler(async ({ data: projectId }) => {
    try {
      const analysis = await analyzeProjectCosts(projectId);
      return analysis;
    } catch (error) {
      console.error("Failed to get analysis:", error);
      return null;
    }
  });

export const getProjectDeployments = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid data");
    const projectId = "projectId" in data && typeof data.projectId === "string" ? data.projectId : "";
    const limit = "limit" in data && typeof data.limit === "number" ? data.limit : 10;
    return { projectId, limit };
  })
  .handler(async ({ data: { projectId, limit } }) => {
    const db = getDb();
    
    const deployments = await db.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return deployments;
  });

export const getProjectInsights = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid data");
    const projectId = "projectId" in data && typeof data.projectId === "string" ? data.projectId : "";
    const limit = "limit" in data && typeof data.limit === "number" ? data.limit : 5;
    return { projectId, limit };
  })
  .handler(async ({ data: { projectId, limit } }) => {
    const db = getDb();
    
    const insights = await db.insight.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return insights;
  });

export const getProjectCorrelations = createServerFn({ method: "GET" })
  .validator((projectId: unknown) => {
    if (typeof projectId !== "string") throw new Error("Invalid projectId");
    return projectId;
  })
  .handler(async ({ data: projectId }) => {
    const { correlateDeploymentsWithCosts } = await import("./services/correlation.service");
    try {
      return await correlateDeploymentsWithCosts(projectId);
    } catch (error) {
      console.error("Failed to get correlations:", error);
      return null;
    }
  });

export const generateProjectInsightsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid data");
    const projectId = "projectId" in data && typeof data.projectId === "string" ? data.projectId : "";
    return { projectId };
  })
  .handler(async ({ data: { projectId } }) => {
    const db = getDb();
    
    // Verify project
    const project = await db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new Error("Project not found");
    }

    const { correlateDeploymentsWithCosts } = await import("./services/correlation.service");
    const { generateAIInsights } = await import("./services/ai.service");
    const { analyzeCosts } = await import("./services/billing.service");

    const correlationResult = await correlateDeploymentsWithCosts(projectId, { spikeThreshold: 0.5 });
    
    if (correlationResult.totalSpikes === 0) {
      throw new Error("No cost spikes detected in the specified period. Cannot generate insights.");
    }

    const costAnalysis = await analyzeCosts(projectId, { spikeThreshold: 0.5 });

    let costIncrease = 0;
    if (correlationResult.totalSpikes > 0) {
      const avgIncrease = correlationResult.correlations.reduce((sum, c) => sum + c.spike.percentageIncrease, 0) / correlationResult.correlations.length;
      costIncrease = avgIncrease;
    }

    const aiInsight = await generateAIInsights({
      correlations: correlationResult.correlations,
      projectName: project.name,
      totalCost: costAnalysis.totalCost,
      costIncrease,
    });

    const insight = await db.insight.create({
      data: {
        projectId,
        title: aiInsight.title,
        description: `${aiInsight.description}\n\nRecommendations:\n${aiInsight.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}`,
        confidenceScore: aiInsight.confidenceScore,
      },
    });

    return insight;
  });
