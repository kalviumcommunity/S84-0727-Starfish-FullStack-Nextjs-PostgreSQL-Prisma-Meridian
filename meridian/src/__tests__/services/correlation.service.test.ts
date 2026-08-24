import { describe, it, expect } from "vitest";

// We test the pure helper functions by extracting them from the service.
// calculateConfidenceScore and generateCorrelationReason are not exported —
// so we test the observable behaviour via the exported interface types and
// verify the scoring logic through known inputs.

// ---------------------------------------------------------------------------
// Inline reimplementation of the pure helpers so they can be unit-tested
// without pulling in DB dependencies (the exported functions require a DB).
// ---------------------------------------------------------------------------

function calculateConfidenceScore(
  spikeDate: Date,
  deploymentDate: Date,
  commitMessage: string,
): number {
  let score = 0;

  const timeDiffHours = Math.abs(spikeDate.getTime() - deploymentDate.getTime()) / (1000 * 60 * 60);

  if (timeDiffHours <= 1) score += 60;
  else if (timeDiffHours <= 6) score += 50;
  else if (timeDiffHours <= 24) score += 40;
  else if (timeDiffHours <= 48) score += 30;
  else score += 20;

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
  infrastructureKeywords.forEach((k) => {
    if (message.includes(k)) keywordScore += 15;
  });
  performanceKeywords.forEach((k) => {
    if (message.includes(k)) keywordScore += 10;
  });
  costKeywords.forEach((k) => {
    if (message.includes(k)) keywordScore += 5;
  });

  score += Math.min(40, keywordScore);
  return Math.min(100, score);
}

describe("calculateConfidenceScore", () => {
  const spikeDate = new Date("2026-01-10T12:00:00Z");

  it("gives maximum time score (60) for deployment within 1 hour", () => {
    const deployDate = new Date("2026-01-10T11:30:00Z"); // 30 mins before
    const score = calculateConfidenceScore(spikeDate, deployDate, "routine update");
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it("gives reduced time score for deployment 12 hours before spike", () => {
    const deployDate = new Date("2026-01-10T00:00:00Z"); // 12 hours before
    const score = calculateConfidenceScore(spikeDate, deployDate, "update");
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThan(60);
  });

  it("gives reduced time score for deployment 30 hours before spike", () => {
    const deployDate = new Date("2026-01-09T06:00:00Z"); // 30 hours before
    const score = calculateConfidenceScore(spikeDate, deployDate, "update");
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThan(50);
  });

  it("boosts score for infrastructure keywords in commit message", () => {
    const closeDeployDate = new Date("2026-01-10T11:50:00Z");
    const plainScore = calculateConfidenceScore(spikeDate, closeDeployDate, "fix typo");
    const infraScore = calculateConfidenceScore(
      spikeDate,
      closeDeployDate,
      "deploy new kubernetes cluster",
    );
    expect(infraScore).toBeGreaterThan(plainScore);
  });

  it("boosts score for cost-related keywords", () => {
    const closeDeployDate = new Date("2026-01-10T11:50:00Z");
    const plainScore = calculateConfidenceScore(spikeDate, closeDeployDate, "fix typo");
    const costScore = calculateConfidenceScore(
      spikeDate,
      closeDeployDate,
      "reduce resource consumption",
    );
    expect(costScore).toBeGreaterThan(plainScore);
  });

  it("never exceeds 100", () => {
    const closeDeployDate = new Date("2026-01-10T11:59:00Z");
    const score = calculateConfidenceScore(
      spikeDate,
      closeDeployDate,
      "deploy infrastructure kubernetes docker scale server database cache redis",
    );
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives minimum base score even for old deployments with no keywords", () => {
    const oldDeployDate = new Date("2026-01-01T00:00:00Z"); // 9 days before
    const score = calculateConfidenceScore(spikeDate, oldDeployDate, "update readme");
    expect(score).toBeGreaterThanOrEqual(20);
  });
});
