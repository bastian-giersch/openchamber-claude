import type {
  Session,
  SessionEvent,
  ToolCall,
  FileDiff,
  PermissionRequest,
  Workspace,
} from "../types"

const NOW = new Date().toISOString()
const H = (h: number) => new Date(Date.now() - h * 3600000).toISOString()
const M = (m: number) => new Date(Date.now() - m * 60000).toISOString()

// ---- Sessions ----

export const mockSessions: Session[] = [
  {
    id: "sess_01",
    projectName: "openchamber",
    repoPath: "/home/basti/openchamber",
    repoUrl: "https://github.com/basti/openchamber",
    branch: "main",
    status: "active",
    model: "claude-sonnet-4-6",
    startedAt: H(2),
    lastActivityAt: M(2),
    workingDirectory: "/home/basti/openchamber",
    totalMessages: 24,
    totalToolCalls: 38,
    totalDiffs: 7,
    cwd: "/home/basti/openchamber",
  },
  {
    id: "sess_02",
    projectName: "scalesite",
    repoPath: "/home/basti/scalesite",
    repoUrl: "https://github.com/basti/scalesite",
    branch: "feat/new-landing",
    status: "active",
    model: "claude-sonnet-4-6",
    startedAt: H(4),
    lastActivityAt: M(15),
    workingDirectory: "/home/basti/scalesite",
    totalMessages: 42,
    totalToolCalls: 67,
    totalDiffs: 12,
    cwd: "/home/basti/scalesite",
  },
  {
    id: "sess_03",
    projectName: "portfolio",
    repoPath: "/home/basti/portfolio",
    branch: "main",
    status: "paused",
    model: "claude-opus-4-6",
    startedAt: H(8),
    lastActivityAt: H(1),
    workingDirectory: "/home/basti/portfolio",
    totalMessages: 18,
    totalToolCalls: 22,
    totalDiffs: 4,
    cwd: "/home/basti/portfolio",
  },
  {
    id: "sess_04",
    projectName: "openchamber",
    repoPath: "/home/basti/openchamber",
    branch: "feat/diff-viewer",
    status: "completed",
    model: "claude-sonnet-4-6",
    startedAt: H(24),
    lastActivityAt: H(20),
    completedAt: H(20),
    workingDirectory: "/home/basti/openchamber",
    totalMessages: 56,
    totalToolCalls: 89,
    totalDiffs: 15,
    cwd: "/home/basti/openchamber",
  },
  {
    id: "sess_05",
    projectName: "discord-bot",
    repoPath: "/home/basti/discord-bot",
    branch: "main",
    status: "error",
    model: "claude-sonnet-4-6",
    startedAt: H(6),
    lastActivityAt: H(5.5),
    workingDirectory: "/home/basti/discord-bot",
    totalMessages: 8,
    totalToolCalls: 3,
    totalDiffs: 0,
    cwd: "/home/basti/discord-bot",
  },
  {
    id: "sess_06",
    projectName: "scalesite",
    repoPath: "/home/basti/scalesite",
    branch: "fix/invoice-pdf",
    status: "completed",
    model: "claude-sonnet-4-6",
    startedAt: H(48),
    lastActivityAt: H(46),
    completedAt: H(46),
    workingDirectory: "/home/basti/scalesite",
    totalMessages: 31,
    totalToolCalls: 45,
    totalDiffs: 8,
    cwd: "/home/basti/scalesite",
  },
]

// ---- Events ----

