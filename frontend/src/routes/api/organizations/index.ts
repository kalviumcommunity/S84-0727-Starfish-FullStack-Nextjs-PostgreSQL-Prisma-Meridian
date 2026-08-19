import { createFileRoute } from "@tanstack/react-router";

import {
  createOrganizationSchema,
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from "@/server/http";
import { requireAuthUser } from "@/server/require-auth";
import { createOrganization, listOrganizations } from "@/server/services/organization.service";

export const Route = createFileRoute("/api/organizations/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const user = await requireAuthUser();
          const organizations = await listOrganizations(user.id);
          return jsonResponse({ organizations });
        } catch (error) {
          if (error instanceof Response) return error;
          return errorResponse("Failed to load organizations", 500);
        }
      },
      POST: async ({ request }) => {
        try {
          const user = await requireAuthUser();
          const body = await parseJsonBody(request, createOrganizationSchema);
          const organization = await createOrganization(user.id, body);
          return jsonResponse({ organization }, 201);
        } catch (error) {
          if (error instanceof Response) return error;
          const message = error instanceof Error ? error.message : "Failed to create organization";
          return errorResponse(message, 400);
        }
      },
    },
  },
});
