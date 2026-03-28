// ============================================================================
// Claude Code Real Adapter
// ============================================================================
// Reads actual Claude Code session data from ~/.claude/
//
// Directory structure (discovered from real installation):
//   ~/.claude/
//   ├── sessions/              - Active session metadata (PID -> sessionId mapping)
//   │   └── <pid>.json         - {pid, sessionId, cwd, startedAt, kind}
//   ├── projects/              - Per-project session data
//   │   └── <dir-path>/        - Directory path with / replaced by -
//   │       ├── <sessionId>.jsonl  - Full conversation log
//   │       └── <sessionId>/       - Session subdirectory
//   ├── file-history/          - File version backups per session
//   │   └── <sessionId>/       - Contains versioned file snapshots
//   │       └── <hash>@v<N>    - Raw file content at that version
//   ├── history.jsonl          - Global history of all prompts
//   └── settings.json          - Claude Code settings
//
// JSONL line format (per event):
//   type: "user" | "assistant" | "system" | "file-history-snapshot" | "queue-operation"
//   user:    {type, message:{role,content}, sessionId, cwd, gitBranch, timestamp, ...}
//   assistant: {type, message:{role,content:[{type:"text"|"thinking"|"tool_use",...}]}, ...}
//   system:  {type, subtype, content, sessionId, cwd, timestamp, ...}
//
// Tool calls are in assistant.content blocks with type:"tool_use"
// Tool results come back as user messages with content blocks type:"tool_result"
// ============================================================================

import type { ClaudeCodeAdapter } from "./claude-code-adapter"
import type {
  Session,
  SessionEvent,
  ToolCall,
  FileDiff,
  PermissionRequest,
  Workspace,
  DashboardStats,
} from "../types"
import fs from "fs"
import path from "path"
import os from "os"

const CLAUDE_DIR = path.join(os.homedir(), ".claude")
const SESSIONS_DIR = path.join(CLAUDE_DIR, "sessions")
const PROJECTS_DIR = path.join(CLAUDE_DIR, "projects")
const FILE_HISTORY_DIR = path.join(CLAUDE_DIR, "file-history")

// ---- Internal types for JSONL parsing ----

interface JsonlLine {
  type: string
  subtype?: string
  message?: {
    role?: string
    content?: string | ContentBlock[]
    model?: string
    stop_reason?: string
  }
  sessionId?: string
  cwd?: string
  gitBranch?: string
  timestamp?: string
  version?: string
  uuid?: string
  parentUuid?: string
  isMeta?: boolean
  isSidechain?: boolean
  userType?: string
  entrypoint?: string
  promptId?: string
  level?: string
  content?: string
}

interface ContentBlock {
  type: "text" | "thinking" | "tool_use" | "tool_result"
  text?: string
  thinking?: string
  name?: string
  id?: string
  input?: Record<string, unknown>
  tool_use_id?: string
  content?: string | ContentBlock[]
  is_error?: boolean
}

interface ActiveSessionMeta {
  pid: number
  sessionId: string
  cwd: string
  startedAt: number
  kind?: string
  entrypoint?: string
}

interface SessionFileInfo {
  sessionId: string
  jsonlPath: string
  projectDir: string
  projectName: string
  size: number
  modifiedAt: Date
}

// ---- Helpers ----

function readJsonlLines(filePath: string): JsonlLine[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8")
    const lines: JsonlLine[] = []
    for (const line of content.split("\n")) {
      if (!line.trim()) continue
      try {
        lines.push(JSON.parse(line) as JsonlLine)
      } catch {
        // Skip malformed lines
      }
    }
    return lines
  } catch {
    return []
  }
}

function getActiveSessions(): Map<string, ActiveSessionMeta> {
  const map = new Map<string, ActiveSessionMeta>()
  try {
    const files = fs.readdirSync(SESSIONS_DIR)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const raw = fs.readFileSync(path.join(SESSIONS_DIR, file), "utf-8")
        const meta = JSON.parse(raw) as ActiveSessionMeta
        map.set(meta.sessionId, meta)
      } catch {
        // Skip bad files
      }
    }
  } catch {
    // sessions dir may not exist
  }
  return map
}

