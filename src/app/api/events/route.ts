import { sessionWatcher } from "@/lib/watchers/session-watcher"
import type { SSEEvent } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const encoder = new TextEncoder()

  // Start the watcher
  sessionWatcher.start()

  const stream = new ReadableStream({
    start(controller) {
      // Send connection event
      const connectEvent: SSEEvent = {
        type: "session_updated",
        payload: { message: "connected", mode: "real" },
        timestamp: new Date().toISOString(),
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectEvent)}\n\n`))

      // Subscribe to real file changes
      const unsubscribe = sessionWatcher.onEvent((event: SSEEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {
          unsubscribe()
        }
      })

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
          unsubscribe()
        }
      }, 30000)

      // Clean up when the client disconnects
      // Use abort signal for proper cleanup
      setTimeout(() => {
        clearInterval(heartbeat)
        unsubscribe()
        try { controller.close() } catch {}
      }, 600000) // 10 min max SSE connection
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
