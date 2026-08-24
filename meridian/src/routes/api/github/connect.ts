import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireAuth } from "@/server/require-auth";
import { validateGitHubRepo, syncCommitsToDeployments } from "@/server/services/github.service";
import { errorResponse, jsonResponse, parseJsonBody } from "@/server/http";

const connectSchema = z.object({
  projectId: z.string().min(1),
  githubUrl: z.string().url(),
  token: z.string().optional(),
});

export const Route = createFileRoute("/api/github/connect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const user = await requireAuth(request);
          const data = await parseJsonBody(request, connectSchema);

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

          // Validate GitHub repository
          const validation = await validateGitHubRepo(data.githubUrl, data.token);
          if (!validation.valid) {
            return errorResponse(validation.error || "Invalid repository", 400);
          }

          // Update project with GitHub URL
          await db.project.update({
            where: { id: data.projectId },
            data: { githubUrl: data.githubUrl },
          });

          // Sync recent commits (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const syncResult = await syncCommitsToDeployments(
            data.projectId,
            data.githubUrl,
            data.token,
            {
              since: thirtyDaysAgo,
              limit: 100,
            },
          );

          return jsonResponse({
            success: true,
            message: "GitHub repository connected successfully",
            repoInfo: validation.repoInfo,
            syncResult,
          });
        } catch (error: any) {
          if (error instanceof Response) return error;
          return errorResponse(`Failed to connect GitHub: ${error.message}`, 500);
        }
      },
    },
  },
});
