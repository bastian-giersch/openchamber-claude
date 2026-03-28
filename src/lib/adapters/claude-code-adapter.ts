// ============================================================================
// Claude Code Adapter Interface
// ============================================================================
// This defines the contract for integrating with real Claude Code sessions.
// The MockProvider implements this with sample data.
// When real integration is possible, create a RealProvider that:
//   1. Reads Claude Code's session files from ~/.claude/
//   2. Watches for real-time changes via filesystem events
//   3. Parses conversation JSON, tool calls, diffs
// ============================================================================

import type {
  Session,
  SessionEvent,
  ToolCall,
  FileDiff,
  PermissionRequest,
  Workspace,
  DashboardStats,
} from "../types"

export interface ClaudeCodeAdapter {
  // Sessions
  getSessions(): Promise<Session[]>
  getSession(id: string): Promise<Session | null>
  getSessionEvents(sessionId: string, limit?: number): Promise<SessionEvent[]>
  getSessionToolCalls(sessionId: string): Promise<ToolCall[]>

  // Diffs
  getDiffs(sessionId?: string): Promise<FileDiff[]>
  getDiff(id: string): Promise<FileDiff | null>
  reviewDiff(id: string, status: "approved" | "rejected"): Promise<void>

  // Permissions
  getPendingPermissions(sessionId: string): Promise<PermissionRequest[]>
  resolvePermission(id: string, approved: boolean): Promise<void>

  // Workspaces
  getWorkspaces(): Promise<Workspace[]>

  // Stats
  getDashboardStats(): Promise<DashboardStats>
}
