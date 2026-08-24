import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { analyzeCosts } from "@/server/services/billing.service";
import { errorResponse, jsonResponse } from "@/server/http";

const analysisQuerySchema = z.object({
  projectId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  spikeThreshold: z.coerce.number().min(0).max(10).default(0.5),
});

export const Route = createFileRoute("/api/billing/analysis")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const url = new URL(request.url);

          const query = analysisQuerySchema.parse({
            projectId: url.searchParams.get("projectId"),
            startDate: url.searchParams.get("startDate"),
            endDate: url.searchParams.get("endDate"),
            spikeThreshold: url.searchParams.get("spikeThreshold"),
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

          const options: any = { spikeThreshold: query.spikeThreshold };
          if (query.startDate) options.startDate = new Date(query.startDate);
          if (query.endDate) options.endDate = new Date(query.endDate);

          const analysis = await analyzeCosts(query.projectId, options);

          return jsonResponse({
            analysis,
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
