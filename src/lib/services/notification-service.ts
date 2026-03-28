"use client"

import { useState, useEffect } from "react"
import type { AppNotification } from "@/lib/types"

// ============================================================================
// Notification Service - singleton, runs client-side only
// ============================================================================

type NotificationListener = (notifications: AppNotification[]) => void

class NotificationService {
  private notifications: AppNotification[] = []
  private listeners: Set<NotificationListener> = new Set()
  private maxStored = 200
  private idCounter = 0

  add(n: Omit<AppNotification, "id" | "timestamp" | "read">): AppNotification {
    const notification: AppNotification = {
      ...n,
      id: `n_${++this.idCounter}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    this.notifications.unshift(notification)
    if (this.notifications.length > this.maxStored) {
      this.notifications = this.notifications.slice(0, this.maxStored)
    }
    this.emit()
    return notification
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  markRead(id: string): void {
    const n = this.notifications.find((x) => x.id === id)
    if (n) { n.read = true; this.emit() }
  }

  markAllRead(): void {
    for (const n of this.notifications) n.read = true
    this.emit()
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  clearAll(): void {
    this.notifications = []
    this.emit()
  }

  getAll(): AppNotification[] {
    return [...this.notifications]
  }

  private emit(): void {
    const snap = [...this.notifications]
    for (const l of this.listeners) {
      try { l(snap) } catch {}
    }
  }
}

export const notificationService = new NotificationService()

// ============================================================================
// Hooks
// ============================================================================

export function useNotifications(): AppNotification[] {
  const [notifications, setNotifications] = useState(notificationService.getAll())
  useEffect(() => notificationService.subscribe(setNotifications), [])
  return notifications
}

export function useUnreadCount(): number {
  const [count, setCount] = useState(notificationService.getUnreadCount())
  useEffect(() => {
    return notificationService.subscribe((n) => setCount(n.filter((x) => !x.read).length))
  }, [])
  return count
}

export function markAllRead(): void {
  notificationService.markAllRead()
}
