import type { SessionStatus } from "@/lib/types"

const statusConfig: Record<SessionStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/15" },
  paused: { label: "Paused", color: "text-amber-400", bg: "bg-amber-400/15" },
  completed: { label: "Completed", color: "text-blue-400", bg: "bg-blue-400/15" },
  error: { label: "Error", color: "text-red-400", bg: "bg-red-400/15" },
  idle: { label: "Idle", color: "text-gray-400", bg: "bg-gray-400/15" },
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      {status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
      {config.label}
    </span>
  )
}
