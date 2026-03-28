export function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: string; positive: boolean }
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
        {icon && <span className="text-[var(--text-secondary)]">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--text-primary)]">{value}</span>
        {trend && (
          <span className={`text-xs ${trend.positive ? "text-emerald-400" : "text-red-400"}`}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
