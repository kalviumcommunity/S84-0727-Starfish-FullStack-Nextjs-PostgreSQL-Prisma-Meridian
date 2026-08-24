import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const originMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    const origin = request.headers.get("origin");
    const appOrigin = new URL(process.env.APP_URL ?? "http://localhost:3000").origin;

    if (origin) {
      try {
        const requestOrigin = new URL(origin);
        const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(requestOrigin.hostname);
        const isAllowedOrigin = requestOrigin.origin === appOrigin || isLocalHost;

        if (!isAllowedOrigin) {
          return new Response(JSON.stringify({ error: "Origin check failed" }), {
            status: 403,
            headers: { "content-type": "application/json" },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: "Origin check failed" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });
      }
    }
  }

  return next();
});

const csrfMiddleware = createCsrfMiddleware({
  allowRequestsWithoutOriginCheck: true,
  filter: (ctx) => {
    const method = ctx.request.method.toUpperCase();
    return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  },
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware, originMiddleware],
}));
