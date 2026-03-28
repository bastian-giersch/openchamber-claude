"use client"

import { useState, useEffect } from "react"
import { getStoredTheme, setStoredTheme, applyTheme, type Theme } from "@/lib/theme"
import { exportSettings } from "@/lib/export"

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--border-color)]"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  )
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [providerMode, setProviderMode] = useState<string>("detecting...")
  const [claudePath, setClaudePath] = useState("~/.claude")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [notifySessions, setNotifySessions] = useState(true)
  const [notifyDiffs, setNotifyDiffs] = useState(true)
  const [notifyErrors, setNotifyErrors] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(getStoredTheme())
    fetch("/api/provider")
      .then((r) => r.json())
      .then((d) => setProviderMode(d.mode))
      .catch(() => setProviderMode("error"))
  }, [])

  const handleThemeChange = (t: Theme) => {
    setTheme(t)
    setStoredTheme(t)
    applyTheme(t)
  }

  const handleProviderToggle = async () => {
    const newMode = providerMode === "real" ? "mock" : "real"
    await fetch("/api/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: newMode }),
    })
    setProviderMode(newMode)
    window.location.reload()
  }

  const handleExportSettings = () => {
    exportSettings({
      theme,
      providerMode,
      claudePath,
      autoRefresh,
      refreshInterval,
      notifications: { sessions: notifySessions, diffs: notifyDiffs, errors: notifyErrors },
    })
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Configure your OpenChamber experience
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--text-secondary)] block mb-2">Theme</label>
            <div className="flex gap-2">
              {(["dark", "light", "system"] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === t
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Provider */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Data Provider</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Provider Mode</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Currently: <span className="font-mono">{providerMode}</span>
              </p>
            </div>
            <button
              onClick={handleProviderToggle}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Switch to {providerMode === "real" ? "Mock" : "Real"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Claude Code Path</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Directory containing session data</p>
            </div>
            <input
              type="text"
              value={claudePath}
              onChange={(e) => setClaudePath(e.target.value)}
              className="px-3 py-1.5 text-sm font-mono rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors w-48"
            />
          </div>
        </div>
      </section>

      {/* Auto Refresh */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Auto Refresh</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)]">Enable Auto Refresh</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automatically refresh session data</p>
            </div>
            <Toggle checked={autoRefresh} onChange={setAutoRefresh} label="Auto refresh" />
          </div>
          {autoRefresh && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-primary)]">Refresh Interval</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Seconds between refreshes</p>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={120}>2min</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)]">Session events</p>
            <Toggle checked={notifySessions} onChange={setNotifySessions} label="Session notifications" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)]">Diff reviews</p>
            <Toggle checked={notifyDiffs} onChange={setNotifyDiffs} label="Diff notifications" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-primary)]">Errors</p>
            <Toggle checked={notifyErrors} onChange={setNotifyErrors} label="Error notifications" />
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Data Management</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExportSettings}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Export Settings
          </button>
        </div>
      </section>

      {/* About */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">About</h2>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <p>OpenChamber v0.4.0</p>
          <p>Open source control plane for Claude Code</p>
          <a
            href="https://github.com/bastianhjr/openchamber-claude"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            GitHub Repository
          </a>
        </div>
      </section>
    </div>
  )
}
