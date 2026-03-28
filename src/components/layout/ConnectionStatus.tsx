"use client"

import { useEffect, useState } from "react"

export function ConnectionStatus() {
  const [mode, setMode] = useState<string>("detecting...")
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Check provider mode
    fetch("/api/provider")
      .then((r) => r.json())
      .then((d) => {
        setMode(d.mode)
        setConnected(true)
      })
      .catch(() => {
        setMode("error")
        setConnected(false)
      })
  }, [])

  const handleToggle = async () => {
    const newMode = mode === "real" ? "mock" : "real"
    await fetch("/api/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: newMode }),
    })
    setMode(newMode)
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`} />
        <span className="text-[var(--text-secondary)]">
          {mode === "real" ? "Claude Code Connected" : mode === "mock" ? "Mock Data" : mode}
        </span>
      </div>
      <button
        onClick={handleToggle}
        className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title={`Switch to ${mode === "real" ? "mock" : "real"} provider`}
      >
        {mode === "real" ? "Mock" : "Real"}
      </button>
    </div>
  )
}
