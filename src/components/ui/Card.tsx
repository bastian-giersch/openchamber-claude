export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 ${onClick ? "cursor-pointer hover:border-[var(--accent)]/40 transition-colors" : ""} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-between mb-3 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-sm font-semibold text-[var(--text-primary)] ${className}`}>{children}</h3>
}
