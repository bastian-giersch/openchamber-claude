import type { Session, SessionEvent, ToolCall, PermissionRequest } from "@/lib/types"
import { StatusBadge } from "@/components/ui/Badge"
import { ExportSessionButton } from "@/components/sessions/ExportButton"
import { getProvider } from "@/lib/providers"
import Link from "next/link"

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function EventRow({ event }: { event: SessionEvent }) {
  const isUser = event.role === "user"
  const isAssistant = event.role === "assistant"
  const isTool = event.type === "tool_call" || event.type === "tool_result"
  const isError = event.metadata?.error === true

  return (
    <div className={`py-3 px-3 md:px-4 rounded-lg ${
      isUser
        ? "bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]"
        : isTool
          ? "bg-[var(--bg-tertiary)] border-l-2 border-[var(--text-secondary)]"
          : isError
            ? "bg-red-500/10 border-l-2 border-red-500"
            : "border-l-2 border-transparent"
    }`}>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-mono text-[var(--text-secondary)]">{formatTime(event.timestamp)}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          isUser ? "bg-[var(--accent)]/20 text-[var(--accent)]" :
          isAssistant ? "bg-blue-500/20 text-blue-400" :
          isTool ? "bg-gray-500/20 text-gray-400" :
          "bg-gray-500/10 text-gray-500"
        }`}>
          {event.role}
        </span>
        {isTool && event.metadata && "tool" in event.metadata && (
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {String(event.metadata.tool)}
          </span>
        )}
      </div>
      <p className={`text-sm ${isUser ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"} whitespace-pre-wrap break-words`}>
        {event.content}
      </p>
    </div>
  )
}

function ToolCallRow({ tool }: { tool: ToolCall }) {
  const isRunning = tool.status === "running"
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isRunning ? "bg-amber-400 animate-pulse" : tool.status === "completed" ? "bg-emerald-400" : "bg-red-400"}`} />
      <span className="text-sm font-mono text-[var(--text-primary)] truncate">{tool.tool}</span>
      {tool.duration && (
        <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">{tool.duration}ms</span>
      )}
    </div>
  )
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const provider = getProvider()

  const [session, events, toolCalls, permissions] = await Promise.all([
    provider.getSession(id),
    provider.getSessionEvents(id),
    provider.getSessionToolCalls(id),
    provider.getPendingPermissions(id),
  ])

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)]">Session not found</p>
        <Link href="/sessions" className="text-sm text-[var(--accent)] hover:underline mt-2 inline-block">
          Back to sessions
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/sessions" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] truncate">{session.projectName}</h1>
            <StatusBadge status={session.status} />
          </div>
          <p className="text-sm text-[var(--text-secondary)] truncate">
            {session.cwd} · <span className="font-mono">{session.branch}</span> · {session.model}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)] md:text-right">
          <span className="px-2 py-1 rounded-lg bg-[var(--bg-tertiary)]">{session.totalMessages} msgs</span>
          <span className="px-2 py-1 rounded-lg bg-[var(--bg-tertiary)]">{session.totalToolCalls} tools</span>
          <span className="px-2 py-1 rounded-lg bg-[var(--bg-tertiary)]">{session.totalDiffs} diffs</span>
        </div>
      </div>

      {/* Pending Permissions */}
      {permissions.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">Pending Permissions</h3>
          {permissions.map((p: PermissionRequest) => (
            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
              <div>
                <span className="text-sm text-[var(--text-primary)] font-mono">{p.tool}</span>
                <span className="text-xs text-[var(--text-secondary)] ml-2">{p.description}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="px-4 py-1.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                  Approve
                </button>
                <button className="px-4 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Event Log */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="px-4 py-3 border-b border-[var(--border-color)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Event Log</h2>
            </div>
            <div className="p-2 md:p-3 space-y-2 max-h-[600px] overflow-y-auto">
              {events.map((e: SessionEvent) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Active Tools */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Tool Calls ({toolCalls.length})</h3>
            <div className="space-y-2">
              {toolCalls.length > 0 ? toolCalls.map((t: ToolCall) => (
                <ToolCallRow key={t.id} tool={t} />
              )) : (
                <p className="text-xs text-[var(--text-secondary)]">No tool calls</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/diffs?sessionId=${session.id}`}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                View Diffs ({session.totalDiffs})
              </Link>
              <a
                href={`vscode://file${session.cwd}`}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Open in VS Code
              </a>
              <ExportSessionButton session={session} events={events} toolCalls={toolCalls} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