function discoverAllSessions(): SessionFileInfo[] {
  const sessions: SessionFileInfo[] = []

  try {
    const projectDirs = fs.readdirSync(PROJECTS_DIR)
    for (const projDir of projectDirs) {
      const projPath = path.join(PROJECTS_DIR, projDir)
      if (!fs.statSync(projPath).isDirectory()) continue

      // Convert dir name back to path: -home-basti -> /home/basti
      const projectName = projDir.replace(/^-/, "/").replace(/-/g, "/")

      const files = fs.readdirSync(projPath)
      for (const file of files) {
        if (!file.endsWith(".jsonl")) continue
        const filePath = path.join(projPath, file)
        const stat = fs.statSync(filePath)

        // Session ID from filename
        const sessionId = file.replace(".jsonl", "")
        if (!sessionId || sessionId.length < 8) continue

        sessions.push({
          sessionId,
          jsonlPath: filePath,
          projectDir: projDir,
          projectName,
          size: stat.size,
          modifiedAt: stat.mtime,
        })
      }
    }
  } catch {
    // projects dir may not exist
  }

  return sessions
}

function parseModelFromSession(lines: JsonlLine[]): string {
  for (const line of lines) {
    if (line.type === "assistant" && line.message?.model) {
      return line.message.model
    }
  }
  return "unknown"
}

function parseBranchFromSession(lines: JsonlLine[]): string {
  for (const line of lines) {
    if (line.gitBranch && line.gitBranch !== "HEAD") {
      return line.gitBranch
    }
  }
  return "HEAD"
}

function parseCwdFromSession(lines: JsonlLine[]): string {
  for (const line of lines) {
    if (line.cwd) return line.cwd
  }
  return "unknown"
}

function countMessages(lines: JsonlLine[]): { user: number; assistant: number; toolCalls: number } {
  let user = 0
  let assistant = 0
  let toolCalls = 0

  for (const line of lines) {
    if (line.isMeta) continue
    if (line.type === "user") {
      user++
    } else if (line.type === "assistant") {
      assistant++
      const content = line.message?.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "tool_use") toolCalls++
        }
      }
    }
  }

  return { user, assistant, toolCalls }
}

function extractToolCalls(sessionId: string, lines: JsonlLine[]): ToolCall[] {
  const calls: ToolCall[] = []
  const toolResults = new Map<string, string>()

  // First pass: collect tool results
  for (const line of lines) {
    if (line.type === "user") {
      const content = line.message?.content
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "tool_result" && block.tool_use_id) {
            const resultContent = typeof block.content === "string"
              ? block.content
              : Array.isArray(block.content)
                ? block.content.map((c: ContentBlock) => c.text || "").join("\n")
                : ""
            toolResults.set(block.tool_use_id, resultContent.slice(0, 500))
          }
        }
      }
    }
  }

  // Second pass: collect tool calls
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.type !== "assistant") continue
    const content = line.message?.content
    if (!Array.isArray(content)) continue

    for (const block of content) {
      if (block.type === "tool_use" && block.name && block.id) {
        const output = toolResults.get(block.id)
        const ts = line.timestamp || new Date().toISOString()

        calls.push({
          id: block.id,
          sessionId,
          eventId: line.uuid || "",
          tool: block.name,
          input: block.input || {},
          output: output || undefined,
          status: output ? "completed" : "completed",
          startedAt: ts,
          completedAt: output ? ts : undefined,
        })
      }
    }
  }

  return calls
}

