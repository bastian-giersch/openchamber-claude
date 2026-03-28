"use client"

import { useState, useRef, useEffect } from "react"
import { useNotifications, useUnreadCount, markAllRead } from "@/lib/services/notification-service"
import type { AppNotification } from "@/lib/types"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const notifications = useNotifications()
  const unreadCount = useUnreadCount()
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 md:w-96 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Notifications</span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[var(--accent)] hover:underline">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-xs text-[var(--text-secondary)] hover:underline">
                Close
              </button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] text-center py-8">No notifications</p>
            ) : (
              notifications.slice(0, 20).map((n: AppNotification) => (
                <div key={n.id} className={`flex gap-3 px-3 py-2.5 border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-tertiary)] transition-colors ${!n.read ? "bg-[var(--bg-tertiary)]/50" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    n.type === "success" ? "bg-emerald-500" :
                    n.type === "warning" ? "bg-amber-500" :
                    n.type === "error" ? "bg-red-500" :
                    "bg-blue-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-tight">{n.title}</p>
                    {n.description && (
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{n.description}</p>
                    )}
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
