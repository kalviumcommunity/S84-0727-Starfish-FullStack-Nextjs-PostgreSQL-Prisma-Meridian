import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { parseBillingCSV, storeBillingRecords } from "@/server/services/billing.service";
import { errorResponse, jsonResponse, parseJsonBody } from "@/server/http";

const uploadSchema = z.object({
  projectId: z.string().min(1),
  csvContent: z.string().min(1),
});

export const Route = createFileRoute("/api/billing/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const body = await parseJsonBody(request, uploadSchema);

          const db = getDb();

          // Verify project exists and user has access
          const project = await db.project.findFirst({
            where: {
              id: body.projectId,
              organization: {
                ownerId: user.id,
              },
            },
          });

          if (!project) {
            return errorResponse("Project not found or access denied", 404);
          }

          // Parse CSV
          const records = parseBillingCSV(body.csvContent);

          if (records.length === 0) {
            return errorResponse("No valid records found in CSV", 400);
          }

          // Store records
          const result = await storeBillingRecords(body.projectId, records);

          return jsonResponse({
            success: true,
            message: "Billing data uploaded successfully",
            result: {
              totalRecords: records.length,
              created: result.created,
              duplicates: result.duplicates,
            },
          });
        } catch (error: any) {
          if (error instanceof Response) return error;
          return errorResponse(`Failed to process CSV: ${error.message}`, 400);
        }
      },
    },
  },
});
