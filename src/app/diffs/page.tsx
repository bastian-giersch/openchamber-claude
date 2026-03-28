import type { FileDiff } from "@/lib/types"
import { DiffCard } from "@/components/diffs/DiffViewer"
import { DiffFilters } from "@/components/diffs/DiffFilters"
import { ExportDiffsButton } from "@/components/diffs/ExportDiffsButton"

async function getDiffs(searchParams: { sessionId?: string; status?: string }): Promise<FileDiff[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const params = new URLSearchParams()
  if (searchParams.sessionId) params.set("sessionId", searchParams.sessionId)
  try {
    const res = await fetch(`${baseUrl}/api/diffs?${params}`, { cache: "no-store" })
    return res.json()
  } catch {
    return []
  }
}

function groupByFile(diffs: FileDiff[]): Map<string, FileDiff[]> {
  const map = new Map<string, FileDiff[]>()
  for (const d of diffs) {
    const dir = d.filePath.includes("/")
      ? d.filePath.substring(0, d.filePath.lastIndexOf("/"))
      : "(root)"
    const list = map.get(dir) || []
    list.push(d)
    map.set(dir, list)
  }
  return map
}

export default async function DiffsPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; status?: string }>
}) {
  const params = await searchParams
  const diffs = await getDiffs(params)

  const pending = diffs.filter((d) => d.reviewStatus === "pending")
  const approved = diffs.filter((d) => d.reviewStatus === "approved")
  const rejected = diffs.filter((d) => d.reviewStatus === "rejected")

  const statusFilter = params.status || "all"
  const filteredDiffs = statusFilter === "pending"
    ? pending
    : statusFilter === "approved"
      ? approved
      : statusFilter === "rejected"
        ? rejected
        : diffs

  const grouped = groupByFile(filteredDiffs)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Diffs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {diffs.length} changes · {pending.length} pending review
          </p>
        </div>
        {diffs.length > 0 && <ExportDiffsButton diffs={diffs} />}
      </div>

      {/* Filter bar */}
      <DiffFilters
        total={diffs.length}
        pending={pending.length}
        approved={approved.length}
        rejected={rejected.length}
        active={statusFilter}
        sessionId={params.sessionId}
      />

      {/* Grouped diffs */}
      {params.sessionId ? (
        // Flat list when filtering by session
        <div className="space-y-3">
          {filteredDiffs.map((d) => (
            <DiffCard key={d.id} diff={d} />
          ))}
          {filteredDiffs.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">No diffs found</p>
          )}
        </div>
      ) : (
        // Grouped by directory
        <div className="space-y-6">
          {[...grouped.entries()].map(([dir, dirDiffs]) => (
            <section key={dir}>
              <h2 className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider font-mono">
                {dir}/
              </h2>
              <div className="space-y-3">
                {dirDiffs.map((d) => (
                  <DiffCard key={d.id} diff={d} />
                ))}
              </div>
            </section>
          ))}
          {grouped.size === 0 && (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">No diffs found</p>
          )}
        </div>
      )}
    </div>
  )
}
