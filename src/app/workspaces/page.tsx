import type { Workspace } from "@/lib/types"
import Link from "next/link"

async function getWorkspaces(): Promise<Workspace[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/workspaces`, { cache: "no-store" })
    return res.json()
  } catch {
    return []
  }
}

export default async function WorkspacesPage() {
  const workspaces = await getWorkspaces()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Workspaces</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Projects and their sessions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{ws.name}</h3>
              {ws.activeSessionCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {ws.activeSessionCount} active
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                <span className="font-mono text-xs">{ws.path}</span>
              </div>

              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="font-mono text-xs">{ws.branch}</span>
              </div>

              {ws.repoUrl && (
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.062a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 1 1 6.364 6.364l-1.757 1.757" />
                  </svg>
                  <span className="text-xs truncate">{ws.repoUrl}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-secondary)]">
                {ws.sessionCount} session{ws.sessionCount !== 1 ? "s" : ""}
              </span>
              {ws.sessionCount > 0 && (
                <Link href={`/sessions`} className="text-xs text-[var(--accent)] hover:underline">
                  View sessions →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
