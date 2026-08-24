import { getDb } from "../db";
import { createOrganizationSchema, createProjectSchema } from "../http";

export async function createOrganization(userId: string, input: { name: string }) {
  const data = createOrganizationSchema.parse(input);

  return getDb().organization.create({
    data: {
      name: data.name,
      ownerId: userId,
    },
    include: {
      _count: { select: { projects: true } },
    },
  });
}

export async function listOrganizations(userId: string) {
  return getDb().organization.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true } },
    },
  });
}

export async function createProject(
  userId: string,
  input: { organizationId: string; name: string; githubUrl?: string },
) {
  const data = createProjectSchema.parse(input);

  const organization = await getDb().organization.findFirst({
    where: { id: data.organizationId, ownerId: userId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return getDb().project.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      githubUrl: data.githubUrl || null,
    },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { deployments: true, billingRecords: true, insights: true } },
    },
  });
}

export async function getProject(userId: string, projectId: string) {
  const project = await getDb().project.findFirst({
    where: {
      id: projectId,
      organization: { ownerId: userId },
    },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { deployments: true, billingRecords: true, insights: true } },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function listProjects(userId: string, organizationId?: string) {
  return getDb().project.findMany({
    where: {
      organization: { ownerId: userId },
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { deployments: true, billingRecords: true, insights: true } },
    },
  });
}
