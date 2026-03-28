import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const DB_PATH = path.join(process.cwd(), "data", "openchamber.db")

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")

  migrate(_db)
  return _db
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      repo_path TEXT NOT NULL,
      repo_url TEXT,
      branch TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
      started_at TEXT NOT NULL,
      last_activity_at TEXT NOT NULL,
      completed_at TEXT,
      working_directory TEXT NOT NULL,
      total_messages INTEGER DEFAULT 0,
      total_tool_calls INTEGER DEFAULT 0,
      total_diffs INTEGER DEFAULT 0,
      cwd TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_events (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS tool_calls (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      event_id TEXT NOT NULL,
      tool TEXT NOT NULL,
      input TEXT NOT NULL,
      output TEXT,
      status TEXT NOT NULL DEFAULT 'running',
      started_at TEXT NOT NULL,
      completed_at TEXT,
      duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS file_diffs (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'modified',
      additions INTEGER DEFAULT 0,
      deletions INTEGER DEFAULT 0,
      diff_content TEXT NOT NULL,
      review_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permission_requests (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      tool TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      repo_url TEXT,
      branch TEXT NOT NULL DEFAULT 'main',
      last_opened_at TEXT NOT NULL,
      session_count INTEGER DEFAULT 0,
      active_session_count INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_name);
    CREATE INDEX IF NOT EXISTS idx_events_session ON session_events(session_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_tools_session ON tool_calls(session_id);
    CREATE INDEX IF NOT EXISTS idx_diffs_session ON file_diffs(session_id);
    CREATE INDEX IF NOT EXISTS idx_permissions_session ON permission_requests(session_id);
  `)
}

// Helper for JSON columns
export function parseJson<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) as T }
  catch { return fallback }
}

export function toJson(val: unknown): string {
  return JSON.stringify(val)
}
