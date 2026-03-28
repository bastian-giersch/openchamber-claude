import Link from "next/link"

export const metadata = {
  title: "OpenChamber — Open Source Control Plane for Claude Code",
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
    </div>
  )
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{value}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-1">{label}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--text-primary)]">OpenChamber</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">v0.4</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Open App
            </Link>
            <a
              href="https://github.com/bastianhjr/openchamber-claude"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Open Source · MIT License
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight">
          Your Claude Code
          <br />
          <span className="text-[var(--accent)]">Control Plane</span>
        </h1>

        <p className="text-lg text-[var(--text-secondary)] mt-4 max-w-xl mx-auto">
          Monitor sessions, review diffs, manage workspaces. Zero setup required — reads directly from <code className="text-[var(--accent)]">~/.claude/</code>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            Open Dashboard
          </Link>
          <a
            href="https://github.com/bastianhjr/openchamber-claude"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-sm font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Star on GitHub
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-3 gap-6">
          <StatBadge value="57" label="Sessions tracked" />
          <StatBadge value="92" label="Diffs monitored" />
          <StatBadge value="0" label="Config required" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
          Everything you need to manage Claude Code
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon="📊"
            title="Live Dashboard"
            desc="Real-time KPIs, activity feeds, and health monitoring. See which sessions are active and what they're doing."
          />
          <FeatureCard
            icon="📝"
            title="Diff Review"
            desc="Review file changes with before/after diffs. Filter by status, approve or reject changes, export as Markdown."
          />
          <FeatureCard
            icon="📁"
            title="Workspace Manager"
            desc="Browse projects, track sessions per workspace, see active work at a glance. Groups by ~/.claude/projects/."
          />
          <FeatureCard
            icon="🔔"
            title="Notifications"
            desc="Real-time toast notifications for session events, errors, and pending reviews via SSE."
          />
          <FeatureCard
            icon="⌨️"
            title="Command Bar"
            desc="Cmd+K to navigate anywhere instantly. Search commands, switch providers, refresh data."
          />
          <FeatureCard
            icon="📱"
            title="Mobile + PWA"
            desc="Installable on desktop and mobile. Full responsive design with touch-optimized controls."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
          Up and running in 2 minutes
        </h2>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Clone & Install</p>
                <code className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded mt-1 block">
                  git clone https://github.com/bastianhjr/openchamber-claude && cd openchamber-claude && npm i
                </code>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Start the server</p>
                <code className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-1 rounded mt-1 block">
                  npm run dev
                </code>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Open localhost:3000</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  That&apos;s it. If you have Claude Code installed, OpenChamber auto-detects your sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
          Built with
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4", "SSE", "PWA"].map((tech) => (
            <span key={tech} className="px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Ready to take control?
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Open source. Free forever. No API keys needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 text-sm font-medium rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
          >
            Launch OpenChamber
          </Link>
          <a
            href="https://github.com/bastianhjr/openchamber-claude"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-sm font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            View Source
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-secondary)]">
            OpenChamber v0.4 · MIT License
          </p>
          <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
            <a href="https://github.com/bastianhjr/openchamber-claude" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)]">
              GitHub
            </a>
            <Link href="/" className="hover:text-[var(--text-primary)]">
              App
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
