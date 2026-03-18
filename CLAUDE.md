# CLAUDE.md

We're building the app describe in @memory-bank/spec.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- **Package manager**: Bun (not npm/yarn)
- `bun dev` — Start dev server (uses `--webpack` flag for Tiptap compatibility)
- `bun run build` — Production build (static export to `/out`)
- `bun run lint` — ESLint (flat config, next.js core-web-vitals + typescript presets)
- `bun install --frozen-lockfile` — Install dependencies (CI-safe)

## Architecture

**Next.js 16 static SPA** deployed to GitHub Pages at `/life-after-6pm`. Despite using Next.js, this is a fully client-side app — all components are `"use client"`, there are no server components or API routes, and routing is hash-based (`/#journal/{id}`, `/#edit/{id}`, `/#new`).

**Data layer**: Supabase PostgreSQL with Row-Level Security. No ORM — direct Supabase client queries. Public read access on journals/comments; authenticated write access scoped to author. The Supabase client is initialized in `app/lib/supabase.ts`.

**Auth**: Supabase email/password auth, exposed via React Context (`app/lib/auth-context.tsx` → `useAuth()` hook).

**Rich text**: Tiptap v3 editor storing content as JSON in Supabase's JSONB column. Tiptap v3 ships source-only, so `next.config.ts` has a custom webpack alias to compile it.

**Styling**: CSS Modules with global CSS variables. Dark mode via `prefers-color-scheme` media query. No Tailwind or CSS-in-JS.

**Analytics**: Google Analytics 4 via custom gtag wrapper (`app/lib/analytics.ts`).

## Key Files

- `app/page.tsx` — Main SPA entry point with hash-based routing
- `app/layout.tsx` — Root layout (GA script, AuthProvider)
- `app/lib/supabase.ts` — Supabase client singleton
- `app/lib/auth-context.tsx` — Auth context provider and `useAuth()` hook
- `app/components/Editor.tsx` — Tiptap editor (used in both edit and read-only modes)
- `next.config.ts` — Static export config, base path, Tiptap webpack aliases

## Environment Variables

All prefixed with `NEXT_PUBLIC_` (client-side accessible). Set in `.env.local` locally and as GitHub Actions secrets for deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds with Bun and deploys static output to GitHub Pages. Triggered on push to `main`. The `next.config.ts` sets `output: "export"` and `basePath: "/life-after-6pm"` for this hosting model.

## Database Schema

**journals**: id (UUID), title, content (JSONB — Tiptap JSON), preview (TEXT — auto-extracted ~200 chars), created_at, updated_at, author_id (FK to auth.users)

**comments**: id (UUID), journal_id (FK), name, email, body, created_at
