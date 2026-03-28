# OpenChamber

> Open source control plane for Claude Code sessions, diffs and workspaces.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## What is OpenChamber?

OpenChamber is a web-based control panel that reads your local Claude Code data (`~/.claude/`) and gives you a professional dashboard to manage, monitor, and review your AI coding sessions.

**No API keys. No setup. Zero config.** If you have Claude Code installed, OpenChamber just works.

## Features

| Feature | Description |
|---------|-------------|
| **Live Dashboard** | Real-time KPIs, activity feed, health monitoring |
| **Session Manager** | Browse, filter and inspect all Claude Code sessions |
| **Diff Review** | Review file changes with approve/reject workflow |
| **Workspace Browser** | Track projects and their sessions at a glance |
| **Command Bar** | Cmd+K to navigate anywhere instantly |
| **Notifications** | Real-time SSE-powered toast notifications |
| **Dark/Light Theme** | System-aware theme with persistence |
| **Mobile + PWA** | Installable, responsive, touch-optimized |
| **Export** | Download sessions, diffs, settings as JSON/Markdown |
| **Provider Switching** | Toggle between real data and mock mode for development |

## Quick Start

```bash
# Clone
git clone https://github.com/bastianhjr/openchamber-claude.git
cd openchamber-claude

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your Claude Code sessions appear automatically.

## How It Works

OpenChamber reads directly from Claude Code's local data:

```
~/.claude/
├── projects/
│   ├── -home-basti-myproject/
│   │   ├── session-abc123.jsonl   ← Session events
│   │   └── session-def456.jsonl
│   └── -home-basti-other/
│       └── session-xyz789.jsonl
└── sessions/                       ← Active session metadata
```

The real adapter parses JSONL files, extracts session metadata, events, tool calls, and file diffs. A mock adapter provides sample data for development.

## Tech Stack

- **Next.js 15** — App Router, Server Components, API Routes
- **React 19** — Client components with hooks
- **TypeScript** — Full type safety
- **Tailwind CSS v4** — Utility-first with CSS variables
- **SSE** — Server-Sent Events for real-time updates
- **Chokidar** — File watching for live session changes
- **PWA** — Installable with service worker caching

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── sessions/             # Session list + detail
│   ├── diffs/                # Diff review with filters
│   ├── workspaces/           # Workspace browser
│   ├── settings/             # Settings page
│   ├── landing/              # Landing page
│   └── api/                  # REST + SSE endpoints
├── components/
│   ├── command-bar/          # Cmd+K command palette
│   ├── dashboard/            # Dashboard client components
│   ├── diffs/                # Diff viewer + filters
│   ├── layout/               # Sidebar, providers, toast
│   ├── notifications/        # Notification bell
│   ├── pwa/                  # Install prompt
│   └── ui/                   # Shared UI components
└── lib/
    ├── adapters/             # Real + mock data adapters
    ├── hooks/                # Custom React hooks
    ├── providers/            # Provider switching
    ├── services/             # Notification service
    ├── watchers/             # File system watcher
    ├── types/                # TypeScript types
    ├── theme.ts              # Theme persistence
    ├── export.ts             # Export utilities
    └── pwa.ts                # PWA registration
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Base URL for API calls |
| `CLAUDE_PROVIDER_MODE` | auto | `real`, `mock`, or `auto` (detects ~/.claude/) |

### Provider Modes

- **Auto** (default): Detects `~/.claude/projects/` — uses real data if found, mock otherwise
- **Real**: Always reads from `~/.claude/`
- **Mock**: Uses generated sample data

Switch at runtime via the Settings page or the Connection Status indicator in the sidebar.

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### Docker

```bash
docker build -t openchamber .
docker run -p 3000:3000 \
  -v ~/.claude:/home/node/.claude:ro \
  openchamber
```

### PM2 (Self-hosted)

```bash
npm run build
pm2 start npm --name "openchamber" -- start
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed guides.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/sessions` | GET | All sessions |
| `/api/sessions/[id]` | GET | Session detail with events |
| `/api/diffs` | GET | All file diffs |
| `/api/diffs/[id]` | PATCH | Review diff (approve/reject) |
| `/api/workspaces` | GET | All workspaces |
| `/api/health` | GET | Health check |
| `/api/events` | GET (SSE) | Real-time event stream |
| `/api/provider` | GET/POST | Provider mode |

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ideas for Contributions

- MCP Tool Overview panel
- VS Code Extension integration
- Slack/Discord notification webhooks
- Session comparison / diff
- Multi-language support

## License

MIT © [Bastian Giersch](https://bastian-giersch.de)
