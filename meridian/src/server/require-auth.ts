import { Role } from "@prisma/client";
import { verifySessionToken } from "./auth";
import { getDb } from "./db";
import { errorResponse } from "./http";
import { readSessionToken } from "./session";

export async function requireAuthUser(_request?: Request) {
  const token = readSessionToken();
  if (!token) {
    throw errorResponse("Unauthorized", 401);
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    throw errorResponse("Invalid or expired session", 401);
  }

  const user = await getDb().user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    throw errorResponse("User not found", 401);
  }

  return user;
}

export const requireAuth = requireAuthUser;

export async function requireAdminAuth(_request?: Request) {
  const user = await requireAuthUser();
  if (user.role !== Role.ADMIN) {
    throw errorResponse("Forbidden: Admin access required", 403);
  }
  return user;
}


