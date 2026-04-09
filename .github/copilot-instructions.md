# GitHub Copilot Instructions — Weather Dashboard

React 18 + TypeScript weather app.

## Stack

- React 18, TypeScript strict + `erasableSyntaxOnly`
- Vite 8 + `@tailwindcss/vite` (Tailwind v4)
- React Router v7 — `/` and `/city/:name`
- TanStack Query v5 — all server state
- MSW v2 — Node server for Vitest, browser worker for dev
- Vitest + Testing Library + jsdom

## Project Structure

```
src/
  api/        # HTTP + parsing (no React)
  components/ # Reusable UI
  hooks/      # Data + local state hooks
  mocks/      # MSW handlers, server, browser, fixtures
  pages/      # Route-level components
  types/      # Shared TS interfaces (no logic)
tests/
  components/ # Component tests
  setup.ts    # MSW lifecycle + jest-dom
```

## Agents & Prompts

After creating or modifying any file in `.github/agents/` or `.github/prompts/`, always run the **Readme Updater** agent to keep `README.md` in sync:

1. Switch the agent picker to **Readme Updater**.
2. Send: _"update the readme"_.

The agent will rewrite only the `## GitHub Copilot Agents` section of `README.md` to reflect the latest agents and prompts.

## All agent prompts MUST:

- Include MCP context as JSON
- Specify exact tests to pass
- Require JSON-only output
- Prefer smallest-patch fixes
