import { getDb } from "../db";
import { analyzeCosts, CostSpike } from "./billing.service";

export interface DeploymentCorrelation {
  spike: CostSpike;
  deployment: {
    id: string;
    commitHash: string;
    message: string;
    author: string;
    date: Date;
  } | null;
  confidenceScore: number;
  reason: string;
}

export interface CorrelationResult {
  correlations: DeploymentCorrelation[];
  totalSpikes: number;
  correlatedSpikes: number;
  avgConfidenceScore: number;
}

/**
 * Find deployments near a specific date (within time window)
 */
async function findDeploymentsNearDate(
  projectId: string,
  targetDate: Date,
  windowHours: number = 48,
): Promise<any[]> {
  const db = getDb();
  const windowStart = new Date(targetDate.getTime() - windowHours * 60 * 60 * 1000);
  const windowEnd = new Date(targetDate.getTime() + 12 * 60 * 60 * 1000); // 12 hours after

  return db.deployment.findMany({
    where: {
      projectId,
      createdAt: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Calculate confidence score based on time proximity and context
 */
function calculateConfidenceScore(
  spikeDate: Date,
  deploymentDate: Date,
  commitMessage: string,
): number {
  let score = 0;

  // Time proximity (max 60 points)
  const timeDiffHours = Math.abs(spikeDate.getTime() - deploymentDate.getTime()) / (1000 * 60 * 60);
  if (timeDiffHours <= 1) {
    score += 60;
  } else if (timeDiffHours <= 6) {
    score += 50;
  } else if (timeDiffHours <= 24) {
    score += 40;
  } else if (timeDiffHours <= 48) {
    score += 30;
  } else {
    score += 20;
  }

  // Commit message keywords (max 40 points)
  const message = commitMessage.toLowerCase();
  const infrastructureKeywords = [
    "infrastructure",
    "deploy",
    "scale",
    "worker",
    "server",
    "instance",
    "container",
    "kubernetes",
    "docker",
    "lambda",
    "function",
    "database",
    "cache",
    "redis",
    "queue",
    "batch",
    "cron",
    "job",
  ];

  const performanceKeywords = [
    "performance",
    "optimize",
    "memory",
    "cpu",
    "processing",
    "compute",
    "load",
    "parallel",
    "concurrent",
  ];

  const costKeywords = ["cost", "expensive", "resource", "usage", "consumption"];

  let keywordScore = 0;
  infrastructureKeywords.forEach((keyword) => {
    if (message.includes(keyword)) keywordScore += 15;
  });
  performanceKeywords.forEach((keyword) => {
    if (message.includes(keyword)) keywordScore += 10;
  });
  costKeywords.forEach((keyword) => {
    if (message.includes(keyword)) keywordScore += 5;
  });

  score += Math.min(40, keywordScore);

  return Math.min(100, score);
}

/**
 * Generate explanation for correlation
 */
function generateCorrelationReason(
  spike: CostSpike,
  deployment: any | null,
  confidenceScore: number,
): string {
  if (!deployment) {
    return `Cost spike detected for ${spike.service}, but no recent deployments found within 48 hours.`;
  }

  const timeDiffHours = Math.abs(spike.date.getTime() - deployment.createdAt.getTime()) / (1000 * 60 * 60);
  const timeDesc = timeDiffHours < 1 ? "less than an hour" : `${Math.round(timeDiffHours)} hours`;

  let reason = `${spike.service} cost increased by ${spike.percentageIncrease.toFixed(1)}% `;
  reason += `from $${spike.previousCost.toFixed(2)} to $${spike.currentCost.toFixed(2)}. `;
  reason += `A deployment occurred ${timeDesc} before this spike. `;

  if (confidenceScore >= 80) {
    reason += `High confidence (${confidenceScore}%) this deployment caused the cost increase.`;
  } else if (confidenceScore >= 60) {
    reason += `Moderate confidence (${confidenceScore}%) this deployment is related to the cost increase.`;
  } else {
    reason += `Low confidence (${confidenceScore}%), but timing suggests possible correlation.`;
  }

  return reason;
}

/**
 * Correlate cost spikes with deployments
 */
export async function correlateDeploymentsWithCosts(
  projectId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    spikeThreshold?: number;
  },
): Promise<CorrelationResult> {
  // Get cost analysis with spikes
  const analysis = await analyzeCosts(projectId, options);
  const spikes = analysis.spikes;

  if (spikes.length === 0) {
    return {
      correlations: [],
      totalSpikes: 0,
      correlatedSpikes: 0,
      avgConfidenceScore: 0,
    };
  }

  const correlations: DeploymentCorrelation[] = [];
  let totalConfidence = 0;
  let correlatedCount = 0;

  for (const spike of spikes) {
    // Find deployments near this spike
    const deployments = await findDeploymentsNearDate(projectId, spike.date);

    if (deployments.length === 0) {
      correlations.push({
        spike,
        deployment: null,
        confidenceScore: 0,
        reason: generateCorrelationReason(spike, null, 0),
      });
      continue;
    }

    // Find best matching deployment
    let bestDeployment = deployments[0];
    let bestScore = calculateConfidenceScore(spike.date, deployments[0].createdAt, deployments[0].message);

    for (const deployment of deployments) {
      const score = calculateConfidenceScore(spike.date, deployment.createdAt, deployment.message);
      if (score > bestScore) {
        bestScore = score;
        bestDeployment = deployment;
      }
    }

    correlations.push({
      spike,
      deployment: {
        id: bestDeployment.id,
        commitHash: bestDeployment.commitHash,
        message: bestDeployment.message,
        author: bestDeployment.author,
        date: bestDeployment.createdAt,
      },
      confidenceScore: bestScore,
      reason: generateCorrelationReason(spike, bestDeployment, bestScore),
    });

    totalConfidence += bestScore;
    if (bestScore > 0) correlatedCount++;
  }

  return {
    correlations,
    totalSpikes: spikes.length,
    correlatedSpikes: correlatedCount,
    avgConfidenceScore: correlatedCount > 0 ? totalConfidence / correlatedCount : 0,
  };
}
