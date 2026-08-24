/**
 * Generic runtime error reporting utility.
 * Reports errors to the console and any registered global error handlers.
 */

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  console.error("[Error]", message, context);
}
