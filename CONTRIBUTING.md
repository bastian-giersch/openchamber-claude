# Contributing to OpenChamber

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/bastianhjr/openchamber-claude.git
cd openchamber-claude
npm install
npm run dev
```

The app runs on `http://localhost:3000` and auto-detects your Claude Code sessions.

## Architecture

- **Server Components** for data fetching (pages)
- **Client Components** for interactivity (components with `"use client"`)
- **API Routes** (`src/app/api/`) for REST endpoints
- **Adapter Pattern** (`src/lib/adapters/`) — `ClaudeCodeAdapter` interface with real + mock implementations
- **CSS Variables** for theming (see `globals.css`)

## Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Verify: `npm run build` passes
4. Commit with a descriptive message
5. Open a Pull Request

## Code Style

- TypeScript strict mode
- No semicolons (Prettier defaults)
- Tailwind CSS classes for styling
- CSS variables for theme colors
- Keep components small and focused

## Reporting Issues

Use the GitHub issue templates:

- **Bug Report**: Something broken? Include steps to reproduce.
- **Feature Request**: Have an idea? Describe the use case.
- **Integration**: Want to connect OpenChamber to something? Let's discuss.

## Questions?

Open a [GitHub Discussion](https://github.com/bastianhjr/openchamber-claude/discussions) or reach out on Twitter.
