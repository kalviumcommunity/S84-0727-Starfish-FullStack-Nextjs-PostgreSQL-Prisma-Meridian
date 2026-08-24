import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createOrganizationSchema,
  createProjectSchema,
} from "../../server/http";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "securepassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "alice@example.com",
      password: "securepassword123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "not-an-email",
      password: "securepassword123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    const error = result.error?.errors[0]?.message;
    expect(error).toMatch(/8 characters/i);
  });

  it("rejects a password longer than 128 characters", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name and email", () => {
    const result = registerSchema.safeParse({
      name: "  Alice  ",
      email: "  alice@example.com  ",
      password: "securepassword123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Alice");
      expect(result.data.email).toBe("alice@example.com");
    }
  });
});

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "alice@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "anypassword" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "alice@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createOrganizationSchema", () => {
  it("accepts a valid organization name", () => {
    const result = createOrganizationSchema.safeParse({ name: "Acme Corp" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty organization name", () => {
    const result = createOrganizationSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = createOrganizationSchema.safeParse({ name: "x".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("createProjectSchema", () => {
  it("accepts a valid project payload with github URL", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "org-123",
      name: "My Project",
      githubUrl: "https://github.com/org/repo",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a project without github URL", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "org-123",
      name: "My Project",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty string for github URL (optional)", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "org-123",
      name: "My Project",
      githubUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid github URL", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "org-123",
      name: "My Project",
      githubUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty project name", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "org-123",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing organizationId", () => {
    const result = createProjectSchema.safeParse({
      name: "My Project",
    });
    expect(result.success).toBe(false);
  });
});


