// ============================================================================
// GitHub Adapter
// ============================================================================
// Provides git context for a working directory.
// RealGitHubProvider shells out to `git` CLI (read-only).
// MockGitHubProvider returns empty defaults as fallback.
// ============================================================================

import { execSync } from "child_process"
import type { GitContext, GitHubContext } from "../types"

export interface GitHubAdapter {
  getGitContext(cwd: string): GitContext
  isAvailable(): boolean
}

// ---------------------------------------------------------------------------
// Real provider - uses git CLI
// ---------------------------------------------------------------------------

export class RealGitHubProvider implements GitHubAdapter {
  isAvailable(): boolean {
    try {
      execSync("git --version", { stdio: "pipe" })
      return true
    } catch {
      return false
    }
  }

  getGitContext(cwd: string): GitContext {
    const branch = this.run(`git -C ${cwd} rev-parse --abbrev-ref HEAD`)
    const remoteUrl = this.run(`git -C ${cwd} remote get-url origin`)
    const logLine = this.run(`git -C ${cwd} log -1 --format="%H|%s|%an|%aI"`)

    const lastCommit = logLine
      ? this.parseLogLine(logLine)
      : undefined

    return {
      branch: branch || "unknown",
      remoteUrl: remoteUrl || undefined,
      lastCommit,
    }
  }

  private run(cmd: string): string | undefined {
    try {
      return execSync(cmd, { stdio: "pipe", encoding: "utf-8" }).trim() || undefined
    } catch {
      return undefined
    }
  }

  private parseLogLine(line: string): GitContext["lastCommit"] | undefined {
    const parts = line.split("|")
    if (parts.length < 4) return undefined
    const [hash, message, author, date] = parts
    return { hash, message, author, date }
  }
}

// ---------------------------------------------------------------------------
// Mock provider - fallback with empty defaults
// ---------------------------------------------------------------------------

export class MockGitHubProvider implements GitHubAdapter {
  isAvailable(): boolean {
    return false
  }

  getGitContext(_cwd: string): GitContext {
    return { branch: "unknown" }
  }
}

// ---------------------------------------------------------------------------
// Helper: parse GitHub repo name from remote URL
// ---------------------------------------------------------------------------

export function parseGitHubRepoName(remoteUrl: string): string | undefined {
  // ssh://git@github.com/owner/repo.git
  // git@github.com:owner/repo.git
  // https://github.com/owner/repo.git
  const match = remoteUrl.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/)
  return match ? match[1] : undefined
}

// ---------------------------------------------------------------------------
// Resolve GitHubContext from GitContext
// ---------------------------------------------------------------------------

export function resolveGitHubContext(git: GitContext): GitHubContext {
  if (!git.remoteUrl) {
    return { available: false }
  }

  const repoName = parseGitHubRepoName(git.remoteUrl)
  if (!repoName) {
    return { available: false }
  }

  return {
    available: true,
    repo: {
      name: repoName.split("/")[1],
      fullName: repoName,
      url: `https://github.com/${repoName}`,
      defaultBranch: git.defaultBranch ?? "main",
    },
    lastCommit: git.lastCommit,
  }
}

// ---------------------------------------------------------------------------
// Default export: pick real if git is available, else mock
// ---------------------------------------------------------------------------

export function createGitHubAdapter(): GitHubAdapter {
  const real = new RealGitHubProvider()
  return real.isAvailable() ? real : new MockGitHubProvider()
}
