"use client"

import type { FileDiff } from "@/lib/types"
import { exportDiffsMarkdown } from "@/lib/export"

export function ExportDiffsButton({ diffs }: { diffs: FileDiff[] }) {
  return (
    <button
      onClick={() => exportDiffsMarkdown(diffs)}
      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export Markdown
    </button>
  )
}
