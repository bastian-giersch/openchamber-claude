// ============================================================================
// OpenChamber - Core Data Models
// ============================================================================

export type SessionStatus = "active" | "paused" | "completed" | "error" | "idle"
export type EventSeverity = "info" | "warning" | "error" | "success"
export type DiffStatus = "pending" | "approved" | "rejected"
export type PermissionStatus = "pending" | "approved" | "denied"

// ---- Session ----

export interface Session {
  id: string
  projectName: string
  repoPath: string
  repoUrl?: string
  branch: string
  status: SessionStatus
  model: string
  startedAt: string
  lastActivityAt: string
  completedAt?: string
  workingDirectory: string
  totalMessages: number
  totalToolCalls: number
  totalDiffs: number
  cwd: string
}

// ---- Event / Message ----

export interface SessionEvent {
  id: string
  sessionId: string
  timestamp: string
  type: "message" | "tool_call" | "tool_result" | "diff" | "permission" | "system"
  role: "user" | "assistant" | "system" | "tool"
  content: string
  metadata?: Record<string, unknown>
}

// ---- Tool Call ----

export interface ToolCall {
  id: string
  sessionId: string
  eventId: string
  tool: string
  input: Record<string, unknown>
  output?: string
  status: "running" | "completed" | "failed" | "pending_approval"
  startedAt: string
  completedAt?: string
  duration?: number
}

// ---- Diff / File Change ----

export interface FileDiff {
  id: string
  sessionId: string
  filePath: string
  status: "added" | "modified" | "deleted" | "renamed"
  additions: number
  deletions: number
  diffContent: string
  reviewStatus: DiffStatus
  createdAt: string
}

// ---- Permission Request ----

export interface PermissionRequest {
  id: string
  sessionId: string
  tool: string
  action: string
  description: string
  status: PermissionStatus
  requestedAt: string
  resolvedAt?: string
}

// ---- Workspace / Project ----

export interface Workspace {
  id: string
  name: string
  path: string
  repoUrl?: string
  branch: string
  lastOpenedAt: string
  sessionCount: number
  activeSessionCount: number
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  totalSessions: number
  activeSessions: number
  completedToday: number
  errorsToday: number
  totalDiffs: number
  pendingReviews: number
  recentSessions: Session[]
  eventsToday: number
  toolCallsToday: number
  activeWorkspaces: number
}

// ---- SSE Events ----

export type SSEEventType =
  | "session_updated"
  | "session_created"
  | "session_completed"
  | "new_event"
  | "tool_started"
  | "tool_completed"
  | "diff_created"
  | "permission_requested"

export interface SSEEvent {
  type: SSEEventType
  payload: Record<string, unknown>
  timestamp: string
}

// ---- Notifications ----

export type NotificationType = "info" | "success" | "warning" | "error" | "event"
export type NotificationCategory = "session" | "tool" | "diff" | "system" | "github"

export interface AppNotification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  description?: string
  timestamp: string
  read: boolean
  actionUrl?: string
  metadata?: Record<string, unknown>
}

// ---- GitHub Context ----

export interface GitContext {
  branch: string
  remoteUrl?: string
  lastCommit?: {
    hash: string
    message: string
    author: string
    date: string
  }
  defaultBranch?: string
}

export interface GitHubContext {
  available: boolean
  repo?: {
    name: string
    fullName: string
    url: string
    defaultBranch: string
    description?: string
  }
  openIssues?: number
  openPRs?: number
  lastCommit?: GitContext["lastCommit"]
}

// ---- Health / Connection ----

export interface HealthStatus {
  provider: "real" | "mock"
  watcherActive: boolean
  claudeCodeConnected: boolean
  lastSync: string
  sessionsDir: boolean
  projectsDir: boolean
  uptime: number
}

// ---- Command Bar ----

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  action: () => void
  category: "navigation" | "action" | "session" | "workspace"
  keywords?: string[]
}
