// ============================================================================
// Provider Switching
// ============================================================================
// Reads PROVIDER_MODE from environment to select real or mock provider.
// Falls back to mock if Claude Code data is not available.
// ============================================================================

import type { ClaudeCodeAdapter } from "../adapters/claude-code-adapter"
import { mockProvider } from "../mock/provider"

let _provider: ClaudeCodeAdapter | null = null
let _providerMode: "mock" | "real" = "mock"

function detectProviderMode(): "mock" | "real" {
  // Explicit env override
  const envMode = process.env.OPENCHAMBER_PROVIDER
  if (envMode === "mock") return "mock"
  if (envMode === "real") return "real"

  // Auto-detect: check if ~/.claude/ exists with session data
  try {
    const fs = require("fs")
    const path = require("path")
    const os = require("os")
    const claudeDir = path.join(os.homedir(), ".claude")
    const projectsDir = path.join(claudeDir, "projects")

    if (fs.existsSync(projectsDir)) {
      const dirs = fs.readdirSync(projectsDir)
      const hasJsonl = dirs.some((d: string) => {
        const p = path.join(projectsDir, d)
        try {
          return fs.statSync(p).isDirectory() &&
            fs.readdirSync(p).some((f: string) => f.endsWith(".jsonl"))
        } catch { return false }
      })
      if (hasJsonl) return "real"
    }
  } catch {
    // Can't detect, fall back to mock
  }

  return "mock"
}

export function getProvider(): ClaudeCodeAdapter {
  if (_provider) return _provider as ClaudeCodeAdapter

  _providerMode = detectProviderMode()

  if (_providerMode === "real") {
    try {
      // Dynamic import to avoid loading if not needed
      const { realProvider } = require("../adapters/claude-code-real-adapter")
      _provider = realProvider
      console.log("[OpenChamber] Using REAL Claude Code provider")
    } catch (err) {
      console.warn("[OpenChamber] Failed to load real provider, falling back to mock:", err)
      _provider = mockProvider
      _providerMode = "mock"
    }
  } else {
    _provider = mockProvider
    console.log("[OpenChamber] Using MOCK provider")
  }

  return _provider!
}

export function getProviderMode(): string {
  return _providerMode
}

// Allow runtime switching
export function setProviderMode(mode: "mock" | "real"): void {
  _provider = null
  process.env.OPENCHAMBER_PROVIDER = mode
  _providerMode = mode
}
