import { describe, it, expect, vi } from "vitest";

// Mock bcrypt to use a low salt round for speed in tests
vi.mock("bcryptjs", async () => {
  const actual = await vi.importActual<typeof import("bcryptjs")>("bcryptjs");
  return {
    default: {
      ...actual,
      hash: (pwd: string, _rounds: number) => actual.hash(pwd, 4),
      hashSync: (pwd: string, _rounds: number) => actual.hashSync(pwd, 4),
    },
  };
});

process.env.JWT_SECRET = "test-secret-key-for-unit-tests-32chars";
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";

const { hashPassword, verifyPassword, signSessionToken, verifySessionToken, safeVerifyPassword } =
  await import("../../server/auth");

describe("hashPassword / verifyPassword", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("my-secure-password");
    expect(hash).not.toBe("my-secure-password");
    const isValid = await verifyPassword("my-secure-password", hash);
    expect(isValid).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("correct-password");
    const isValid = await verifyPassword("wrong-password", hash);
    expect(isValid).toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });
});

describe("signSessionToken / verifySessionToken", () => {
  const payload = { sub: "user-123", email: "test@example.com", name: "Test User" };

  it("signs a token and verifies it successfully", () => {
    const token = signSessionToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe("user-123");
    expect(decoded?.email).toBe("test@example.com");
    expect(decoded?.name).toBe("Test User");
  });

  it("returns null for a tampered token", () => {
    const token = signSessionToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("returns null for a completely invalid token", () => {
    expect(verifySessionToken("not.a.real.token")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(verifySessionToken("")).toBeNull();
  });
});

describe("safeVerifyPassword", () => {
  it("verifies a correct password against a real hash", async () => {
    const hash = await hashPassword("real-password");
    const result = await safeVerifyPassword("real-password", hash);
    expect(result).toBe(true);
  });

  it("returns false for wrong password against a real hash", async () => {
    const hash = await hashPassword("real-password");
    const result = await safeVerifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("handles null hash without throwing (timing-safe dummy comparison)", async () => {
    const result = await safeVerifyPassword("any-password", null);
    expect(result).toBe(false);
  });

  it("handles undefined hash without throwing", async () => {
    const result = await safeVerifyPassword("any-password", undefined);
    expect(result).toBe(false);
  });
});
