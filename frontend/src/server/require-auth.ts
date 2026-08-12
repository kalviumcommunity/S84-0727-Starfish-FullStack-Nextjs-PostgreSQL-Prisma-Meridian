import { verifySessionToken } from "./auth";
import { getDb } from "./db";
import { errorResponse } from "./http";
import { readSessionToken } from "./session";

export async function requireAuthUser() {
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
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    throw errorResponse("User not found", 401);
  }

  return user;
}
