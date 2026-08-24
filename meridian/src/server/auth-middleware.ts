import { Role } from "@prisma/client";
import { createMiddleware } from "@tanstack/react-start";

import { verifySessionToken } from "./auth";
import { getDb } from "./db";
import { readSessionToken } from "./session";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthContext = {
  user: AuthUser;
};

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const token = readSessionToken();
  if (!token) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    throw new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const user = await getDb().user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    throw new Response(JSON.stringify({ error: "User not found" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  return next({ context: { user } satisfies AuthContext });
});

export const adminMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const { user } = context as AuthContext;
    if (user.role !== Role.ADMIN) {
      throw new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }
    return next();
  });

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = readSessionToken();
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  return getDb().user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true },
  });
}

