"use client"

import { useEffect } from "react"

type KeyHandler = (e: KeyboardEvent) => void

export function useHotkeys(keyMap: Record<string, KeyHandler>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      const parts: string[] = []
      if (e.metaKey || e.ctrlKey) parts.push("mod")
      if (e.shiftKey) parts.push("shift")
      if (e.altKey) parts.push("alt")
      parts.push(e.key.toLowerCase())
      const combo = parts.join("+")

      if (keyMap[combo]) {
        e.preventDefault()
        keyMap[combo](e)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [keyMap])
}
