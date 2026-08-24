import { createFileRoute } from "@tanstack/react-router";

import { errorResponse, jsonResponse } from "@/server/http";
import { requireAuthUser } from "@/server/require-auth";
import { logoutUser } from "@/server/services/auth.service";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async () => {
        try {
          await requireAuthUser();
          const result = logoutUser();
          return jsonResponse(result);
        } catch (error) {
          if (error instanceof Response) return error;
          return errorResponse("Logout failed", 500);
        }
      },
    },
  },
});
