import { getProviderMode } from "@/lib/providers"
import { NextResponse } from "next/server"
import fs from "fs"
import os from "os"
import path from "path"

export const dynamic = "force-dynamic"

function isClaudeCodeConnected(): boolean {
  const sessionsDir = path.join(os.homedir(), ".claude", "sessions")
  if (!fs.existsSync(sessionsDir)) return false

  try {
    const files = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".json"))
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(sessionsDir, file), "utf-8")
        const session = JSON.parse(content)
        if (session.pid && Number.isInteger(session.pid)) {
          try {
            process.kill(session.pid, 0)
            return true
          } catch {
            // process not alive, continue checking
          }
        }
      } catch {
        // malformed json, skip
      }
    }
  } catch {
    // cannot read dir
  }

  return false
}

export async function GET() {
  const homeDir = os.homedir()
  const sessionsDir = path.join(homeDir, ".claude", "sessions")
  const projectsDir = path.join(homeDir, ".claude", "projects")

  const healthStatus = {
    provider: getProviderMode(),
    watcherActive: false,
    claudeCodeConnected: isClaudeCodeConnected(),
    lastSync: new Date().toISOString(),
    sessionsDir: fs.existsSync(sessionsDir),
    projectsDir: fs.existsSync(projectsDir),
  }

  return NextResponse.json(healthStatus)
}
