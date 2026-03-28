// ============================================================================
// Session File Watcher
// ============================================================================
// Watches ~/.claude/ for changes and emits SSE events to connected clients.
// Uses chokidar for cross-platform file watching.
// ============================================================================

import chokidar from "chokidar"
import type { FSWatcher } from "chokidar"
import path from "path"
import os from "os"
import type { SSEEvent } from "../types"

type EventCallback = (event: SSEEvent) => void

const CLAUDE_DIR = path.join(os.homedir(), ".claude")

class SessionWatcher {
  private watcher: FSWatcher | null = null
  private listeners: Set<EventCallback> = new Set()

  start() {
    if (this.watcher) return

    this.watcher = chokidar.watch(
      [
        path.join(CLAUDE_DIR, "sessions", "*.json"),
        path.join(CLAUDE_DIR, "projects", "**", "*.jsonl"),
        path.join(CLAUDE_DIR, "file-history", "**"),
      ],
      {
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100,
        },
      }
    )

    this.watcher.on("add", (filePath) => this.handleChange("created", filePath))
    this.watcher.on("change", (filePath) => this.handleChange("updated", filePath))
    this.watcher.on("unlink", (filePath) => this.handleChange("deleted", filePath))

    console.log("[SessionWatcher] Watching ~/.claude/ for changes")
  }

  stop() {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
      console.log("[SessionWatcher] Stopped")
    }
  }

  onEvent(callback: EventCallback): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private handleChange(action: string, filePath: string) {
    const event = this.classifyEvent(action, filePath)
    if (event) {
      for (const cb of this.listeners) {
        try {
          cb(event)
        } catch (err) {
          console.error("[SessionWatcher] Listener error:", err)
        }
      }
    }
  }

  private classifyEvent(action: string, filePath: string): SSEEvent | null {
    const relativePath = path.relative(CLAUDE_DIR, filePath)
    const now = new Date().toISOString()

    // New session file created
    if (relativePath.startsWith("sessions/") && relativePath.endsWith(".json")) {
      return {
        type: "session_created",
        payload: { action, file: relativePath },
        timestamp: now,
      }
    }

    // JSONL conversation update
    if (relativePath.includes(".jsonl")) {
      const sessionId = path.basename(filePath, ".jsonl")
      const eventType = action === "created" ? "session_created" : "new_event"
      return {
        type: eventType,
        payload: { action, sessionId, file: relativePath },
        timestamp: now,
      }
    }

    // File history change (diff)
    if (relativePath.startsWith("file-history/")) {
      const sessionId = relativePath.split("/")[1]
      return {
        type: "diff_created",
        payload: { action, sessionId, file: relativePath },
        timestamp: now,
      }
    }

    return null
  }
}

// Singleton
export const sessionWatcher = new SessionWatcher()
