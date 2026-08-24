import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

import { getEnv } from "./env";

const SESSION_COOKIE = "meridian_session";
const ONE_WEEK = 60 * 60 * 24 * 7;

function cookieFlags(maxAge: number) {
  const { NODE_ENV } = getEnv();
  const secure = NODE_ENV === "production" ? "; Secure" : "";
  return `HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function setSessionCookie(token: string) {
  setResponseHeader("Set-Cookie", `${SESSION_COOKIE}=${token}; ${cookieFlags(ONE_WEEK)}`);
}

export function clearSessionCookie() {
  setResponseHeader("Set-Cookie", `${SESSION_COOKIE}=; ${cookieFlags(0)}`);
}

export function readSessionToken(): string | null {
  const header = getRequestHeader("cookie");
  if (!header) return null;

  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === SESSION_COOKIE) {
      return part.slice(eq + 1) || null;
    }
  }
  return null;
}
