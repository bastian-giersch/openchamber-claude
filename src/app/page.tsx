import type { Session, DashboardStats } from "@/lib/types"
import { MetricCard } from "@/components/ui/MetricCard"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import Link from "next/link"

async function getData(): Promise<{ stats: DashboardStats; sessions: Session[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    const [statsRes, sessionsRes] = await Promise.all([
      fetch(`${baseUrl}/api/stats`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/sessions`, { cache: "no-store" }),
    ])
    const stats = await statsRes.json()
    const sessions = await sessionsRes.json()
    return { stats, sessions }
  } catch {
    return { stats: {} as DashboardStats, sessions: [] }
  }
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function DashboardPage() {
  const { stats, sessions } = await getData()

  const activeSessions = sessions.filter((s: Session) => s.status === "active")
  const recentSessions = sessions.slice(0, 8)

  // Group sessions by project
  const projectMap = new Map<string, Session[]>()
  for (const s of sessions) {
    const list = projectMap.get(s.projectName) || []
    list.push(s)
    projectMap.set(s.projectName, list)
  }
  const topProjects = [...projectMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your Claude Code control plane
          </p>
        </div>
        <DashboardClient />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard label="Active" value={stats.activeSessions ?? 0} />
        <MetricCard label="Total Sessions" value={stats.totalSessions ?? 0} />
        <MetricCard label="Events Today" value={stats.eventsToday ?? 0} />
        <MetricCard label="Tool Calls" value={stats.toolCallsToday ?? 0} />
        <MetricCard label="Pending Reviews" value={stats.pendingReviews ?? 0} />
        <MetricCard label="Active Workspaces" value={stats.activeWorkspaces ?? 0} />
      </div>

      {/* Resume where you left off */}
      {activeSessions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wider">
            Resume where you left off
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSessions.slice(0, 4).map((s: Session) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{s.projectName}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">{s.branch}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span>{s.totalMessages} msgs</span>
                  <span>{s.totalToolCalls} tools</span>
                  <span className="ml-auto">{relativeTime(s.lastActivityAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h2>
              <Link href="/sessions" className="text-xs text-[var(--accent)] hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {recentSessions.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">No sessions yet</p>
              ) : (
                recentSessions.map((s: Session) => (
                  <Link
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      s.status === "active" ? "bg-emerald-400 animate-pulse" :
                      s.status === "error" ? "bg-red-400" :
                      s.status === "paused" ? "bg-amber-400" :
                      "bg-blue-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{s.projectName}</span>
                        <span className="text-xs text-[var(--text-secondary)] font-mono">{s.branch}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>{s.totalMessages} msgs</span>
                        <span className="text-[var(--border-color)]">·</span>
                        <span>{s.totalToolCalls} tools</span>
                        <span className="text-[var(--border-color)]">·</span>
                        <span>{s.totalDiffs} diffs</span>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                      {relativeTime(s.lastActivityAt)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Projects */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="px-4 py-3 border-b border-[var(--border-color)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Most Active Workspaces</h2>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {topProjects.map(([name, sessions]) => (
                <div key={name} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-[var(--text-primary)] truncate">{name}</span>
                  <span className="text-xs text-[var(--text-secondary)] ml-2 flex-shrink-0">
                    {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
              {topProjects.length === 0 && (
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">No workspaces</p>
              )}
            </div>
          </div>

          {/* Pending Reviews */}
          {(stats.pendingReviews ?? 0) > 0 && (
            <Link
              href="/diffs"
              className="block rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                  {stats.pendingReviews}
                </span>
                <div>
                  <p className="text-sm font-medium text-amber-400">Pending Reviews</p>
                  <p className="text-xs text-[var(--text-secondary)]">Diffs awaiting your review</p>
                </div>
              </div>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/sessions"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <span className="text-sm text-[var(--text-secondary)]">View all sessions</span>
              </Link>
              <Link
                href="/diffs"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <span className="text-sm text-[var(--text-secondary)]">Review diffs</span>
              </Link>
              <Link
                href="/workspaces"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                <span className="text-sm text-[var(--text-secondary)]">Browse workspaces</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
