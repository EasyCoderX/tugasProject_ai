# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"What's This?" — an AI-powered object learning app for kids (ages 3-8). Kids capture/upload an image, AI identifies the object via VLM, reads a fun fact aloud (TTS), and offers educational mini-games (spelling, quiz, puzzle). Supports 3 languages (en/id/zh).

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Prisma (SQLite) + z-ai-web-dev-sdk (VLM/Chat/TTS). Package manager: npm (bun also works).

## Commands

```bash
npm run dev          # Dev server on :3000 (logs to dev.log via tee)
npm run lint         # ESLint (very permissive config)
npm run db:push      # Push Prisma schema to SQLite (used over migrations)
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Prisma migration dev
npm run db:reset     # Reset database
```

No test framework is configured. No tests exist.

## Architecture

### Single-Page Monolith

The entire frontend lives in **one file**: `src/app/page.tsx` (~1130 lines, client component). All state is managed with `useState`/`useCallback`/`useRef`. UI is tab-based: Home (camera/identify), Learn (spelling), Games (quiz + puzzle), Chat (AI buddy), Profile (achievements/history/feedback). Two tiny helper components (`Btn`, `BigBtn`) are defined at the bottom of the same file.

**Key runtime dependencies not obvious from the stack list**: `framer-motion` (animations throughout page.tsx), `@dnd-kit/core` + `@dnd-kit/sortable` (puzzle game drag-and-drop).

### API Routes

All backend logic is in `src/app/api/` using Next.js App Router route handlers. Protected routes call `requireAuth()` from `src/lib/auth.ts`, which throws a `Response` (status 401) on auth failure. Routes catch `error instanceof Response` and return it.

| Route | Purpose | Backend |
|-------|---------|---------|
| `/api` | Health check | Returns `{ message: "Hello, world!" }` |
| `/api/identify` | Image identification | z-ai Chat VLM (`glm-4.6v-flash`) |
| `/api/speak` | TTS voice synthesis | z-ai TTS (5 voices via `voice` param, default `chuichui`) |
| `/api/chat` | AI chat | z-ai Chat (`glm-4-flash`) |
| `/api/auth/*` | Register/login/logout/me/update/upgrade | Prisma SQLite |
| `/api/history` | History CRUD | Prisma SQLite |
| `/api/history/[id]` | Delete individual history item | Prisma SQLite |
| `/api/achievements` | Achievement unlock + scan milestones | Prisma SQLite |
| `/api/feedback` | Rating submission (1-5) | Prisma SQLite |
| `/api/quiz` | Score save + perfect-score achievement | Prisma SQLite |

### Key Libraries

- **`src/lib/auth.ts`** — Cookie-based sessions (`kidlearn_session`). Session is base64-encoded JSON with userId/username/displayName. Not encrypted or signed. httpOnly, 30-day maxAge. No Next.js middleware; auth is per-route.
- **`src/lib/db.ts`** — Prisma singleton via `globalThis` pattern to avoid hot-reload connection issues. Query logging enabled (`log: ['query']`).
- **`src/lib/i18n.ts`** — Flat-key i18n with 130+ keys × 3 languages. `useTranslation(lang)` returns `t(key, params?)`. Supports `{placeholder}` interpolation. Fallback chain: requested lang → English → raw key. Includes `confirmClearAll` key for history clear confirmation dialog.
- **`src/lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge).

### Data Flow

Camera capture → base64 image → `/api/identify` (VLM) → result (name/emoji/description/funFact/category) → auto-save to history → auto-TTS via `/api/speak` (z-ai TTS). The frontend calls `/api/speak` with `text`, `voice`, and `speed`, receives a WAV audio blob, and plays it via `HTMLAudioElement`. The 5 voice options (Chuichui, Tongtong, Jam, Kazi, Xiaochen) correspond to z-ai TTS voice IDs sent to the backend.

### Database

5 Prisma models: `User`, `HistoryItem`, `Achievement`, `Feedback`, `QuizScore`. Schema lives in `prisma/schema.prisma`. Uses `db:push` (not migrations). Image data stored as base64 strings in SQLite. DB file: `db/custom.db`.

### AI SDK Pattern

`z-ai-web-dev-sdk` is instantiated per-request: `const zai = await ZAI.create()`. Uses `zai.chat.completions.create()` for both image ID (with VLM model) and chat, `zai.audio.tts.create()` for TTS. `VISION_MODEL` env var overrides the default `glm-4.6v-flash`.

## Conventions

- **Path alias**: `@/*` maps to `./src/*`
- **shadcn/ui**: new-york style, lucide icons. Components in `src/components/ui/`
- **Production deploy**: Standalone build + Caddy reverse proxy (port 81 → localhost:3000). Build script in `.zscripts/build.sh` packages app + db + Caddyfile + start.sh as tar.gz, also runs `db:push` and builds mini-services if present.
- **TypeScript**: `strict: true` but `noImplicitAny: false` (in tsconfig.json). `ignoreBuildErrors: true` and `reactStrictMode: false` are set in `next.config.ts` — the project prioritizes speed over type strictness.
- **ESLint**: Extremely permissive — 16+ rules disabled (no-explicit-any, no-unused-vars, etc.).
- **`skills/` directory**: Contains 45+ Z.ai skill definitions. Not runtime code; ignored by gitignore and ESLint.
- **Git commits**: UUID-based messages (agent-driven).
- **No build**: Never run `npm run build` during development — dev server (`npm run dev`) is sufficient for testing changes.
- **Unused dependencies**: `next-auth`, `next-intl`, `zustand`, `@tanstack/react-query`, `@tanstack/react-table` are present in package.json but not actively used by the app. Auth is custom cookie-based, i18n is custom, state is useState-based.