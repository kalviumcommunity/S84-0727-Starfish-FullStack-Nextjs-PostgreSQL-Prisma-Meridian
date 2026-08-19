import { createFileRoute } from "@tanstack/react-router";

import { errorResponse, jsonResponse } from "@/server/http";
import { requireAuthUser } from "@/server/require-auth";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const user = await requireAuthUser();
          return jsonResponse({ user });
        } catch (error) {
          if (error instanceof Response) return error;
          return errorResponse("Failed to load user", 500);
        }
      },
    },
  },
});
