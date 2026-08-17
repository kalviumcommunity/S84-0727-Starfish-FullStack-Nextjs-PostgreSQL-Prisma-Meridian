import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { errorResponse, jsonResponse } from "@/server/http";

const insightsQuerySchema = z.object({
  projectId: z.string().min(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const Route = createFileRoute("/api/insights/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const url = new URL(request.url);

          const query = insightsQuerySchema.parse({
            projectId: url.searchParams.get("projectId"),
            limit: url.searchParams.get("limit"),
          });

          const db = getDb();

          // Verify project exists and user has access
          const project = await db.project.findFirst({
            where: {
              id: query.projectId,
              organization: {
                ownerId: user.sub,
              },
            },
          });

          if (!project) {
            return errorResponse("Project not found or access denied", 404);
          }

          const insights = await db.insight.findMany({
            where: { projectId: query.projectId },
            orderBy: { createdAt: "desc" },
            take: query.limit,
          });

          return jsonResponse({
            insights,
            total: insights.length,
            projectId: query.projectId,
          });
        } catch (error: any) {
          if (error instanceof Response) return error;
          return errorResponse(error.message, 400);
        }
      },
    },
  },
});
