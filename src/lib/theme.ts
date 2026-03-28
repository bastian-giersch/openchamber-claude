"use client"

export type Theme = "dark" | "light" | "system"

const STORAGE_KEY = "openchamber-theme"

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "dark" || stored === "light" || stored === "system") return stored
  } catch {}
  return "dark"
}

export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return
  const resolved = theme === "system" ? getSystemTheme() : theme
  document.documentElement.setAttribute("data-theme", resolved)
  // Also set class for Tailwind
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(resolved)
}

export function resolveTheme(theme: Theme): "dark" | "light" {
  return theme === "system" ? getSystemTheme() : theme
}
