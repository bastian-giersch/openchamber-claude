"use client"

import { useEffect, useState } from "react"

interface HealthData {
  provider: string
  claudeCodeConnected: boolean
  lastSync: string
  sessionsDir: boolean
  projectsDir: boolean
}

export function DashboardClient() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setHealth(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !health) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <span className={`w-2 h-2 rounded-full ${health.claudeCodeConnected ? "bg-emerald-400" : "bg-gray-400"}`} />
        <span>{health.provider === "real" ? "Live" : "Mock"}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <span className={`w-2 h-2 rounded-full ${health.projectsDir ? "bg-emerald-400" : "bg-amber-400"}`} />
        <span>{health.projectsDir ? "~/.claude" : "No data dir"}</span>
      </div>
    </div>
  )
}
