import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { requireEnv } from "./env";

const SALT_ROUNDS = 12;

let dummyPasswordHash: string | null = null;

function getDummyPasswordHash() {
  if (!dummyPasswordHash) {
    dummyPasswordHash = bcrypt.hashSync("__meridian_dummy__", SALT_ROUNDS);
  }
  return dummyPasswordHash;
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload: SessionPayload) {
  const { JWT_SECRET } = requireEnv();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const { JWT_SECRET } = requireEnv();
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function safeVerifyPassword(password: string, hash: string | null | undefined) {
  const hashToCheck = hash ?? getDummyPasswordHash();
  return verifyPassword(password, hashToCheck);
}
