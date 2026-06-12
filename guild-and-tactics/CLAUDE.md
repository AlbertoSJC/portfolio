# Guild & Tactics — session guide

FFTA-inspired tactical RPG in TypeScript. **README.md is the PRD and the
source of truth** — read it before changing anything. Key sections:

- §4 — the locked race/class matrix (33 advanced classes; Feryans cannot
  use magic except their exclusive Spellblade).
- §9.1 — **binding code conventions**: literal full-word naming, no magic
  numbers (named constants in dedicated modules), one concept per file,
  content as typed data in `src/content/`, `tests/` mirrors `src/` 1:1.
- §10 — web-first; Steam later via Electron. All platform-touching code
  (saves, etc.) goes through `src/platform/` interfaces — never call
  `localStorage` directly from sim/ui/render.
- §11 — milestone status + development log. **Append to the log whenever
  something notable is built or decided.**

`LORE.md` (untracked, private) holds the world/race lore and the pantheon —
all class, skill, and quest naming must follow it. If it's missing, ask the
user for it; do not invent or commit lore.

## Architecture

`src/sim/` — all game rules; no DOM imports; seeded RNG (battles replay
deterministically). `src/content/` — typed data only. `src/render/` —
canvas isometric; ALL unit visuals go through `SpriteRegistry.ts`.
`src/ui/` — HTML/CSS overlay HUD + procedural WebAudio sounds.
`src/app/` — controllers / composition root.

## Commands

- `npm run dev` — dev server on :5173
- `npm test` / `npm run typecheck` / `npm run build` — all three must pass
  before declaring work done
- `node tmp/verify_battle.mjs` — browser E2E screenshot pass (needs the
  dev server running; tmp/ is untracked, recreate from the dev log's
  description if absent)

## Status (2026-06-12)

M1 (combat slice) complete and browser-verified. **Next: M2 — the guild
loop**: Wanderer's Rest village UI (tavern quest board / store /
recruitment hall), gold/XP/leveling, save/load via a `SaveGameStorage`
interface in `src/platform/`. See README §11 for the full plan.
