"use client"

import type { FileDiff } from "@/lib/types"
import { useState } from "react"

function DiffLine({ line }: { line: string }) {
  if (line.startsWith("+++ ") || line.startsWith("--- ")) {
    return <div className="px-4 py-0.5 text-[var(--text-secondary)] font-mono text-xs bg-[var(--bg-tertiary)]">{line}</div>
  }
  if (line.startsWith("@@")) {
    return <div className="px-4 py-0.5 font-mono text-xs diff-hunk">{line}</div>
  }
  if (line.startsWith("+")) {
    return <div className="px-4 py-0.5 font-mono text-xs diff-add">{line}</div>
  }
  if (line.startsWith("-")) {
    return <div className="px-4 py-0.5 font-mono text-xs diff-remove">{line}</div>
  }
  return <div className="px-4 py-0.5 font-mono text-xs text-[var(--text-secondary)]">{line}</div>
}

export function DiffViewer({ diff }: { diff: FileDiff }) {
  const lines = diff.diffContent.split("\n")

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            diff.status === "added" ? "bg-emerald-500/20 text-emerald-400" :
            diff.status === "deleted" ? "bg-red-500/20 text-red-400" :
            "bg-blue-500/20 text-blue-400"
          }`}>
            {diff.status}
          </span>
          <span className="text-sm font-mono text-[var(--text-primary)]">{diff.filePath}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span className="text-emerald-400">+{diff.additions}</span>
          <span className="text-red-400">-{diff.deletions}</span>
        </div>
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        {lines.map((line, i) => (
          <DiffLine key={i} line={line} />
        ))}
      </div>
    </div>
  )
}

export function DiffCard({ diff, onReview }: { diff: FileDiff; onReview?: (id: string, status: "approved" | "rejected") => void }) {
  const [expanded, setExpanded] = useState(false)
  const [reviewStatus, setReviewStatus] = useState(diff.reviewStatus)

  const handleReview = async (status: "approved" | "rejected") => {
    try {
      await fetch(`/api/diffs/${diff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      setReviewStatus(status)
      onReview?.(diff.id, status)
    } catch (err) {
      console.error("Failed to review diff:", err)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            diff.status === "added" ? "bg-emerald-500/20 text-emerald-400" :
            diff.status === "deleted" ? "bg-red-500/20 text-red-400" :
            "bg-blue-500/20 text-blue-400"
          }`}>
            {diff.status}
          </span>
          <span className="text-sm font-mono text-[var(--text-primary)]">{diff.filePath}</span>
          <span className="text-xs text-[var(--text-secondary)]">
            <span className="text-emerald-400">+{diff.additions}</span>{" "}
            <span className="text-red-400">-{diff.deletions}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {reviewStatus !== "pending" ? (
            <span className={`text-xs ${reviewStatus === "approved" ? "text-emerald-400" : "text-red-400"}`}>
              {reviewStatus}
            </span>
          ) : (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleReview("approved")}
                className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview("rejected")}
                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
          <svg className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-color)]">
          <DiffViewer diff={diff} />
        </div>
      )}
    </div>
  )
}