function extractEvents(sessionId: string, lines: JsonlLine[], limit = 200): SessionEvent[] {
  const events: SessionEvent[] = []
  const filtered = lines.filter((l) => !l.isMeta && l.type !== "file-history-snapshot" && l.type !== "queue-operation" && l.type !== "last-prompt")

  const recent = filtered.slice(-limit)

  for (const line of recent) {
    let content = ""
    let role: SessionEvent["role"] = "system"
    let type: SessionEvent["type"] = "system"
    const metadata: Record<string, unknown> = {}

    if (line.type === "user") {
      role = "user"
      type = "message"
      const msgContent = line.message?.content
      if (typeof msgContent === "string") {
        content = msgContent
      } else if (Array.isArray(msgContent)) {
        // Check for tool_result
        const toolResult = msgContent.find((b: ContentBlock) => b.type === "tool_result")
        if (toolResult) {
          type = "tool_result"
          role = "tool"
          content = typeof toolResult.content === "string"
            ? toolResult.content.slice(0, 500)
            : "Tool result received"
          if (toolResult.is_error) metadata.error = true
        } else {
          content = msgContent
            .filter((b: ContentBlock) => b.type === "text" && b.text)
            .map((b: ContentBlock) => b.text)
            .join("\n")
        }
      }
    } else if (line.type === "assistant") {
      role = "assistant"
      type = "message"
      const msgContent = line.message?.content
      if (typeof msgContent === "string") {
        content = msgContent
      } else if (Array.isArray(msgContent)) {
        // Build a summary of blocks
        const parts: string[] = []
        for (const block of msgContent) {
          if (block.type === "text" && block.text) {
            parts.push(block.text)
          } else if (block.type === "tool_use" && block.name) {
            type = "tool_call"
            metadata.tool = block.name
            const input = block.input || {}
            const inputPreview = Object.entries(input)
              .map(([k, v]) => `${k}: ${String(v).slice(0, 80)}`)
              .join(", ")
            parts.push(`${block.name}(${inputPreview})`)
          } else if (block.type === "thinking" && block.thinking) {
            // Skip thinking blocks in summary, they're internal
            continue
          }
        }
        content = parts.join("\n")
      }
    } else if (line.type === "system") {
      role = "system"
      type = "system"
      content = line.content || ""
    }

    if (!content && type !== "tool_call") continue
    content = content.slice(0, 1000) // Truncate very long content

    events.push({
      id: line.uuid || `ev_${Math.random().toString(36).slice(2, 10)}`,
      sessionId,
      timestamp: line.timestamp || new Date().toISOString(),
      type,
      role,
      content,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    })
  }

  return events
}

