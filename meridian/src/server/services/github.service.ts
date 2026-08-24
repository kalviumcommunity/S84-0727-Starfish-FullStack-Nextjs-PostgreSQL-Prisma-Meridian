import { Octokit } from "@octokit/rest";
import { getDb } from "../db";

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  fullName: string;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  url: string;
}

/**
 * Parse GitHub URL to extract owner and repo
 * Supports: https://github.com/owner/repo or git@github.com:owner/repo.git
 */
export function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  try {
    // HTTPS format
    const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (httpsMatch) {
      const [, owner, repo] = httpsMatch;
      // Remove trailing slashes or queries if any, and remove .git
      const cleanRepo = repo.split(/[?#/]/)[0].replace(/\.git$/, "");
      return {
        owner,
        repo: cleanRepo,
        fullName: `${owner}/${cleanRepo}`,
        url: `https://github.com/${owner}/${cleanRepo}`,
      };
    }

    // SSH format
    const sshMatch = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
    if (sshMatch) {
      const [, owner, repo] = sshMatch;
      return {
        owner,
        repo: repo.replace(/\.git$/, ""),
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch commits from a GitHub repository
 * Uses GitHub Personal Access Token if available (optional for public repos)
 */
export async function fetchGitHubCommits(
  githubUrl: string,
  token?: string,
  options?: {
    since?: Date;
    until?: Date;
    limit?: number;
  },
): Promise<GitHubCommit[]> {
  const repoInfo = parseGitHubUrl(githubUrl);
  if (!repoInfo) {
    throw new Error("Invalid GitHub URL");
  }

  // Initialize Octokit with or without auth (works for public repos without token)
  const octokit = new Octokit(token ? { auth: token } : {});

  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      since: options?.since?.toISOString(),
      until: options?.until?.toISOString(),
      per_page: options?.limit ?? 100,
    });

    return commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name ?? "Unknown",
      date: new Date(commit.commit.author?.date ?? Date.now()),
      url: commit.html_url,
    }));
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error("Repository not found or not accessible");
    }
    if (error.status === 401) {
      throw new Error("Invalid GitHub token");
    }
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
}

/**
 * Sync GitHub commits to database as deployments
 */
export async function syncCommitsToDeployments(
  projectId: string,
  githubUrl: string,
  token?: string,
  options?: {
    since?: Date;
    limit?: number;
  },
): Promise<{ created: number; updated: number }> {
  const commits = await fetchGitHubCommits(githubUrl, token, options);
  const db = getDb();

  let created = 0;
  let updated = 0;

  for (const commit of commits) {
    const existing = await db.deployment.findFirst({
      where: {
        projectId,
        commitHash: commit.sha,
      },
    });

    if (!existing) {
      await db.deployment.create({
        data: {
          projectId,
          commitHash: commit.sha,
          message: commit.message,
          author: commit.author,
          createdAt: commit.date,
        },
      });
      created++;
    } else {
      // Update if message changed (edge case)
      if (existing.message !== commit.message) {
        await db.deployment.update({
          where: { id: existing.id },
          data: { message: commit.message },
        });
        updated++;
      }
    }
  }

  return { created, updated };
}

/**
 * Validate GitHub URL and check if repository is accessible
 */
export async function validateGitHubRepo(
  githubUrl: string,
  token?: string,
): Promise<{ valid: boolean; error?: string; repoInfo?: GitHubRepoInfo }> {
  const repoInfo = parseGitHubUrl(githubUrl);
  if (!repoInfo) {
    return { valid: false, error: "Invalid GitHub URL format" };
  }

  const octokit = new Octokit(token ? { auth: token } : {});

  try {
    await octokit.repos.get({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
    });
    return { valid: true, repoInfo };
  } catch (error: any) {
    if (error.status === 404) {
      return { valid: false, error: "Repository not found or not accessible" };
    }
    if (error.status === 401) {
      return { valid: false, error: "Invalid GitHub token" };
    }
    return { valid: false, error: "Failed to validate repository" };
  }
}
