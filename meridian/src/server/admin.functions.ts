import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { requireAuth } from "./require-auth";

export const getAdminDashboardStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();

  const [usersCount, orgsCount, projectsCount, billingStats, insightsCount] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.project.count(),
    db.billingRecord.aggregate({
      _sum: {
        cost: true,
      },
    }),
    db.insight.count(),
  ]);

  return {
    usersCount,
    orgsCount,
    projectsCount,
    totalSpend: billingStats._sum.cost ? Number(billingStats._sum.cost) : 0,
    insightsCount,
  };
});

export const listAllUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { organizations: true },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    orgCount: user._count.organizations,
  }));
});

export const updateUserRoleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    const { userId, role } = data as Record<string, unknown>;
    if (typeof userId !== "string" || typeof role !== "string") throw new Error("Invalid types");
    return { userId, role };
  })
  .handler(async ({ data: { userId, role } }) => {
    const db = getDb();

    if (role !== "ADMIN" && role !== "USER") {
      throw new Error("Invalid role");
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { role: role as "ADMIN" | "USER" },
    });

    return { success: true, role: updated.role };
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    const { userId } = data as Record<string, unknown>;
    if (typeof userId !== "string") throw new Error("Invalid type");
    return { userId };
  })
  .handler(async ({ data: { userId } }) => {
    const db = getDb();
    await db.user.delete({ where: { id: userId } });
    return { success: true };
  });

export const listAllOrganizationsFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();

  const orgs = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, email: true } },
      projects: {
        include: {
          billingRecords: {
            select: { cost: true },
          },
        },
      },
      _count: {
        select: { projects: true },
      },
    },
  });

  return orgs.map((org) => {
    let totalCost = 0;
    for (const proj of org.projects) {
      for (const record of proj.billingRecords) {
        totalCost += Number(record.cost);
      }
    }

    return {
      id: org.id,
      name: org.name,
      owner: org.owner,
      createdAt: org.createdAt,
      projectCount: org._count.projects,
      totalSpend: totalCost,
    };
  });
});

export const deleteOrganizationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    const { orgId } = data as Record<string, unknown>;
    if (typeof orgId !== "string") throw new Error("Invalid type");
    return { orgId };
  })
  .handler(async ({ data: { orgId } }) => {
    const db = getDb();
    await db.organization.delete({ where: { id: orgId } });
    return { success: true };
  });

export const listAllProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true } },
      billingRecords: { select: { cost: true } },
      _count: { select: { deployments: true, insights: true } },
    },
  });
  return projects.map((p) => {
    const totalCost = p.billingRecords.reduce((sum, record) => sum + Number(record.cost), 0);
    return {
      id: p.id,
      name: p.name,
      githubUrl: p.githubUrl,
      organizationName: p.organization.name,
      totalSpend: totalCost,
      deploymentsCount: p._count.deployments,
      insightsCount: p._count.insights,
      createdAt: p.createdAt,
    };
  });
});

export const deleteProjectAdminFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null) throw new Error("Invalid input");
    const { projectId } = data as Record<string, unknown>;
    if (typeof projectId !== "string") throw new Error("Invalid type");
    return { projectId };
  })
  .handler(async ({ data: { projectId } }) => {
    const db = getDb();
    await db.project.delete({ where: { id: projectId } });
    return { success: true };
  });
