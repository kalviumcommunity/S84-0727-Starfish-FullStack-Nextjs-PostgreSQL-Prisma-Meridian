import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { errorResponse, jsonResponse } from "@/server/http";

const commitsQuerySchema = z.object({
  projectId: z.string().min(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  since: z.string().datetime().optional(),
  until: z.string().datetime().optional(),
});

export const Route = createFileRoute("/api/github/commits")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const url = new URL(request.url);

          const query = commitsQuerySchema.parse({
            projectId: url.searchParams.get("projectId"),
            limit: url.searchParams.get("limit"),
            since: url.searchParams.get("since"),
            until: url.searchParams.get("until"),
          });

          const db = getDb();

          // Verify project exists and user has access
          const project = await db.project.findFirst({
            where: {
              id: query.projectId,
              organization: {
                ownerId: user.id,
              },
            },
          });

          if (!project) {
            return errorResponse("Project not found or access denied", 404);
          }

          // Build where clause
          const where: any = { projectId: query.projectId };

          if (query.since || query.until) {
            where.createdAt = {};
            if (query.since) where.createdAt.gte = new Date(query.since);
            if (query.until) where.createdAt.lte = new Date(query.until);
          }

          // Fetch deployments (commits)
          const deployments = await db.deployment.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: query.limit,
          });

          return jsonResponse({
            deployments,
            total: deployments.length,
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
