/**
 * Client-side API helpers for making requests to server endpoints
 */

export async function uploadBillingCSV(projectId: string, csvContent: string) {
  const res = await fetch("/api/billing/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, csvContent }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Upload failed");
  }

  return res.json();
}

export async function getBillingRecords(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    service?: string;
    limit?: number;
  },
) {
  const params = new URLSearchParams({ projectId, ...options } as any);
  const res = await fetch(`/api/billing?${params}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch records");
  }

  return res.json();
}

export async function analyzeCosts(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    spikeThreshold?: number;
  },
) {
  const params = new URLSearchParams({ projectId, ...options } as any);
  const res = await fetch(`/api/billing/analysis?${params}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to analyze costs");
  }

  return res.json();
}

export async function connectGitHub(projectId: string, githubUrl: string, token?: string) {
  const res = await fetch("/api/github/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, githubUrl, token }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to connect GitHub");
  }

  return res.json();
}

export async function getCommits(
  projectId: string,
  options?: {
    limit?: number;
    since?: string;
    until?: string;
  },
) {
  const params = new URLSearchParams({ projectId, ...options } as any);
  const res = await fetch(`/api/github/commits?${params}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch commits");
  }

  return res.json();
}

export async function syncGitHub(
  projectId: string,
  token?: string,
  options?: {
    since?: string;
    limit?: number;
  },
) {
  const res = await fetch("/api/github/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, token, ...options }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to sync commits");
  }

  return res.json();
}

export async function correlateCosts(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    spikeThreshold?: number;
  },
) {
  const params = new URLSearchParams({ projectId, ...options } as any);
  const res = await fetch(`/api/correlation/analyze?${params}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to correlate costs");
  }

  return res.json();
}

export async function getInsights(projectId: string, limit?: number) {
  const params = new URLSearchParams({ projectId, limit: limit?.toString() || "10" });
  const res = await fetch(`/api/insights?${params}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch insights");
  }

  return res.json();
}

export async function generateInsight(
  projectId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    spikeThreshold?: number;
  },
) {
  const res = await fetch("/api/insights/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, ...options }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate insight");
  }

  return res.json();
}
