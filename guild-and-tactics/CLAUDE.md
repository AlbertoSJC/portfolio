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

## Status (2026-06-15, after session with CharacterSheet split)

**M1 and M2 complete and browser-verified.** 

**M3 substantially implemented** (2026-06-14):

- ✅ **All 33 advanced classes defined** per race in `src/content/advancedClasses/`:
  - Organized into 6 files (shared, human, werecat, werelizard, undead, feryan)
  - Each class has displayName, description, statisticGrowth (per-level curves), prerequisite (base + level reqs), skills (per-level unlock list)
  - PRD §4 matrix fully represented
- ✅ **`allowedAdvancedClasses` populated** in `src/content/races.ts` — each race knows which 33 classes it can reach
- ✅ **Class mastery tracking** — `classLevelsReached: Partial<Record<BaseClassIdentifier, number>>` wired into `ClassChange`, `Unit`, and `UnitFactory`; switching classes preserves mastery map
- ✅ **Battle unit assembly** now merges primary + all mastered base classes' skills/stats (secondary skill set logic)
- ✅ **Stats derivation** updated — active class growth curve now applies per-level; equipment bonuses still fold in
- ✅ **Skills per level** — base and advanced classes have `ClassSkillEntry[]` with `learnedAtLevel`; character sheet shows unlocks; "Unlocks at Lv.X" for locked skills
- ✅ **Class prerequisite gates** — advanced class switch blocked if reqs not met; character sheet displays locked classes with prerequisite labels
- ✅ **Character sheet refactored** (2026-06-15) — split into `src/ui/village/character/` (5 files: types, sheet, skills, class picker, equipment) to prepare for overworld reuse

**M3 remaining gaps** (next implementation targets):
- **Per-level skill learning** — `GuildMember.learnedSkillIdentifiers` (skills unlocked through leveling, separate from class skills) not yet wired; `applyExperienceGain` should trigger unlocks
- **Status effect processing** — `tickDownStatusEffects` hook in `Battle.endActiveUnitTurn` stubbed; poison damage, sleep turn-skip, blind hit-chance penalty not yet active
- **Status-inflicting skills** — skills that apply status effects not yet added to `src/content/skills.ts`
- **Element wheel** — `elementalAffinities` on equipment/monsters still sparse; element-boosting passive skills not added
- **Village map screen (§6.0)** — tab bar not yet replaced with building-node walkable map; planned for M3 or M4

**What's ready to build on:**
- Advanced class system is complete and testable; no more type scaffolding needed
- CharacterSheet is split into maintainable modules, ready to move outside village when overworld arrives
- All class data is in place; next natural step is wiring per-level skill learning, then status effects

**Verification**: 105+ vitest tests (class definitions, mastery tracking, prerequisite gates, stats derivation); browser-verified class switching with stat rollup and secondary skill display.
