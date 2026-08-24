import { createFileRoute } from "@tanstack/react-router";

import { errorResponse, jsonResponse, parseJsonBody, loginSchema } from "@/server/http";
import { checkRateLimit, getClientIp } from "@/server/rate-limit";
import { loginUser } from "@/server/services/auth.service";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = getClientIp(request);
        if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
          return errorResponse("Too many requests. Try again later.", 429);
        }

        try {
          const body = await parseJsonBody(request, loginSchema);
          const result = await loginUser(body);
          return jsonResponse({ user: result.user });
        } catch (error) {
          if (error instanceof Response) return error;
          const message = error instanceof Error ? error.message : "Login failed";
          return errorResponse(message, 401);
        }
      },
    },
  },
});
