# AGENTS.md

Critical facts agents would likely miss without guidance:

## Development Commands

- `bun run dev` - Dev server logs to `dev.log` (not stdout)
- `bun run db:push` - Schema changes use this, NOT migrations
- `bun run start` - Runs standalone build (`.next/standalone/server.js`)

## Architecture

- **All frontend in one file**: `src/app/page.tsx` (~995 lines). Don't search for components elsewhere.
- **Auth is per-route**: `requireAuth()` in `src/lib/auth.ts` throws `Response(401)` on failure. No Next.js middleware.

## Database

- Schema in `prisma/schema.prisma`, uses `db:push` (not migrations)
- DB file: `db/custom.db`
- Images stored as base64 in SQLite (500K char limit)

## Build & TypeScript

- `ignoreBuildErrors: true` in TypeScript config - build will succeed even with type errors
- ESLint is extremely permissive (most rules disabled)
- No test framework configured

## Production

- Standalone build required (`bun run build`)
- Caddy reverse proxy on port 81 → localhost:3000

## Other

- `@/*` path alias maps to `./src/*`
- `skills/` directory: ignored by git and ESLint
- Auth sessions: base64-encoded JSON cookie (`kidlearn_session`), NOT encrypted