function extractDiffs(sessionId: string): FileDiff[] {
  const diffs: FileDiff[] = []
  const sessionFhDir = path.join(FILE_HISTORY_DIR, sessionId)

  try {
    if (!fs.existsSync(sessionFhDir)) return diffs

    // Group by file hash (before @v)
    const fileVersions = new Map<string, string[]>()

    for (const entry of fs.readdirSync(sessionFhDir)) {
      const match = entry.match(/^(.+)@v(\d+)$/)
      if (match) {
        const hash = match[1]
        const version = parseInt(match[2])
        const versions = fileVersions.get(hash) || []
        versions.push(entry)
        fileVersions.set(hash, versions)
      }
    }

    // For files with multiple versions, create diffs
    for (const [hash, versions] of fileVersions) {
      if (versions.length < 2) continue

      const sortedVersions = versions.sort((a, b) => {
        const va = parseInt(a.split("@v")[1])
        const vb = parseInt(b.split("@v")[1])
        return va - vb
      })

      // Get the last two versions
      const oldFile = path.join(sessionFhDir, sortedVersions[sortedVersions.length - 2])
      const newFile = path.join(sessionFhDir, sortedVersions[sortedVersions.length - 1])

      try {
        const oldContent = fs.readFileSync(oldFile, "utf-8")
        const newContent = fs.readFileSync(newFile, "utf-8")

        // Simple diff generation
        const additions = newContent.split("\n").length
        const deletions = oldContent.split("\n").length
        const diffLines: string[] = []

        diffLines.push(`--- a/file (v${sortedVersions.length - 1})`)
        diffLines.push(`+++ b/file (v${sortedVersions.length})`)

        // Simple line-by-line diff
        const oldLines = oldContent.split("\n")
        const newLines = newContent.split("\n")

        // Show added lines
        for (const line of newLines) {
          if (!oldLines.includes(line)) {
            diffLines.push(`+${line}`)
          }
        }
        // Show removed lines
        for (const line of oldLines) {
          if (!newLines.includes(line)) {
            diffLines.push(`-${line}`)
          }
        }

        const addCount = diffLines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length
        const delCount = diffLines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length

        diffs.push({
          id: `diff_${sessionId.slice(0, 8)}_${hash.slice(0, 8)}`,
          sessionId,
          filePath: `file-history/${hash.slice(0, 16)}`,
          status: "modified",
          additions: addCount,
          deletions: delCount,
          diffContent: diffLines.join("\n"),
          reviewStatus: "pending",
          createdAt: fs.statSync(newFile).mtime.toISOString(),
        })
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // file-history dir may not exist
  }

  return diffs
}

// ---- Real Provider ----

class ClaudeCodeRealProvider implements ClaudeCodeAdapter {
  async getSessions(): Promise<Session[]> {
    const activeSessions = getActiveSessions()
    const allFiles = discoverAllSessions()

    return allFiles.map((sf) => {
      const lines = readJsonlLines(sf.jsonlPath)
      const counts = countMessages(lines)
      const isActive = activeSessions.has(sf.sessionId)
      const branch = parseBranchFromSession(lines)
      const cwd = parseCwdFromSession(lines)
      const model = parseModelFromSession(lines)

      // Find first and last timestamps
      let startedAt = ""
      let lastActivityAt = ""
      for (const line of lines) {
        if (line.timestamp) {
          if (!startedAt || line.timestamp < startedAt) startedAt = line.timestamp
          if (!lastActivityAt || line.timestamp > lastActivityAt) lastActivityAt = line.timestamp
        }
      }

      // Determine project name from cwd
      const projectName = path.basename(cwd) || sf.projectName

      // Determine status
      let status: Session["status"] = "completed"
      if (isActive) {
        status = "active"
      } else if (sf.size < 500) {
        status = "idle"
      }

      // Check for errors in recent lines
      if (status === "completed") {
        const recentLines = lines.slice(-10)
        for (const line of recentLines) {
          if (line.type === "user") {
            const content = line.message?.content
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === "tool_result" && block.is_error) {
                  // Has errors, but still completed
                }
              }
            }
          }
        }
      }

      return {
        id: sf.sessionId,
        projectName,
        repoPath: cwd,
        branch,
        status,
        model: model || "claude-sonnet-4-6",
        startedAt: startedAt || sf.modifiedAt.toISOString(),
        lastActivityAt: lastActivityAt || sf.modifiedAt.toISOString(),
        workingDirectory: cwd,
        totalMessages: counts.user + counts.assistant,
        totalToolCalls: counts.toolCalls,
        totalDiffs: 0, // Computed separately
        cwd,
      }
    }).sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
  }

  async getSession(id: string): Promise<Session | null> {
    const sessions = await this.getSessions()
    return sessions.find((s) => s.id === id) ?? null
  }

  async getSessionEvents(sessionId: string, limit = 200): Promise<SessionEvent[]> {
    const sf = this.findSessionFile(sessionId)
    if (!sf) return []

    const lines = readJsonlLines(sf.jsonlPath)
    return extractEvents(sessionId, lines, limit)
  }

  async getSessionToolCalls(sessionId: string): Promise<ToolCall[]> {
    const sf = this.findSessionFile(sessionId)
    if (!sf) return []

    const lines = readJsonlLines(sf.jsonlPath)
    return extractToolCalls(sessionId, lines)
  }

  async getDiffs(sessionId?: string): Promise<FileDiff[]> {
    if (sessionId) {
      return extractDiffs(sessionId)
    }

    // Get diffs from all sessions
    const sessions = await this.getSessions()
    const allDiffs: FileDiff[] = []
    for (const session of sessions.slice(0, 20)) {
      allDiffs.push(...extractDiffs(session.id))
    }
    return allDiffs
  }

  async getDiff(id: string): Promise<FileDiff | null> {
    const allDiffs = await this.getDiffs()
    return allDiffs.find((d) => d.id === id) ?? null
  }

  async reviewDiff(_id: string, _status: "approved" | "rejected"): Promise<void> {
    // No-op for real adapter — reviews aren't persisted back to Claude Code
  }

  async getPendingPermissions(_sessionId: string): Promise<PermissionRequest[]> {
    // Real permissions come through Claude Code's own UI
    // This could be extended with Claude Code's Remote Control API
    return []
  }

  async resolvePermission(_id: string, _approved: boolean): Promise<void> {
    // No-op — permissions are handled by Claude Code itself
  }

  async getWorkspaces(): Promise<Workspace[]> {
    const sessions = await this.getSessions()
    const workspaceMap = new Map<string, { name: string; path: string; sessionIds: string[]; activeIds: string[] }>()

    for (const session of sessions) {
      const key = session.cwd
      const existing = workspaceMap.get(key)
      if (existing) {
        existing.sessionIds.push(session.id)
        if (session.status === "active") existing.activeIds.push(session.id)
      } else {
        workspaceMap.set(key, {
          name: session.projectName,
          path: session.cwd,
          sessionIds: [session.id],
          activeIds: session.status === "active" ? [session.id] : [],
        })
      }
    }

    return Array.from(workspaceMap.entries()).map(([key, ws]) => ({
      id: `ws_${key.replace(/[^a-zA-Z0-9]/g, "_")}`,
      name: ws.name,
      path: ws.path,
      branch: "HEAD",
      lastOpenedAt: new Date().toISOString(),
      sessionCount: ws.sessionIds.length,
      activeSessionCount: ws.activeIds.length,
    }))
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const sessions = await this.getSessions()
    const active = sessions.filter((s) => s.status === "active")
    const today = new Date().toISOString().split("T")[0]
    const completedToday = sessions.filter(
      (s) => s.status === "completed" && s.startedAt.startsWith(today)
    )
    const diffs = await this.getDiffs()

    const workspaces = await this.getWorkspaces()

    return {
      totalSessions: sessions.length,
      activeSessions: active.length,
      completedToday: completedToday.length,
      errorsToday: 0,
      totalDiffs: diffs.length,
      pendingReviews: diffs.filter((d) => d.reviewStatus === "pending").length,
      recentSessions: sessions.slice(0, 5),
      eventsToday: sessions.filter((s) => s.startedAt.startsWith(today)).length,
      toolCallsToday: sessions.reduce((sum, s) => sum + (s.totalToolCalls || 0), 0),
      activeWorkspaces: workspaces.filter((w) => w.activeSessionCount > 0).length,
    }
  }

  // ---- Private helpers ----

  private findSessionFile(sessionId: string): SessionFileInfo | null {
    try {
      const projectDirs = fs.readdirSync(PROJECTS_DIR)
      for (const projDir of projectDirs) {
        const jsonlPath = path.join(PROJECTS_DIR, projDir, `${sessionId}.jsonl`)
        if (fs.existsSync(jsonlPath)) {
          const stat = fs.statSync(jsonlPath)
          return {
            sessionId,
            jsonlPath,
            projectDir: projDir,
            projectName: projDir.replace(/^-/, "/").replace(/-/g, "/"),
            size: stat.size,
            modifiedAt: stat.mtime,
          }
        }
      }
    } catch {
      // ignore
    }
    return null
  }
}

export const realProvider = new ClaudeCodeRealProvider()
