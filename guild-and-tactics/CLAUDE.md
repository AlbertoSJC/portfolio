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
- `node tmp/verify_battle.mjs` / `node tmp/verify_village.mjs` — browser
  E2E screenshot passes (need the dev server running; tmp/ is untracked,
  recreate from the dev log's description if absent)

## Status (2026-06-18, M3 complete)

**M1, M2, and M3 complete.**

### M3 delivered:
- ✅ **All 33 advanced classes defined** per race in `src/content/advancedClasses/`
- ✅ **`allowedAdvancedClasses` populated** in `src/content/races.ts`
- ✅ **Class mastery tracking** and **prerequisite gates** wired
- ✅ **Skills per level** — `ClassSkillEntry[]` with `learnedAtLevel` on all classes; per-level unlock works at battle assembly time via `UnitFactory`
- ✅ **Status effects live**: poison (damage per turn), sleep (auto-skip), blind (hit-chance penalty)
  - `Battle.processStartOfTurnForActiveUnit()` handles start-of-turn effects
  - `Battle.endActiveUnitTurn` ticks down stat modifiers AND status effects
  - `BattleController.startTurnForActiveUnit` calls `processStartOfTurnForActiveUnit`, handles sleep recursion
  - New skills: `venom_strike` (Thief lv5), `smoke_dart` (Thief lv8), `sleep_dust` (Mage lv5)
- ✅ **Element wheel expanded**: `earth_spike` (Warrior lv7), `frost_bolt` (Mage lv7); richer monster affinities covering fire/water/earth/sacred/dark
- ✅ **Village map screen**: canvas-drawn 4-node town map replaces the tab bar; party marker on active building; roster+inventory merged under Guild Hall. `src/ui/village/VillageMapCanvas.ts`
- ✅ **Character sheet refactored** into `src/ui/village/character/` (5 files)

**101 vitest tests, typecheck clean.**

**M4 next targets:**
- Overworld map with 3 settlements and travel + random encounters (§6.0, §6.1)
- Guild reputation tiers unlocking better store stock and recruits
- Dispatch quests (send members away for passive reward)
- More maps, quests, and items (toward §8 content targets)
- Equipment-skill mastery (FFTA-style: use an item's skill in battle to learn it permanently)
- Additional status effects (slow, haste, protect, shell, regen)
