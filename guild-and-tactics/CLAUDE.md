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
deterministically, zone exploration too). `src/content/` — typed data
only. `src/render/` — canvas isometric battle grid; ALL unit visuals go
through `SpriteRegistry.ts`. `src/ui/` — HTML/CSS overlay HUD + procedural
WebAudio sounds; `src/ui/overworld/` is the world map + zone + town
screens, `src/ui/guild/` is the global Guild menu (see Status below — **the
guild has no home location**, "the village" was fully retired in M4).
`src/app/` — controllers / composition root (`GameController`,
`BattleController`, `ZoneController`).

**Map screens are full-bleed, not header+canvas.** World Map, Zone, and
Town all fill the viewport (`OverworldMapCanvas.ts`/`ZoneGridCanvas.ts`
track their container's size via `ResizeObserver`) with HTML chrome
overlaid directly on the canvas: `.map-location-plaque` (bottom-left,
name + description, `IM Fell English` display font), `.map-status-pill`
(top-right, gold + reputation tier), `.map-corner-buttons` (bottom-right,
Guild/World Map/Leave Town). These rules live in `src/ui/sharedPanels.css`
next to the other cross-screen chrome. `OverworldMapCanvas.ts`'s
node-graph renderer is shared by the World Map (zone nodes) *and* the
Town screen (Tavern/Store nodes) — same canvas, different `MapNodeKind`.

## Commands

- `npm run dev` — dev server on :5173
- `npm test` / `npm run typecheck` / `npm run build` — all three must pass
  before declaring work done
- `node tmp/verify_battle.mjs` / `node tmp/verify_zone_exploration.mjs` —
  browser E2E screenshot passes (need the dev server running; tmp/ is
  untracked, recreate from the dev log's description if absent)

## Status (2026-06-18, M3 complete; M4 underway)

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
- ✅ **Village map screen**: canvas-drawn 4-node town map replaced the tab
  bar; party marker on active building; roster+inventory merged under
  Guild Hall. *(Superseded in M4 below — `VillageMapCanvas.ts`/
  `VillageScreen.ts`/`village.css` were deleted when the guild's home
  location was retired entirely; the character-sheet split below
  survived the move into the Guild menu.)*
- ✅ **Character sheet refactored** into `src/ui/village/character/` (5 files,
  still in use — lifted into `GuildMenu.ts` in M4, files unmoved)

### M4 delivered so far:
- ✅ **Guild reputation tiers** (`src/sim/guild/ReputationTier.ts`): Bronze →
  Silver (5 completed quests) → Gold (15) → Platinum (30), derived from
  `guild.completedQuestCount` via `reputationTierForQuestCount`.
  - Store: `EquipmentDefinition`/`ConsumableItemDefinition` gained an
    optional `minimumReputationTier`; `restockStore` (now tier-aware) skips
    gated items until the guild ranks up. First gated items: Steel
    Greatblade, Iron Mail (silver), Strong Potion (silver).
  - Recruitment hall: offer count now scales with tier via
    `RECRUITS_ON_OFFER_BY_TIER` (bronze/silver 3, gold 4, platinum 5),
    replacing the old fixed `RECRUITS_ON_OFFER_COUNT`.
  - Tier badge shown in the map status pill (`.map-tier-badge`, colored per
    tier in `sharedPanels.css`) — *originally* `.reputation-tier-badge` in
    the village header, moved here when the village was retired below.
  - Save migration: `normalizeLoadedGuild` now also normalizes
    `recruitsOnOffer` members (old saves could omit the field entirely).
- ✅ **World map + walkable zones + roaming encounters** (§6.0/§6.1) —
  **the village is retired entirely**, superseding a same-day-earlier
  design (single "Wanderer's Rest" hub + a hidden dice roll per road).
  "Wanderer's Rest" is now just the guild's name; there is no home
  location anywhere in the game.
  - `src/sim/guild/ZoneDefinition.ts` (replaces the deleted
    `OverworldRegionDefinition.ts`): a zone's exploration-grid layout
    (`explorationGridWidth/Height`, `obstacleTiles`, `entryTile`,
    `tavernTile`, `roamingGroups`) plus its battle-assembly data
    (`battleMapIdentifier`, `encounterSpawnTiles`,
    `rewardGoldPerEncounter`) — two separate coordinate spaces, never mixed.
  - `src/content/zones.ts` (replaces `regions.ts`): the 3 zones — North
    Road, Marsh Trail, Quarry Path — each a 9×7 grid reusing the existing
    3 battle maps/monster pools. **More zones/settlements are future
    iterations**, not this pass.
  - `src/sim/grid/ZonePathfinding.ts` (new): plain 4-directional BFS for
    click-to-move on the exploration grid (`findShortestZonePath`) —
    deliberately simpler than `MovementRange.ts` (battle-specific
    height/jump/flight rules).
  - `src/sim/guild/ZoneSession.ts` (new): the pure per-visit state machine
    — player position, every roaming group's patrol index,
    `movePlayerTo()` advances the player one tile *and* every active
    group one patrol step, reporting a collision or tavern arrival.
    Mirrors `Battle.ts`'s role for exploration.
  - `src/app/ZoneController.ts` (new, beside `BattleController.ts`): owns
    one `ZoneSession`; on a click, paths once then steps through it one
    tile at a time (160ms apart) so the player can watch groups patrol,
    stopping early on collision (opens a muster prompt reusing the
    existing muster-card components) or tavern arrival *(originally an
    inline Tavern overlay in `ZoneScreen.ts` — superseded a few bullets
    below by `TownScreen.ts`, current behavior described there)*.
  - `src/ui/overworld/zone/` (new): `ZoneGridCanvas.ts` (top-down parchment
    grid, not isometric — tavern icon, monster icons, player token) +
    `ZoneScreen.ts` *(at this point: header, the grid, and both modals —
    Tavern quests+store tabs, and the collision muster prompt; the header
    and Tavern modal were both removed later — see "Full-bleed map
    screens + Town screen" below for `ZoneScreen.ts`'s current,
    much-smaller scope)*.
  - `src/ui/guild/GuildMenu.ts` (new): roster/inventory/recruitment as a
    **persistent modal reachable from anywhere** (world map or any zone) —
    a lift of the old `VillageScreen`'s Guild Hall + Recruitment logic
    onto its own `ModalDialog` attached to `document.body`, not tied to a
    screen.
  - `src/ui/overworld/OverworldMapCanvas.ts`/`OverworldScreen.ts`
    (rewritten): no home/hub node — just zone nodes in a simple chain;
    clicking one enters that zone directly (no more region-detail/muster
    panel on the world map itself — muster now happens at the moment of
    collision, inside the zone).
  - **`GameController.ts` de-duplicated** (follow-up, same session):
    `embarkOnQuest`/`catchRoamingGroup` shared a `startBattle(mapEntry,
    units, deployedMemberIdentifiers, combatLogLabel, onConcluded)` helper;
    `concludeQuestBattle`/`concludeZoneEncounterBattle` shared a
    `buildBattleConclusion(outcome, goldRewardOnVictory,
    bonusExperienceOnVictory, onVictory)` helper (the two flows differed
    only in the reward amount and the post-victory side effect — quest
    board/store/recruits vs. marking the roaming group defeated). A new
    `unitContentTables` field replaces the `{races, baseClasses,
    advancedClasses, monsters, equipment}` literal that was being rebuilt
    in both flows. No behavior change — verified by the existing 146 tests
    plus a fresh browser pass confirming the collision → muster → battle
    pipeline still works end-to-end through the shared helpers.
  - **Data model**: `GuildState.questIdentifiersOnBoard` changed from
    `string[]` to `Record<zoneIdentifier, string[]>`; `storeStock` keys
    became `` `${zoneIdentifier}:${itemIdentifier}` `` (via
    `StoreStock.ts`'s `restockStore`/`storeStockOf`/`takeOneFromStoreStock`,
    all zone-aware now; `hasZoneBeenStocked` replaces the old
    "empty map ⇒ never stocked" check, looped per zone in
    `GameController`'s boot sequence). `QuestBoard.ts` gained
    `questIdentifiersForZone(zone, quests)` — a quest belongs to a zone's
    tavern iff `quest.battleMapIdentifier === zone.battleMapIdentifier`
    (zero changes needed to `quests.ts`). **Save format bumped to v5**;
    pre-v5 saves reset `storeStock`/`questIdentifiersOnBoard` to `{}` (old
    shapes are meaningless under per-zone scoping) and the boot sequence
    heals every zone from there, same as a fresh save.
  - `QuestBattleAssembly.ts`/`EncounterBattleAssembly.ts`/
    `EncounterGeneration.ts` reused as-is (the latter's signature changed
    from `(region, rng)` to `(roamingGroup, encounterSpawnTiles, rng)` —
    spawn tiles are now zone-level, shared across that zone's groups).
  - **Content bug found and fixed by a new test, not by playtesting**:
    North Road's first `wolf_pack` patrol route was **mathematically
    uncatchable** — player and patrol tile parity flip every step, and if
    the entry tile's parity doesn't match the route's, they can never
    coincide, regardless of pathing. `tests/sim/guild/EncounterBattleAssembly.test.ts`
    now has `isRoamingGroupCatchableFromEntry` (a real reachability BFS
    over (position, patrolIndex) states) asserting every zone's roaming
    groups are reachable — verified to fail on the broken route and pass
    after shifting it. **Any new zone's patrol route must satisfy this
    test** — it is not just a style check, it catches genuinely unplayable
    content.
  - **Deliberate simplifications, not yet built**: a real mid-battle
    "flee" action (avoidance today only works by routing around a group
    *before* contact); monster level-scaling by region (monster pools are
    fixed-level data); no persisted zone position (returning to a zone
    after a battle resumes where you stood, in-memory only; reloading the
    page always lands on the world map at each zone's `entryTile`).
- ✅ **Full-bleed map screens + Town screen** (follow-up, same session —
  the header+small-canvas layout looked unfinished; see Architecture
  above for the chrome pattern):
  - `OverworldMapCanvas.ts` generalized: `MapNodeEntry` gained a
    `kind: 'zone' | 'tavern' | 'store' | 'guild'`, with `drawTavernIcon`/
    `drawStoreIcon`/`drawGuildHallIcon` recreated from the deleted
    `VillageMapCanvas.ts` (notice-board / coin-stack / heraldic shield).
    Both it and `ZoneGridCanvas.ts` are now full-bleed
    (`ResizeObserver`-driven, node/cell layout recomputed every resize)
    instead of a fixed intrinsic pixel size; `src/ui/mapVignette.ts` (new)
    adds a shared radial-darkening edge treatment both canvases use.
  - **New `TownScreen.ts`**: walking onto a zone's tavern tile now opens
    its own full-bleed building-map (Tavern + Store + Guild Hall nodes)
    instead of a two-tab popup — a faithful re-creation of the retired
    `VillageScreen`'s pattern (map + inline building content + a
    `ModalDialog` only for quest-detail muster). `ZoneController` gained
    a `mode: 'exploring' | 'town'` toggle; both screens share
    `zoneRootElement` — no `GameController`/`index.html` changes needed.
    `ZoneScreen.ts` lost ~150 lines of Tavern-modal code (moved to
    `TownScreen.ts`) and now only hosts the collision-muster modal.
  - **0 new vitest tests** (presentation-only, verified by browser
    screenshot passes the same way every other UI surface here is) —
    `npm test`/`typecheck`/`build` all unaffected, still 146/clean.
  - **Follow-up polish (same day, after playtesting)**:
    `.primary-action-button` (Embark/Fight) and `.muster-card` restyled
    from a flat blue rectangle + navy/neon-yellow cards to a warm
    gold/bronze embossed button (`IM Fell English`, gradient, drop shadow)
    and warm brown/gold muster cards, matching the map palette instead of
    clashing with it. `TownScreen` now opens straight into the Tavern's
    quest board on arrival (`ZoneController.enterTown()` calls
    `townScreen.openTavern()` right after rendering) instead of requiring
    an extra click on the building-map. The Guild Hall is now a 3rd
    building node on the Town map (clicking it calls the same global
    `onOpenGuildMenu()` — the guild still has no fixed home, this is just
    a clearer entry point *while already standing in a town*); the
    floating "Guild" corner button was removed from `TownScreen`
    specifically (World Map and Zone screens keep it, since they have no
    "town" to host it in).

**146 vitest tests, typecheck clean.**

**⚠ Open question — revisit the zone exploration grid:** the user is not
convinced the per-zone walkable "minimap" (the small FFTA1-style grid
you click-to-move around, §6.0/§6.1 in the README) is actually working —
not a bug report, a design doubt (engagement/legibility/feel, raised
2026-06-19 right after playtesting it). Don't treat its current shape as
settled before building more zones on top of it; revisit this — possibly
a bigger grid, a different patrol/encounter feel, or a different
interaction entirely — before investing further here. See README §12 for
the tracked open-decision entry.

**M4 next targets:**
- More zones/settlements, with real names — `LORE.md` doesn't name them
  yet (see binding rule above: do not invent lore)
- A real mid-battle flee option for roaming encounters (new
  `BattleOutcome` + HUD button)
- Monster level-scaling per zone/region
- Dispatch quests (send members away for passive reward)
- More maps, quests, and items (toward §8 content targets)
- Equipment-skill mastery (FFTA-style: use an item's skill in battle to learn it permanently)
- Additional status effects (slow, haste, protect, shell, regen)
- Harder quest ranks gated by reputation tier (tiers currently only gate store stock and recruit count)
