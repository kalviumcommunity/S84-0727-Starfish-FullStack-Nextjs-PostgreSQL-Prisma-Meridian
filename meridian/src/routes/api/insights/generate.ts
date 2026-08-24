import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { correlateDeploymentsWithCosts } from "@/server/services/correlation.service";
import { analyzeCosts } from "@/server/services/billing.service";
import { generateAIInsights } from "@/server/services/ai.service";
import { errorResponse, jsonResponse, parseJsonBody } from "@/server/http";

const generateInsightSchema = z.object({
  projectId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  spikeThreshold: z.coerce.number().min(0).max(10).default(0.5),
});

export const Route = createFileRoute("/api/insights/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const data = await parseJsonBody(request, generateInsightSchema);

          const db = getDb();

          // Verify project exists and user has access
          const project = await db.project.findFirst({
            where: {
              id: data.projectId,
              organization: {
                ownerId: user.id,
              },
            },
          });

          if (!project) {
            return errorResponse("Project not found or access denied", 404);
          }

          const options: any = { spikeThreshold: data.spikeThreshold };
          if (data.startDate) options.startDate = new Date(data.startDate);
          if (data.endDate) options.endDate = new Date(data.endDate);

          // Get correlation analysis
          const correlationResult = await correlateDeploymentsWithCosts(
            data.projectId,
            options,
          );

          if (correlationResult.totalSpikes === 0) {
            return jsonResponse({
              message: "No cost spikes detected in the specified period",
              insight: null,
            });
          }

          // Get cost analysis for context
          const costAnalysis = await analyzeCosts(data.projectId, options);

          // Calculate cost increase
          let costIncrease = 0;
          if (correlationResult.totalSpikes > 0) {
            const avgIncrease =
              correlationResult.correlations.reduce(
                (sum, c) => sum + c.spike.percentageIncrease,
                0,
              ) / correlationResult.correlations.length;
            costIncrease = avgIncrease;
          }

          // Generate AI insights
          const aiInsight = await generateAIInsights({
            correlations: correlationResult.correlations,
            projectName: project.name,
            totalCost: costAnalysis.totalCost,
            costIncrease,
          });

          // Store insight in database
          const insight = await db.insight.create({
            data: {
              projectId: data.projectId,
              title: aiInsight.title,
              description: `${aiInsight.description}\n\nRecommendations:\n${aiInsight.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
              confidenceScore: aiInsight.confidenceScore,
            },
          });

          return jsonResponse({
            success: true,
            insight: {
              ...insight,
              recommendations: aiInsight.recommendations,
            },
            correlationSummary: {
              totalSpikes: correlationResult.totalSpikes,
              correlatedSpikes: correlationResult.correlatedSpikes,
              avgConfidenceScore: correlationResult.avgConfidenceScore,
            },
          });
        } catch (error: any) {
          if (error instanceof Response) return error;
          console.error("Failed to generate insights:", error);
          return errorResponse(`Failed to generate insights: ${error.message}`, 500);
        }
      },
    },
  },
});
