import { createFileRoute } from "@tanstack/react-router";

import { createProjectSchema, errorResponse, jsonResponse, parseJsonBody } from "@/server/http";
import { requireAuthUser } from "@/server/require-auth";
import { createProject, listProjects } from "@/server/services/organization.service";

export const Route = createFileRoute("/api/projects/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireAuthUser();
          const url = new URL(request.url);
          const organizationId = url.searchParams.get("organizationId") ?? undefined;
          const projects = await listProjects(user.id, organizationId);
          return jsonResponse({ projects });
        } catch (error) {
          if (error instanceof Response) return error;
          return errorResponse("Failed to load projects", 500);
        }
      },
      POST: async ({ request }) => {
        try {
          const user = await requireAuthUser();
          const body = await parseJsonBody(request, createProjectSchema);
          const project = await createProject(user.id, body);
          return jsonResponse({ project }, 201);
        } catch (error) {
          if (error instanceof Response) return error;
          const message = error instanceof Error ? error.message : "Failed to create project";
          return errorResponse(message, 400);
        }
      },
    },
  },
});
