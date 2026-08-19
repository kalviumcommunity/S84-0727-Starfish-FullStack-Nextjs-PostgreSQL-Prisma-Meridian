import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { syncCommitsToDeployments } from "@/server/services/github.service";
import { errorResponse, jsonResponse, parseJsonBody } from "@/server/http";

const syncSchema = z.object({
  projectId: z.string().min(1),
  token: z.string().optional(),
  since: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(200).default(100),
});

export const Route = createFileRoute("/api/github/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const data = await parseJsonBody(request, syncSchema);

          const db = getDb();

          // Verify project exists and user has access
          const project = await db.project.findFirst({
            where: {
              id: data.projectId,
              organization: {
                ownerId: user.sub,
              },
            },
            include: {
              organization: true,
            },
          });

          if (!project) {
            return errorResponse("Project not found or access denied", 404);
          }

          if (!project.githubUrl) {
            return errorResponse("GitHub URL not configured for this project", 400);
          }

          const options: any = { limit: data.limit };
          if (data.since) {
            options.since = new Date(data.since);
          }

          const syncResult = await syncCommitsToDeployments(
            data.projectId,
            project.githubUrl,
            data.token,
            options,
          );

          return jsonResponse({
            success: true,
            message: "Commits synced successfully",
            syncResult,
          });
        } catch (error: any) {
          if (error instanceof Response) return error;
          return errorResponse(`Failed to sync commits: ${error.message}`, 500);
        }
      },
    },
  },
});
