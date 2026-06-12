# FinQuest — Gamified Personal Finance Adventure

Transform your financial goals into an RPG. Create savings, investing, debt-payoff, budgeting, and learning **quests**, earn XP and coins as you make real progress, keep a daily **streak** alive, and watch a composite **Financial Health Score** track how you're doing — all wrapped in celebration animations that make hitting a goal feel earned.

> Portfolio project showcasing a full-stack TypeScript SaaS: local-first state with cloud sync, auth, a typed API, domain-driven design, and a tested, animated React UI.

## Features

- **Quest system** — full CRUD for financial goals with categories, priorities, due dates, search/filter/sort, and animated progress updates
- **Celebrations** — confetti quest-complete modal, level-up overlay, and floating progress micro-feedback (Motion/Framer Motion)
- **Gamification depth** — XP and levels, coins, data-driven achievements with unlock progress, daily activity streaks, rotating daily challenges, and earned player titles
- **Dashboard** — Recharts visualizations, financial metrics hero, and an animated SVG Financial Health Score gauge (4-component breakdown + 7-day sparkline)
- **Accounts & sync** — anonymous **demo mode** runs fully offline in localStorage; sign up (better-auth) and the same state syncs to the server, validated with Zod and stored via Prisma
- **Dark mode** — full CSS-variable theme, persisted without FOUC

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| State | Zustand 5 with persist middleware (local-first, server sync for signed-in users) |
| Domain | Plain TypeScript classes (`Player`, `Quest`, `Achievement`) with business logic |
| Animation | Motion (Framer Motion) 12 |
| Charts | Recharts |
| Auth | better-auth (email + password, cookie sessions) |
| Database | Prisma 6 — SQLite locally, Postgres-ready for production |
| Validation | Zod 4 on all API payloads |
| Testing | Vitest + React Testing Library (unit/component), Playwright (E2E) |
| CI | GitHub Actions — lint, type-check, unit tests, build, E2E |

## Architecture

Hexagonal-ish layering — UI and persistence depend on the domain, never the reverse:

```
src/
├── app/           # Next.js routes & API route handlers (/api/auth, /api/player)
├── components/    # Feature-organized React components
├── domain/        # Player, Quest, Achievement classes (business logic)
├── stores/        # Zustand stores (player, notifications/celebrations, score history)
├── services/      # PlayerRepository boundary (API sync adapter)
├── hooks/         # useCelebration, useQuestForm, useTheme, ...
├── utils/         # Pure functions: health score, titles, achievement metrics, fixtures
├── enums/ types/  # Shared contracts
└── lib/           # auth, prisma client, zod schemas
```

The persistence boundary is the interesting part: Zustand's persist middleware is the always-on local adapter (demo mode), and `ApiPlayerRepository` syncs the same serialized state to `/api/player` for signed-in users — server wins on login, debounced push afterwards.

## Getting Started

```bash
npm install
cp .env.example .env        # fill in BETTER_AUTH_SECRET (npx @better-auth/cli secret)
npx prisma migrate dev      # creates the local SQLite database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No account is required — demo mode persists to localStorage; create an account on the **Account** page to sync across devices.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop / build / serve |
| `npm test` | Vitest unit & component tests |
| `npm run test:e2e` | Playwright end-to-end suite (builds & serves on :3100) |
| `npm run lint` / `type-check` | ESLint / TypeScript |
| `npm run db:migrate` / `db:studio` | Prisma migrations / data browser |

## Deployment

Deploy to Vercel; provision a Postgres database (Neon/Supabase), set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`, and change the datasource `provider` in `prisma/schema.prisma` to `postgresql` (then `prisma migrate deploy`).
