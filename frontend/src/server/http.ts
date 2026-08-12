import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(100),
});

export const createProjectSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().trim().min(1, "Project name is required").max(100),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
});

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

export async function parseJsonBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw errorResponse("Invalid JSON body", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw errorResponse(message, 400);
  }
  return parsed.data;
}