export const mockEvents: Record<string, SessionEvent[]> = {
  sess_01: [
    { id: "ev_01", sessionId: "sess_01", timestamp: H(2), type: "system", role: "system", content: "Session started in /home/basti/openchamber" },
    { id: "ev_02", sessionId: "sess_01", timestamp: H(1.9), type: "message", role: "user", content: "Build me a session dashboard component with a table showing all active sessions, their status, project name, and last activity time." },
    { id: "ev_03", sessionId: "sess_01", timestamp: H(1.8), type: "tool_call", role: "assistant", content: "Read file src/lib/types/index.ts", metadata: { tool: "Read", file: "src/lib/types/index.ts" } },
    { id: "ev_04", sessionId: "sess_01", timestamp: H(1.7), type: "tool_result", role: "tool", content: "File read successfully (85 lines)", metadata: { tool: "Read", success: true } },
    { id: "ev_05", sessionId: "sess_01", timestamp: H(1.6), type: "message", role: "assistant", content: "I'll create a SessionDashboard component with a clean table layout. Let me set up the component with status indicators and sorting." },
    { id: "ev_06", sessionId: "sess_01", timestamp: H(1.5), type: "tool_call", role: "assistant", content: "Write file src/components/sessions/SessionTable.tsx", metadata: { tool: "Write", file: "src/components/sessions/SessionTable.tsx" } },
    { id: "ev_07", sessionId: "sess_01", timestamp: H(1.4), type: "tool_result", role: "tool", content: "File written successfully", metadata: { tool: "Write", success: true } },
    { id: "ev_08", sessionId: "sess_01", timestamp: M(30), type: "message", role: "user", content: "Add SSE endpoint for realtime session updates" },
    { id: "ev_09", sessionId: "sess_01", timestamp: M(28), type: "tool_call", role: "assistant", content: "Write file src/app/api/events/route.ts", metadata: { tool: "Write", file: "src/app/api/events/route.ts" } },
    { id: "ev_10", sessionId: "sess_01", timestamp: M(2), type: "message", role: "assistant", content: "SSE endpoint is ready. Events will stream session status changes in real-time." },
  ],
  sess_02: [
    { id: "ev_20", sessionId: "sess_02", timestamp: H(4), type: "system", role: "system", content: "Session started in /home/basti/scalesite" },
    { id: "ev_21", sessionId: "sess_02", timestamp: H(3.9), type: "message", role: "user", content: "Redesign the landing page hero section with a more modern gradient and animated text." },
    { id: "ev_22", sessionId: "sess_02", timestamp: H(3.5), type: "tool_call", role: "assistant", content: "Edit file src/components/Hero.tsx", metadata: { tool: "Edit", file: "src/components/Hero.tsx" } },
    { id: "ev_23", sessionId: "sess_02", timestamp: M(15), type: "message", role: "assistant", content: "Hero section updated with new gradient animation. Check the diff for the changes." },
  ],
  sess_05: [
    { id: "ev_50", sessionId: "sess_05", timestamp: H(6), type: "system", role: "system", content: "Session started in /home/basti/discord-bot" },
    { id: "ev_51", sessionId: "sess_05", timestamp: H(5.8), type: "message", role: "user", content: "Fix the welcome message handler - it's crashing on new member join." },
    { id: "ev_52", sessionId: "sess_05", timestamp: H(5.7), type: "tool_call", role: "assistant", content: "Read file src/handlers/welcome.ts", metadata: { tool: "Read", file: "src/handlers/welcome.ts" } },
    { id: "ev_53", sessionId: "sess_05", timestamp: H(5.6), type: "tool_result", role: "tool", content: "Error: File not found at src/handlers/welcome.ts", metadata: { tool: "Read", success: false, error: "ENOENT" } },
    { id: "ev_54", sessionId: "sess_05", timestamp: H(5.5), type: "message", role: "assistant", content: "The file src/handlers/welcome.ts doesn't exist. It might be at a different path. Let me search for it.", metadata: { error: true } },
  ],
}

// ---- Tool Calls ----

export const mockToolCalls: Record<string, ToolCall[]> = {
  sess_01: [
    { id: "tc_01", sessionId: "sess_01", eventId: "ev_03", tool: "Read", input: { file_path: "src/lib/types/index.ts" }, output: "85 lines read", status: "completed", startedAt: H(1.8), completedAt: H(1.7), duration: 360 },
    { id: "tc_02", sessionId: "sess_01", eventId: "ev_06", tool: "Write", input: { file_path: "src/components/sessions/SessionTable.tsx", content: "..." }, output: "File written", status: "completed", startedAt: H(1.5), completedAt: H(1.4), duration: 1200 },
    { id: "tc_03", sessionId: "sess_01", eventId: "ev_09", tool: "Write", input: { file_path: "src/app/api/events/route.ts" }, output: "File written", status: "completed", startedAt: M(28), completedAt: M(27), duration: 800 },
    { id: "tc_04", sessionId: "sess_01", eventId: "", tool: "Bash", input: { command: "npm run lint" }, status: "running", startedAt: M(1) },
  ],
  sess_02: [
    { id: "tc_10", sessionId: "sess_02", eventId: "ev_22", tool: "Edit", input: { file_path: "src/components/Hero.tsx" }, output: "Edit applied", status: "completed", startedAt: H(3.5), completedAt: H(3.4), duration: 450 },
  ],
}

// ---- Diffs ----

