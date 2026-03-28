// ============================================================================
// Mock Provider - implements ClaudeCodeAdapter with sample data
// ============================================================================

import type { ClaudeCodeAdapter } from "../adapters/claude-code-adapter"
import type {
  Session,
  SessionEvent,
  ToolCall,
  FileDiff,
  PermissionRequest,
  Workspace,
  DashboardStats,
} from "../types"
import {
  mockSessions,
  mockEvents,
  mockToolCalls,
  mockDiffs,
  mockPermissions,
  mockWorkspaces,
} from "./data"

class MockProvider implements ClaudeCodeAdapter {
  async getSessions(): Promise<Session[]> {
    return mockSessions
  }

  async getSession(id: string): Promise<Session | null> {
    return mockSessions.find((s) => s.id === id) ?? null
  }

  async getSessionEvents(sessionId: string, limit = 50): Promise<SessionEvent[]> {
    const events = mockEvents[sessionId] ?? []
    return events.slice(-limit)
  }

  async getSessionToolCalls(sessionId: string): Promise<ToolCall[]> {
    return mockToolCalls[sessionId] ?? []
  }

  async getDiffs(sessionId?: string): Promise<FileDiff[]> {
    if (sessionId) return mockDiffs.filter((d) => d.sessionId === sessionId)
    return mockDiffs
  }

  async getDiff(id: string): Promise<FileDiff | null> {
    return mockDiffs.find((d) => d.id === id) ?? null
  }

  async reviewDiff(id: string, status: "approved" | "rejected"): Promise<void> {
    const diff = mockDiffs.find((d) => d.id === id)
    if (diff) diff.reviewStatus = status
  }

  async getPendingPermissions(sessionId: string): Promise<PermissionRequest[]> {
    return mockPermissions.filter((p) => p.sessionId === sessionId && p.status === "pending")
  }

  async resolvePermission(id: string, approved: boolean): Promise<void> {
    const perm = mockPermissions.find((p) => p.id === id)
    if (perm) {
      perm.status = approved ? "approved" : "denied"
      perm.resolvedAt = new Date().toISOString()
    }
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return mockWorkspaces
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split("T")[0]
    const active = mockSessions.filter((s) => s.status === "active")
    const completedToday = mockSessions.filter(
      (s) => s.status === "completed" && s.completedAt?.startsWith(today)
    )
    const errorsToday = mockSessions.filter(
      (s) => s.status === "error" && s.startedAt.startsWith(today)
    )
    const pendingReviews = mockDiffs.filter((d) => d.reviewStatus === "pending")
    const eventsToday = mockSessions.filter((s) => s.startedAt.startsWith(today)).length
    const toolCallsToday = mockSessions.reduce((sum, s) => sum + (s.totalToolCalls || 0), 0)
    const activeWorkspaces = new Set(mockSessions.filter((s) => s.status === "active").map((s) => s.projectName)).size

    return {
      totalSessions: mockSessions.length,
      activeSessions: active.length,
      completedToday: completedToday.length,
      errorsToday: errorsToday.length,
      totalDiffs: mockDiffs.length,
      pendingReviews: pendingReviews.length,
      recentSessions: mockSessions.slice(0, 5),
      eventsToday,
      toolCallsToday,
      activeWorkspaces,
    }
  }
}

export const mockProvider = new MockProvider()
