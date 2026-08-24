import { createFileRoute } from "@tanstack/react-router";

import { errorResponse, jsonResponse } from "@/server/http";
import { requireAuthUser } from "@/server/require-auth";
import { getProject } from "@/server/services/organization.service";

export const Route = createFileRoute("/api/projects/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const user = await requireAuthUser();
          const project = await getProject(user.id, params.id);
          return jsonResponse({ project });
        } catch (error) {
          if (error instanceof Response) return error;
          const message = error instanceof Error ? error.message : "Failed to load project";
          return errorResponse(message, 404);
        }
      },
    },
  },
});
