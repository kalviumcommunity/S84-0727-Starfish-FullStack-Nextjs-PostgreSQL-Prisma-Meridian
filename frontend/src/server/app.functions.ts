import { createServerFn } from "@tanstack/react-start";

import { getCurrentUser } from "@/server/auth-middleware";
import { loginSchema, registerSchema } from "@/server/http";
import { loginUser, logoutUser, registerUser } from "@/server/services/auth.service";
import {
  createOrganization,
  createProject,
  listOrganizations,
  listProjects,
} from "@/server/services/organization.service";

export const getMeFn = createServerFn({ method: "GET" }).handler(async () => {
  return getCurrentUser();
});

export const registerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await registerUser(data);
    return { user: result.user };
  });

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await loginUser(data);
    return { user: result.user };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  return logoutUser();
});

export const listOrganizationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return listOrganizations(user.id);
});

export const createOrganizationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    const name = "name" in data && typeof data.name === "string" ? data.name : "";
    return { name };
  })
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return createOrganization(user.id, data);
  });

export const listProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return listProjects(user.id);
});

export const createProjectFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    const organizationId =
      "organizationId" in data && typeof data.organizationId === "string"
        ? data.organizationId
        : "";
    const name = "name" in data && typeof data.name === "string" ? data.name : "";
    const githubUrl =
      "githubUrl" in data && typeof data.githubUrl === "string" ? data.githubUrl : undefined;
    return { organizationId, name, githubUrl };
  })
  .handler(async ({ data }) => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    return createProject(user.id, data);
  });
