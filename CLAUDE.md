# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Architecture

GenoScript is a pharmacogenomics (PGx) report analysis tool. Medical professionals use it to check drug-gene interactions for patients using CPIC guidelines.

### Stack
- **Next.js 16** with App Router (React 19, TypeScript, Tailwind CSS 4)
- **shadcn/ui** (new-york style) + Radix UI for components
- **MongoDB** for persistence (via `lib/db.ts`, requires `MONGODB_URI` env var)
- **CPIC API** (`https://api.cpicpgx.org/v1`) for pharmacogenomics data

### Key directories
- `app/` — Next.js App Router pages and API routes
- `components/` — React components (feature + shadcn/ui base)
- `lib/` — Utilities: `utils.ts` (cn helper), `db.ts` (MongoDB singleton), `cpic.ts` (CPIC API client)
- `hooks/` — Custom React hooks

### Routing
- `/` → redirects to `/patients`
- `/patients` — patient list with search
- `/patients/[id]` — drug checker + gene lookup for a patient
- `/new` — add patient with PDF upload
- `/api/users` and `/api/users/[id]` — REST stubs (not yet wired to DB)

### Data flow
Pages are currently demo-data driven (hardcoded in the page components). The real integration path is: PDF upload → parse → store in MongoDB via API routes → fetch on patient pages → call `lib/cpic.ts` for drug/gene recommendations.

### CPIC severity levels
`red` (avoid) | `yellow` (caution) | `green` (ok) | `gray` (no data) — used in `DrugResultCard` and `SeverityBadge`.

### Environment variables
- `MONGODB_URI` — required for database connection (see `.env.example`)

### Styling conventions
- Use `cn()` from `lib/utils.ts` for conditional Tailwind classes
- Brand colors: Navy `#0A2540`, Teal `#00C9A7` — defined inline, not in Tailwind config
- Tailwind v4 uses `@tailwindcss/postcss` plugin (not the classic `tailwindcss` PostCSS plugin)
