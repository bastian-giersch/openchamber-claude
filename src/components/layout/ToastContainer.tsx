"use client"

import { useState, useEffect, useCallback } from "react"
import type { AppNotification } from "@/lib/types"

export function ToastContainer() {
  const [toasts, setToasts] = useState<AppNotification[]>([])

  const addToast = useCallback((n: AppNotification) => {
    setToasts((prev) => [...prev, n].slice(-5))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== n.id)), 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Listen to SSE for dev mode
  useEffect(() => {
    if (typeof window === "undefined") return
    const url = "/api/events"
    const source = new EventSource(url)
    const handle = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (!data?.type) return
        addToast({
          id: `t_${Date.now()}`,
          type: "info",
          category: "system",
          title: data.type?.replace(/_/g, " ") || "Event",
          timestamp: new Date().toISOString(),
          read: false,
        })
      } catch {}
    }
    source.addEventListener("message", handle)
    source.addEventListener("error", () => source.close())
    return () => source.close()
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-16 md:bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-lg p-3 max-w-sm animate-in slide-in-from-right">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">{toast.title}</span>
            <button onClick={() => dismissToast(toast.id)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
