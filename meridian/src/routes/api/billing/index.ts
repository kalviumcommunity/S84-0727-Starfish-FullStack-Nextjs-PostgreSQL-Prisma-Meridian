import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { getBillingRecords } from "@/server/services/billing.service";
import { errorResponse, jsonResponse } from "@/server/http";

const billingQuerySchema = z.object({
  projectId: z.string().min(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  service: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
});

export const Route = createFileRoute("/api/billing/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const url = new URL(request.url);

          const query = billingQuerySchema.parse({
            projectId: url.searchParams.get("projectId"),
            startDate: url.searchParams.get("startDate"),
            endDate: url.searchParams.get("endDate"),
            service: url.searchParams.get("service"),
            limit: url.searchParams.get("limit"),
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

          const options: any = { limit: query.limit };
          if (query.startDate) options.startDate = new Date(query.startDate);
          if (query.endDate) options.endDate = new Date(query.endDate);
          if (query.service) options.service = query.service;

          const records = await getBillingRecords(query.projectId, options);

          return jsonResponse({
            records,
            total: records.length,
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
