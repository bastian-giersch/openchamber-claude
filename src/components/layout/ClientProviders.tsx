"use client"

import { useState, useEffect } from "react"
import { CommandBar } from "@/components/command-bar/CommandBar"
import { ToastContainer } from "@/components/layout/ToastContainer"
import { InstallPrompt } from "@/components/pwa/InstallPrompt"
import { useHotkeys } from "@/lib/hooks/use-hotkeys"
import { getStoredTheme, applyTheme, type Theme } from "@/lib/theme"
import { registerServiceWorker } from "@/lib/pwa"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [commandBarOpen, setCommandBarOpen] = useState(false)

  // Initialize theme from localStorage
  useEffect(() => {
    applyTheme(getStoredTheme())
    registerServiceWorker()
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      const current = getStoredTheme()
      if (current === "system") applyTheme("system")
    }
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // Listen for theme changes from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "openchamber-theme" && e.newValue) {
        applyTheme(e.newValue as Theme)
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  useHotkeys({
    "mod+k": () => setCommandBarOpen(true),
  })

  return (
    <>
      {children}
      <ToastContainer />
      <InstallPrompt />
      <CommandBar open={commandBarOpen} onClose={() => setCommandBarOpen(false)} />
    </>
  )
}