export const mockDiffs: FileDiff[] = [
  {
    id: "diff_01", sessionId: "sess_01", filePath: "src/components/sessions/SessionTable.tsx",
    status: "added", additions: 87, deletions: 0,
    diffContent: `diff --git a/src/components/sessions/SessionTable.tsx b/src/components/sessions/SessionTable.tsx
new file mode 100644
--- /dev/null
+++ b/src/components/sessions/SessionTable.tsx
@@ -0,0 +1,87 @@
+"use client"
+import { Session, SessionStatus } from "@/lib/types"
+import { Badge } from "@/components/ui/Badge"
+
+interface SessionTableProps {
+  sessions: Session[]
+}
+
+export function SessionTable({ sessions }: SessionTableProps) {
+  return (
+    <table className="w-full">
+      <thead>
+        <tr>
+          <th>Project</th>
+          <th>Branch</th>
+          <th>Status</th>
+          <th>Model</th>
+          <th>Last Activity</th>
+        </tr>
+      </thead>
+      <tbody>
+        {sessions.map((s) => (
+          <tr key={s.id}>
+            <td>{s.projectName}</td>
+            <td>{s.branch}</td>
+            <td><Badge status={s.status} /></td>
+            <td>{s.model}</td>
+            <td>{s.lastActivityAt}</td>
+          </tr>
+        ))}
+      </tbody>
+    </table>
+  )
+}`,
    reviewStatus: "pending", createdAt: H(1.4),
  },
  {
    id: "diff_02", sessionId: "sess_01", filePath: "src/app/api/sessions/route.ts",
    status: "added", additions: 42, deletions: 0,
    diffContent: `diff --git a/src/app/api/sessions/route.ts b/src/app/api/sessions/route.ts
new file mode 100644
--- /dev/null
+++ b/src/app/api/sessions/route.ts
@@ -0,0 +1,42 @@
+import { NextResponse } from "next/server"
+import { mockProvider } from "@/lib/mock/provider"
+
+export async function GET() {
+  const sessions = await mockProvider.getSessions()
+  return NextResponse.json(sessions)
+}`,
    reviewStatus: "approved", createdAt: H(1.2),
  },
  {
    id: "diff_03", sessionId: "sess_01", filePath: "src/app/globals.css",
    status: "modified", additions: 15, deletions: 3,
    diffContent: `diff --git a/src/app/globals.css b/src/app/globals.css
--- a/src/app/globals.css
+++ b/src/app/globals.css
@@ -1,6 +1,18 @@
 @import "tailwindcss";

-:root {
-  --bg: #fff;
-  --text: #000;
+:root {
+  --bg-primary: #0a0a0f;
+  --bg-secondary: #111118;
+  --text-primary: #e4e4ed;
+  --accent: #7c6bf0;
+}
+
+body {
+  background: var(--bg-primary);
+  color: var(--text-primary);
+}`,
    reviewStatus: "pending", createdAt: M(30),
  },
  {
    id: "diff_04", sessionId: "sess_02", filePath: "src/components/Hero.tsx",
    status: "modified", additions: 28, deletions: 12,
    diffContent: `diff --git a/src/components/Hero.tsx b/src/components/Hero.tsx
--- a/src/components/Hero.tsx
+++ b/src/components/Hero.tsx
@@ -5,18 +5,34 @@
-export function Hero() {
-  return (
-    <section className="bg-white py-20">
-      <h1 className="text-4xl font-bold">ScaleSite</h1>
-      <p>Professional websites for your business</p>
-    </section>
-  )
-}
+export function Hero() {
+  return (
+    <section className="relative py-32 overflow-hidden">
+      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
+      <div className="container mx-auto px-4 relative z-10">
+        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
+          ScaleSite
+        </h1>
+        <p className="mt-4 text-xl text-gray-300">
+          Professionelle Webseiten für dein Business
+        </p>
+      </div>
+    </section>
+  )
+}`,
    reviewStatus: "pending", createdAt: M(15),
  },
  {
    id: "diff_05", sessionId: "sess_03", filePath: "src/pages/index.tsx",
    status: "modified", additions: 8, deletions: 4,
    diffContent: `diff --git a/src/pages/index.tsx b/src/pages/index.tsx
--- a/src/pages/index.tsx
+++ b/src/pages/index.tsx
@@ -10,10 +10,14 @@
-const title = "Bastian Giersch"
-const subtitle = "Developer"
+const title = "Bastian Giersch"
+const subtitle = "Full-Stack Developer & Homelab Architect"
+const description = "Building modern web applications and managing infrastructure"`,
    reviewStatus: "approved", createdAt: H(1),
  },
]

// ---- Permissions ----

export const mockPermissions: PermissionRequest[] = [
  {
    id: "perm_01", sessionId: "sess_01", tool: "Bash", action: "execute",
    description: "Run: npm run build -- --filter=openchamber",
    status: "pending", requestedAt: M(1),
  },
  {
    id: "perm_02", sessionId: "sess_02", tool: "Write", action: "write_file",
    description: "Write to: src/components/Hero.tsx (overwrite existing)",
    status: "pending", requestedAt: M(5),
  },
]

// ---- Workspaces ----

export const mockWorkspaces: Workspace[] = [
  { id: "ws_01", name: "openchamber", path: "/home/basti/openchamber", repoUrl: "https://github.com/basti/openchamber", branch: "main", lastOpenedAt: M(2), sessionCount: 2, activeSessionCount: 1 },
  { id: "ws_02", name: "scalesite", path: "/home/basti/scalesite", repoUrl: "https://github.com/basti/scalesite", branch: "feat/new-landing", lastOpenedAt: M(15), sessionCount: 2, activeSessionCount: 1 },
  { id: "ws_03", name: "portfolio", path: "/home/basti/portfolio", branch: "main", lastOpenedAt: H(1), sessionCount: 1, activeSessionCount: 0 },
  { id: "ws_04", name: "discord-bot", path: "/home/basti/discord-bot", branch: "main", lastOpenedAt: H(5.5), sessionCount: 1, activeSessionCount: 0 },
]
