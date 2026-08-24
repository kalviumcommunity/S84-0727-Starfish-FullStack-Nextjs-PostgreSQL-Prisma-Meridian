import { hashPassword, safeVerifyPassword, signSessionToken } from "../auth";
import { getDb } from "../db";
import { loginSchema, registerSchema } from "../http";
import { clearSessionCookie, setSessionCookie } from "../session";

export async function registerUser(input: { name: string; email: string; password: string }) {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();

  const existing = await getDb().user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(data.password);

  // Auto-assign admin role for @admin.com emails
  const role = email.endsWith("@admin.com") ? "ADMIN" : "USER";

  const user = await getDb().user.create({
    data: {
      name: data.name,
      email,
      passwordHash,
      role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signSessionToken({ sub: user.id, email: user.email, name: user.name });
  setSessionCookie(token);

  return { user, token };
}

export async function loginUser(input: { email: string; password: string }) {
  const data = loginSchema.parse(input);
  const email = data.email.toLowerCase();

  const user = await getDb().user.findUnique({ where: { email } });
  const passwordMatches = await safeVerifyPassword(data.password, user?.passwordHash);

  if (!user || !passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = signSessionToken({ sub: user.id, email: user.email, name: user.name });
  setSessionCookie(token);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
}

export function logoutUser() {
  clearSessionCookie();
  return { ok: true };
}

export async function getUserById(userId: string) {
  return getDb().user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
