"use client"

import Link from "next/link"

export function DiffFilters({
  total,
  pending,
  approved,
  rejected,
  active,
  sessionId,
}: {
  total: number
  pending: number
  approved: number
  rejected: number
  active: string
  sessionId?: string
}) {
  const base = "/diffs"
  const params = sessionId ? `?sessionId=${sessionId}&` : "?"

  const tabs = [
    { key: "all", label: "All", count: total },
    { key: "pending", label: "Pending", count: pending },
    { key: "approved", label: "Approved", count: approved },
    { key: "rejected", label: "Rejected", count: rejected },
  ]

  return (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.key === "all" ? (sessionId ? `${base}?sessionId=${sessionId}` : base) : `${base}${params}status=${tab.key}`}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            active === tab.key
              ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {tab.label}
          <span className="ml-1.5 text-[var(--text-secondary)]">{tab.count}</span>
        </Link>
      ))}
    </div>
  )
}
