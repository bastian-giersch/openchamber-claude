"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import type { CommandItem } from "@/lib/types"

export function CommandBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: CommandItem[] = [
    { id: "dashboard", label: "Go to Dashboard", category: "navigation", action: () => router.push("/"), keywords: ["home", "overview"] },
    { id: "sessions", label: "Go to Sessions", category: "navigation", action: () => router.push("/sessions"), keywords: ["list", "all"] },
    { id: "diffs", label: "Go to Diffs", category: "navigation", action: () => router.push("/diffs"), keywords: ["review", "changes"] },
    { id: "workspaces", label: "Go to Workspaces", category: "navigation", action: () => router.push("/workspaces"), keywords: ["projects"] },
    { id: "settings", label: "Go to Settings", category: "navigation", action: () => router.push("/settings"), keywords: ["preferences", "config"] },
    { id: "refresh", label: "Refresh Data", category: "action", action: () => { router.refresh(); onClose() }, keywords: ["reload", "sync"] },
    { id: "toggle-provider", label: "Toggle Provider (Real/Mock)", category: "action", action: async () => {
      const r = await fetch("/api/provider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "toggle" }) })
      const d = await r.json()
      window.location.reload()
    }, keywords: ["switch", "mock", "real"] },
  ]

  const filtered = query
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords?.some((k) => k.includes(query.toLowerCase()))
      )
    : commands

  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197-5.197m-4.614 4.614a9 9 0 1 1 0 1.874-.608 2.443L16.5 21h5l5-5-5-5-1.058-2.443a9 9 0 0 0-1.874-.608Z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command..."
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
            />
            <kbd className="text-xs text-[var(--text-secondary)] border border-[var(--border-color)] rounded px-1.5 py-0.5">ESC</kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] text-center py-4">No results</p>
            ) : (
              filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); onClose() }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <span className={`w-8 text-center text-xs ${
                    cmd.category === "navigation" ? "text-blue-400" :
                    cmd.category === "action" ? "text-emerald-400" :
                    "text-[var(--text-secondary)]"
                  }`}>
                    {cmd.category === "navigation"? "⌘" : cmd.category === "action"? "⚡" : "·"}
                  </span>
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{cmd.label}</p>
                    {cmd.description && <p className="text-xs text-[var(--text-secondary)]">{cmd.description}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-[var(--border-color)] flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span><kbd className="border border-[var(--border-color)] rounded px-1">↑↓</kbd> Navigate</span>
            <span><kbd className="border border-[var(--border-color)] rounded px-1">↵</kbd> Select</span>
            <span><kbd className="border border-[var(--border-color)] rounded px-1">ESC</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
