import { createFileRoute } from "@tanstack/react-router";

import { errorResponse, jsonResponse, parseJsonBody, registerSchema } from "@/server/http";
import { checkRateLimit, getClientIp } from "@/server/rate-limit";
import { registerUser } from "@/server/services/auth.service";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = getClientIp(request);
        if (!checkRateLimit(`register:${ip}`, 5, 60_000)) {
          return errorResponse("Too many requests. Try again later.", 429);
        }

        try {
          const body = await parseJsonBody(request, registerSchema);
          const result = await registerUser(body);
          return jsonResponse({ user: result.user }, 201);
        } catch (error) {
          if (error instanceof Response) return error;
          const message = error instanceof Error ? error.message : "Registration failed";
          return errorResponse(message, 400);
        }
      },
    },
  },
});
