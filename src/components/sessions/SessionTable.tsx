"use client"

import type { Session } from "@/lib/types"
import { StatusBadge } from "@/components/ui/Badge"

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SessionTable({ sessions }: { sessions: Session[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <th className="text-left px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Project</th>
            <th className="text-left px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Branch</th>
            <th className="text-left px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Model</th>
            <th className="text-right px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Messages</th>
            <th className="text-right px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Tools</th>
            <th className="text-right px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Diffs</th>
            <th className="text-right px-4 py-3 text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              onClick={() => window.location.href = `/sessions/${s.id}`}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-[var(--text-primary)]">{s.projectName}</div>
                <div className="text-xs text-[var(--text-secondary)]">{s.cwd}</div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {s.branch}
                </span>
              </td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)] text-xs font-mono">{s.model.replace("claude-", "")}</td>
              <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{s.totalMessages}</td>
              <td className="px-4 py-3 text-right text-[var(--text-secondary)]">{s.totalToolCalls}</td>
              <td className="px-4 py-3 text-right">
                {s.totalDiffs > 0 ? (
                  <span className="text-[var(--accent)]">{s.totalDiffs}</span>
                ) : (
                  <span className="text-[var(--text-secondary)]">0</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-[var(--text-secondary)] text-xs">{timeAgo(s.lastActivityAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
