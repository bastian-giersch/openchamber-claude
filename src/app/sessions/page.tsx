import type { Session } from "@/lib/types"
import { SessionTable } from "@/components/sessions/SessionTable"
import { getProvider } from "@/lib/providers"

export default async function SessionsPage() {
  const provider = getProvider()
  const sessions = await provider.getSessions()

  const active = sessions.filter((s) => s.status === "active")
  const paused = sessions.filter((s) => s.status === "paused")
  const completed = sessions.filter((s) => s.status === "completed")
  const errored = sessions.filter((s) => s.status === "error")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sessions</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {sessions.length} total — {active.length} active
        </p>
      </div>

      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
            Active ({active.length})
          </h2>
          <SessionTable sessions={active} />
        </section>
      )}

      {paused.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-amber-400 mb-2 uppercase tracking-wider">
            Paused ({paused.length})
          </h2>
          <SessionTable sessions={paused} />
        </section>
      )}

      {errored.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-400 mb-2 uppercase tracking-wider">
            Errors ({errored.length})
          </h2>
          <SessionTable sessions={errored} />
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider">
            Completed ({completed.length})
          </h2>
          <SessionTable sessions={completed} />
        </section>
      )}
    </div>
  )
}
