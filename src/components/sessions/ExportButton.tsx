"use client"

import type { Session, SessionEvent, ToolCall } from "@/lib/types"
import { exportSessionJSON } from "@/lib/export"

export function ExportSessionButton({
  session,
  events,
  toolCalls,
}: {
  session: Session
  events: SessionEvent[]
  toolCalls: ToolCall[]
}) {
  return (
    <button
      onClick={() => exportSessionJSON(session, events, toolCalls)}
      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export JSON
    </button>
  )
}
