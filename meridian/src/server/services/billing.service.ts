import { getDb } from "../db";
import { Decimal } from "@prisma/client/runtime/library";

export interface BillingRecord {
  date: Date;
  service: string;
  cost: number;
}

export interface CostSpike {
  date: Date;
  service: string;
  previousCost: number;
  currentCost: number;
  percentageIncrease: number;
  isAnomaly: boolean;
}

export interface CostAnalysis {
  totalCost: number;
  averageDailyCost: number;
  costByService: { service: string; cost: number; percentage: number }[];
  spikes: CostSpike[];
  dailyCosts: { date: string; total: number; [service: string]: any }[];
  dateRange: { start: Date; end: Date };
}

/**
 * Parse CSV content into billing records
 * Expected format: Date,Service,Cost
 * Example: 2026-02-10,EC2,50.25
 */
export function parseBillingCSV(csvContent: string): BillingRecord[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header and one data row");
  }

  const header = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim());
  const dateIdx = header.findIndex((h) => h === "date");
  const serviceIdx = header.findIndex((h) => h === "service");
  const costIdx = header.findIndex((h) => h === "cost");

  if (dateIdx === -1 || serviceIdx === -1 || costIdx === -1) {
    throw new Error("CSV must have 'Date', 'Service', and 'Cost' columns");
  }

  const records: BillingRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((c) => c.trim());

    if (columns.length < 3) continue;

    const dateStr = columns[dateIdx];
    const service = columns[serviceIdx];
    const costStr = columns[costIdx].replace(/[$,]/g, ""); // Remove $ and commas

    try {
      const date = new Date(dateStr);
      const cost = parseFloat(costStr);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
      }
      if (isNaN(cost) || cost < 0) {
        throw new Error(`Invalid cost: ${costStr}`);
      }

      records.push({ date, service, cost });
    } catch (error: any) {
      throw new Error(`Error parsing line ${i + 1}: ${error.message}`);
    }
  }

  return records;
}

/**
 * Store billing records in database
 */
export async function storeBillingRecords(
  projectId: string,
  records: BillingRecord[],
): Promise<{ created: number; duplicates: number }> {
  const db = getDb();
  let created = 0;
  let duplicates = 0;

  for (const record of records) {
    // Check if record already exists (same project, date, service)
    const existing = await db.billingRecord.findFirst({
      where: {
        projectId,
        date: record.date,
        service: record.service,
      },
    });

    if (existing) {
      // Update cost if different
      if (existing.cost.toNumber() !== record.cost) {
        await db.billingRecord.update({
          where: { id: existing.id },
          data: { cost: new Decimal(record.cost) },
        });
      }
      duplicates++;
    } else {
      await db.billingRecord.create({
        data: {
          projectId,
          date: record.date,
          service: record.service,
          cost: new Decimal(record.cost),
        },
      });
      created++;
    }
  }

  return { created, duplicates };
}

/**
 * Analyze costs and detect spikes
 */
export async function analyzeCosts(
  projectId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    spikeThreshold?: number; // Default 50% increase
  },
): Promise<CostAnalysis> {
  const db = getDb();
  const spikeThreshold = options?.spikeThreshold ?? 0.5; // 50%

  // Build query filters
  const where: any = { projectId };
  if (options?.startDate || options?.endDate) {
    where.date = {};
    if (options.startDate) where.date.gte = options.startDate;
    if (options.endDate) where.date.lte = options.endDate;
  }

  // Fetch all billing records
  const records = await db.billingRecord.findMany({
    where,
    orderBy: { date: "asc" },
  });

  if (records.length === 0) {
    return {
      totalCost: 0,
      averageDailyCost: 0,
      costByService: [],
      dailyCosts: [],
      spikes: [],
      dateRange: { start: new Date(), end: new Date() },
    };
  }

  // Calculate totals
  const totalCost = records.reduce((sum, r) => sum + r.cost.toNumber(), 0);
  const dateRange = {
    start: records[0].date,
    end: records[records.length - 1].date,
  };
  const daysDiff = Math.max(
    1,
    Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const averageDailyCost = totalCost / daysDiff;

  // Group by service
  const serviceMap = new Map<string, number>();
  records.forEach((r) => {
    const current = serviceMap.get(r.service) ?? 0;
    serviceMap.set(r.service, current + r.cost.toNumber());
  });

  const costByService = Array.from(serviceMap.entries())
    .map(([service, cost]) => ({
      service,
      cost,
      percentage: (cost / totalCost) * 100,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Detect cost spikes
  const spikes: CostSpike[] = [];
  const dailyServiceCosts = new Map<string, Map<string, number>>();

  // Group by date and service
  records.forEach((r) => {
    const dateKey = r.date.toISOString().split("T")[0];
    if (!dailyServiceCosts.has(dateKey)) {
      dailyServiceCosts.set(dateKey, new Map());
    }
    const serviceCosts = dailyServiceCosts.get(dateKey)!;
    const current = serviceCosts.get(r.service) ?? 0;
    serviceCosts.set(r.service, current + r.cost.toNumber());
  });

  // Compare consecutive days for each service
  const dates = Array.from(dailyServiceCosts.keys()).sort();
  const services = new Set(records.map((r) => r.service));

  services.forEach((service) => {
    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1];
      const currDate = dates[i];

      const prevCost = dailyServiceCosts.get(prevDate)?.get(service) ?? 0;
      const currCost = dailyServiceCosts.get(currDate)?.get(service) ?? 0;

      if (prevCost > 0 && currCost > 0) {
        const increase = (currCost - prevCost) / prevCost;
        if (increase > spikeThreshold) {
          spikes.push({
            date: new Date(currDate),
            service,
            previousCost: prevCost,
            currentCost: currCost,
            percentageIncrease: increase * 100,
            isAnomaly: true,
          });
        }
      }
    }
  });

  // Prepare daily costs for chart
  const dailyCosts = dates.map((date) => {
    const servicesMap = dailyServiceCosts.get(date)!;
    const item: any = { date, total: 0 };
    servicesMap.forEach((cost, service) => {
      item[service] = cost;
      item.total += cost;
    });
    return item;
  });

  return {
    totalCost,
    averageDailyCost,
    costByService,
    spikes: spikes.sort((a, b) => b.percentageIncrease - a.percentageIncrease),
    dailyCosts,
    dateRange,
  };
}

/**
 * Get billing records for a project
 */
export async function getBillingRecords(
  projectId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    service?: string;
    limit?: number;
  },
) {
  const db = getDb();
  const where: any = { projectId };

  if (options?.startDate || options?.endDate) {
    where.date = {};
    if (options.startDate) where.date.gte = options.startDate;
    if (options.endDate) where.date.lte = options.endDate;
  }

  if (options?.service) {
    where.service = options.service;
  }

  return db.billingRecord.findMany({
    where,
    orderBy: { date: "desc" },
    take: options?.limit,
  });
}
