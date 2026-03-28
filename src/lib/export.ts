"use client"

import type { Session, SessionEvent, FileDiff, ToolCall } from "@/lib/types"

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportSessionJSON(session: Session, events: SessionEvent[], toolCalls: ToolCall[]) {
  const data = {
    exportedAt: new Date().toISOString(),
    session,
    events,
    toolCalls,
  }
  download(
    `openchamber-session-${session.id.slice(0, 8)}.json`,
    JSON.stringify(data, null, 2),
    "application/json"
  )
}

export function exportWorkspaceSnapshot(workspace: {
  name: string
  sessions: Session[]
  diffs: FileDiff[]
}) {
  const data = {
    exportedAt: new Date().toISOString(),
    workspace: workspace.name,
    sessionCount: workspace.sessions.length,
    diffCount: workspace.diffs.length,
    sessions: workspace.sessions,
    diffs: workspace.diffs,
  }
  download(
    `openchamber-workspace-${workspace.name.replace(/[^a-z0-9]/gi, "-")}.json`,
    JSON.stringify(data, null, 2),
    "application/json"
  )
}

export function exportDiffsMarkdown(diffs: FileDiff[]) {
  const lines: string[] = [
    `# OpenChamber Diff Review Export`,
    ``,
    `Exported: ${new Date().toISOString()}`,
    `Total diffs: ${diffs.length}`,
    `Pending: ${diffs.filter((d) => d.reviewStatus === "pending").length}`,
    `Approved: ${diffs.filter((d) => d.reviewStatus === "approved").length}`,
    `Rejected: ${diffs.filter((d) => d.reviewStatus === "rejected").length}`,
    ``,
    `---`,
    ``,
  ]

  for (const d of diffs) {
    lines.push(`## ${d.filePath}`)
    lines.push(``)
    lines.push(`- **Status**: ${d.status}`)
    lines.push(`- **Review**: ${d.reviewStatus}`)
    lines.push(`- **Changes**: +${d.additions} -${d.deletions}`)
    lines.push(``)
    if (d.diffContent) {
      lines.push("```diff")
      lines.push(d.diffContent)
      lines.push("```")
      lines.push("")
    }
    lines.push("---")
    lines.push("")
  }

  download("openchamber-diffs.md", lines.join("\n"), "text/markdown")
}

export function exportSettings(settings: Record<string, unknown>) {
  download(
    "openchamber-settings.json",
    JSON.stringify(settings, null, 2),
    "application/json"
  )
}
