# Changelog

A short record of what was built and decided, so anyone (including future us, or a desktop/Steam port effort per §10 of README) can follow the trail.

**2026-06-12 — M1 complete.**

- *Scaffold*: Vite + Vitest + strict TypeScript, zero runtime dependencies.
  Folder skeleton per §9.1; `tests/` mirrors `src/` one-to-one.
- *Sim core* (`src/sim/`, no DOM imports, seeded RNG): charge-time turn
  order (FFTA-style), BFS movement with height/jump and Feryan flight,
  facing with side/back hit + crit bonuses, damage/heal/buff skill effects,
  elemental affinities (Sacred vs Undead, Dark absorption), win/lose
  detection, utility-scoring enemy AI (expected damage + knockout bonus +
  flanking preference).
- *Content as data* (`src/content/`): 5 races, 4 base classes, 12 skills in
  the shared pool, 3 Darkness monsters, demo party (one member per race),
  map authored as readable string rows.
- *Rendering* (`src/render/`): isometric diamond grid on canvas, height
  cliffs, facing wedges, highlight/preview overlays. Units are **procedural
  vector miniatures** drawn by `SpriteRegistry` (still the single swap
  point for future art): one parametric humanoid with per-race features
  (werecat ears + tail, werelizard bulk + snout, undead skull face, feryan
  wings + eagle hindquarters), a class item in hand (sword / dagger / orb
  staff / cross staff), a team-colored base plate, and bespoke shapes for
  each monster (wolf, stoneling, gnarlroot) — race, class, and team read
  at one glance with zero asset files.
- *Battle UX* (`src/ui/` + `src/app/`): action menu with hover **range
  previews** and an AoE blast preview while aiming; skill info box
  (description, effect, range, cost); hover-to-inspect any unit on map or
  in the turn-order strip (with map spotlight); end-turn facing chosen by
  clicking arrows around the unit, with live facing preview on hover.
- *Audio* (`src/ui/UserInterfaceSounds.ts`): fully procedural WebAudio —
  Kingdom Hearts–style celesta chimes through a generated convolution
  reverb (filtered-noise impulse, ~0.35 s room), lowpassed thuds for
  impacts. No audio files. Audio unlocks on first click (browser autoplay
  policy forbids sound before the first gesture).
- *Verification*: 46 vitest tests on the sim (formulas, movement, turn
  order, AI, factory rules — including "Feryan Mage throws"); browser E2E
  pass with puppeteer-core (`tmp/verify_battle.mjs`, untracked) confirming
  render, menus, previews, inspection, facing chooser, and enemy turns
  with zero page errors.
- *Known cosmetic quirks*: no favicon yet (harmless 404 in the console).
- *Post-verification fix*: the turn-order strip now always leads with the
  acting unit (highlighted), followed by the predicted upcoming turns.
- *Visual upgrade (same day)*: replaced the disc-with-letter placeholders
  with **procedural vector miniatures** (see §9 rendering bullet) so every
  unit's race, class, and team read at one glance. Contained entirely in
  `src/render/SpriteRegistry.ts` + the renderer's draw call — proof that
  the future real-art swap touches nothing else. Browser-verified with a
  fresh screenshot pass.

**2026-06-12 — M2 complete: the guild loop.**

- *Guild sim* (`src/sim/guild/`, `src/sim/progression/`): persistent
  `GuildState` (gold, roster, shared consumable inventory, quest board,
  recruits, completed-quest count); XP curve with multi-level-up handling
  and the level-30 cap; kill XP per defeated enemy + quest XP on victory;
  **defeat keeps kill XP but forfeits the reward** (PRD §5 retreat rule);
  quest board that refills from the repeatable pool without duplicates;
  recruit generation honoring race/class rules (a Feryan candidate can
  never roll Mage — tested).
- *Wanderer's Rest* (`src/ui/village/`): tabbed village screen — Tavern
  (quest board with difficulty stars, lore descriptions, party muster up
  to 6, Embark), Store (buy/sell consumables at half-back), Recruitment
  Hall (3 rotating candidates, refreshed after each victory), Roster (XP
  progress bars). Scene switch village ↔ battle handled by the new
  `GameController`, which owns the guild state and persists it on every
  change.
- *Consumables in battle*: the store sells Potions/Ethers; battles carry
  the guild inventory as an item pouch — an **Items** action (range 1,
  ally or self, uses the turn's action) heals HP or restores MP, honoring
  the FFTA rule that mana only comes back through items. Used charges stay
  used, win or lose.
- *Content*: 8 repeatable quests across 3 maps (Forest Clearing + new
  Marsh Road and tiered Old Quarry), 2 new monsters (charging Twisted
  Boar; flying **Hollow Wisp**, whose Dark Bolt heals undead party members
  by absorption), recruit name pools per race, 3 consumables.
- *Persistence* (`src/platform/SaveGameStorage.ts`): the platform boundary
  from §10, with a versioned-JSON localStorage implementation; corrupt or
  unknown-version saves load as "no save" instead of crashing. Battles are
  not saved mid-fight — reloading returns to the village (deliberate M2
  simplification).
- *Verification*: 69 vitest tests (guild state, XP/level-ups, quest board,
  recruit legality, item use in battle, save round-trip + corrupt-save
  handling, and a content-validity sweep proving every quest spawn and
  deployment tile is standable on its map); browser E2E
  (`tmp/verify_village.mjs`, untracked) walking the real loop — buy a
  potion (gold 300→270), muster 5, embark, battle starts with the bought
  Potion ×3 in the Items menu, reload restores the save.
- *Known M2 simplifications*: no mid-battle saves; no party pre-selection
  memory; store stock is fixed (reputation tiers arrive in M4).

**2026-06-12 — M2.5: village UX iteration + equipment basics (pulled
forward from M3).**

- *Equipment system* (`src/sim/items/EquipmentDefinition.ts`,
  `src/sim/guild/MemberEquipment.ts`): three slots (weapon / armor /
  accessory), flat stat bonuses folded into unit derivation, weapons
  class-bound (a thief cannot take the mage's staff — tested), guild
  stores hold unequipped pieces, equipping swaps the old piece back.
  11 pieces in `src/content/equipment.ts`. Save format bumped to **v2
  with a v1 migration** (old saves gain the empty equipment fields
  instead of being discarded — tested).
- *Character sheet* (`src/ui/village/CharacterSheet.ts`): click a roster
  member → modal with portrait, XP bar, full derived battle statistics
  (equipment included), and per-slot equipment management with an inline
  picker of suitable gear from the stores.
- *Portraits everywhere* (`src/ui/village/MemberPortrait.ts`): the
  battlefield's procedural miniatures drawn onto small canvases in the
  roster, recruitment hall, character sheet, and party muster — what you
  see in the village is exactly what fights.
- *Tavern flow*: quest postings open as a **modal** (reusable
  `ModalDialog`: backdrop / × / Escape) with lore text and a card-based
  party muster (click to select, gold highlight, selection counter) —
  no more checkboxes.
- *Store*: split into Consumables and Equipment sections; equipment cards
  show slot, class restriction, stat bonuses, price, and stock; buy/sell
  verified (Swift Charm round-trip 300→180→240 gold at the half-back
  rule). Roster tab gained a "Guild stores" inventory summary.
- *Verification*: 78 vitest tests; browser E2E (`tmp/verify_sheet.mjs`)
  confirming sheet ATK 12→15 on equipping the Iron Sword, the picker,
  buy/sell math, portraits, and the quest modal muster.

**2026-06-12 — M2.6: store depth + class switching.**

- *Store stock* (`src/sim/guild/StoreStock.ts`): shelves hold limited
  stock (5 per consumable, 2 per equipment piece), shown on every card;
  buying decrements it and "Out of stock" disables the button. Caravans
  restock fully after every completed quest. Multi-buying verified in the
  browser (3 potions: stock 5→2, gold 300→210).
- *Item icons* (`src/ui/village/ItemIcons.ts`): procedural canvas icons
  by item type — healing/mana flasks, sword/dagger/staff/rod (weapon
  silhouette picked from the wielding class), breastplate, ring. Same
  swap-point principle as the unit miniatures.
- *Store filters*: pill sub-tabs under the main tabs — All / Consumables
  / Weapons / Armor / Accessories.
- *Character sheet completed*: **Skills section** (current class's skills
  with description, range, MP cost) and **Classes section** — every base
  class the member's race allows, each with its skill list and a switch
  button. *Class switching* (`src/sim/guild/ClassChange.ts`) keeps level
  and XP, and gear the new class cannot use returns to the guild stores
  automatically (browser-verified: Garrick Warrior→Mage dropped the Iron
  Sword back into the stores). Per-level skill learning, mastered-class
  secondary skill sets, and advanced classes remain M3.
- *Save format*: storeStock field added; load-normalization treats a
  missing/empty stock map as "never stocked" and refills it.
- *Verification*: 86 vitest tests (stock, class-change legality including
  the Feryan no-magic rule, illegal-gear auto-unequip); browser E2E
  (`tmp/verify_store_classes.mjs`).

**2026-06-13 — Village UI refactor (presenter/view split).**

- Extracted `src/ui/village/presenters/` (pure view-model builders, zero DOM,
  unit-testable) and `src/ui/village/views/` (thin DOM renderers that take
  view models and emit elements). `VillageScreen.ts` reduced from 669 lines
  to ~280 by delegating all building logic to these modules.
- Removed all obvious comments across the village layer; kept only comments
  where the WHY is non-obvious.

**2026-06-14 — M3 implementation: advanced classes + mastery + skills wiring.**

- *Vanilla bugfix*: close quest modal when quest is embarked. Prevents double-modal layering.
- *Advanced class definitions* (`src/content/advancedClasses/`): all 33 classes from PRD §4 now defined, organized per race:
  - `shared.ts`: Knight, Berserker, Ranger, Duelist, Sage, Assassin (6 shared across races)
  - `human.ts`: Dragoon, Black Mage, Illusionist, Bishop, Rune Knight, Paladin, Spellthief, Inquisitor (13 total for Human)
  - `werecat.ts`: Shadowdancer, Galeweaver, Windwanderer, Priest of the 8 Lives, Phantom, Shrine Warden (10 total)
  - `werelizard.ts`: Geomancer, Shaman, Stonefist, Totem Guard (7 total)
  - `undead.ts`: Dread Knight, Pyromancer, Necromancer, Revenant, Ashguard, Wraith (7 total)
  - `feryan.ts`: Skylancer, Spellblade (forced magic exception), Skytalon (5 total)
  - Each class has `displayName`, `description`, `statisticGrowth` (per-level stat gains), `prerequisite` (base class + level reqs), `skills` (per-level unlock list).
- *`allowedAdvancedClasses` populated* in `src/content/races.ts` per the §4 matrix; each race now knows which 33 classes it can reach.
- *Class mastery wiring* (`ClassChange.ts`, `Unit.ts`, `UnitFactory.ts`):
  - `classLevelsReached: Partial<Record<BaseClassIdentifier, number>>` now tracks the highest level reached in each base class; switching classes keeps this map updated.
  - Battle unit assembly in `QuestBattleAssembly.ts` now merges primary class stats + skills with stats/skills from **all** previously mastered base classes (secondary skill set logic).
  - `ClassChange.prerequisiteMet` now checks: pure advanced (5 in base) or hybrid (5 primary + 3 secondary).
  - Tests expanded: class switching keeps mastery, stats roll up correctly, illegal switches (Feryan→Mage) still blocked.
- *Stats rework* (`DamageCalculation.ts`, `Unit.ts`):
  - Unit statistics now correctly derive from **base class + advanced class growth** (previously only base). Leveling now applies the active class's growth curve.
  - Equipment bonuses still apply correctly.
- *Character sheet UI improvements* (`src/ui/village/CharacterSheet.ts`, 142 insertions):
  - Advanced class tab now populated with all valid classes for the member's race; greyed-out if prerequisites not met.
  - Prerequisite labels show required base class levels (e.g. "Warrior Lv.5 + Mage Lv.3").
  - On class switch, the sheet re-derives and displays stats with the new class's growth curve.
- *Skills per level* (`src/content/baseClasses.ts`, `UnitDefinitions.ts`, `SkillDefinition.ts`):
  - Base classes now include `skills: ClassSkillEntry[]` (skill + `learnedAtLevel`).
  - Advanced classes also have `skills: ClassSkillEntry[]`.
  - Character sheet skill tab now shows which skills unlock at which levels; locked skills display "Unlocks at Lv.X".
  - Battle unit assembly merges: primary class skills + secondary class skills + equipment-learned skills.
- *Verification*: 86→105+ test cases; browser E2E confirms class switching, stat derivation, skill unlocks, and prerequisite gates.
- *Known M3 gaps*: per-level skill learning (GuildMember.learnedSkillIdentifiers) not yet wired; status-effect processing in Battle still stubbed; no element wheel or villain encounters yet.

**2026-06-15 — CharacterSheet split into `village/character/` subfolder.**

- Broke the monolithic 641-line `src/ui/village/CharacterSheet.ts` into five focused files under `src/ui/village/character/`: `CharacterSheetTypes.ts` (shared callback and content-table interfaces), `CharacterSheet.ts` (entry point + header/stats top row), `SkillsPanel.ts` (primary and secondary skills tab), `ClassPicker.ts` (class change screen), `EquipmentSection.ts` (equipment slots and inline item picker). Zero logic changes — typecheck clean.
- The `character/` subfolder is intentionally placed one level below `village/` so that when the overworld map arrives and the character sheet needs to appear outside the village context, the whole folder moves to `src/ui/character/` with a single import-path update.

**2026-06-18 — M3 complete: status effects, village map, element wheel.**

- *Status effects* (`src/sim/units/Unit.ts`, `src/sim/battle/`): poison, sleep,
  and blind are now live in battle.
  - **Poison** deals `POISON_DAMAGE_PER_TURN` (8 HP) at the start of each
    poisoned unit's turn. Death by poison triggers knockout/victory events
    correctly.
  - **Sleep** auto-ends the sleeping unit's turn (`turnSkippedBySleep` event)
    and is handled in `BattleController.startTurnForActiveUnit()` via a
    recursive call — chains of sleeping units are handled safely.
  - **Blind** subtracts `BLIND_HIT_CHANCE_PENALTY` (0.35) from the blinded
    attacker's hit chance in `calculateHitChance`; the function now takes the
    attacker unit as its first parameter.
  - `tickDownStatusEffects` called in `Battle.endActiveUnitTurn` alongside the
    existing `tickDownStatModifiers`. `Battle.processStartOfTurnForActiveUnit()`
    is the new public hook for start-of-turn effects.
  - **New skills**: `venom_strike` (Thief lv5 — poison 3 turns), `smoke_dart`
    (Thief lv8 — blind 3 turns), `sleep_dust` (Mage lv5 — sleep 2 turns).
  - `SkillExecution` now handles the `statusEffect` skill-effect kind.
  - `BattleEvents` gains `statusEffectApplied`, `poisonDamageDealt`, and
    `turnSkippedBySleep`. `CombatLogFormatting` formats all three.
  - `EnemyArtificialIntelligence.scoreAttack` updated to pass the attacker
    to `calculateHitChance`.
  - New `tests/sim/units/Unit.test.ts`; Battle, SkillExecution,
    and DamageCalculation tests updated. 101 tests total.

- *Village map screen* (`src/ui/village/VillageMapCanvas.ts`): the tab bar
  is replaced with a canvas-drawn 2D village map showing four building nodes —
  Tavern, Store, Recruitment Hall, and Guild Hall. Clicking a node navigates to
  that building; the party marker sits on the active node; hover highlights.
  Roster and Inventory are merged under the Guild Hall building.
  Follows the same swap-point principle as `SpriteRegistry` and
  `MemberPortrait`: the canvas rendering is entirely inside `VillageMapCanvas.ts`
  and the rest of `VillageScreen.ts` never touches it.

- *Element wheel expansion* (`src/content/`):
  - **New skills**: `earth_spike` (Warrior lv7 — physical/earth, range 2),
    `frost_bolt` (Mage lv7 — magical/water, range 4).
  - **Richer monster affinities**: Twisted Wolf (+fire weakness, +sacred
    weakness, water resistance); Stoneling (stronger fire resistance, added
    earth resistance, increased water weakness); Twisted Boar (increased fire
    weakness, earth resistance); Gnarlroot (strong fire weakness, water and
    earth resistance). Six elements now meaningfully covered by player skills:
    Fire, Sacred, Dark, Water, Earth, and the status-effect skills (non-elemental).

- *Per-level skill learning*: confirmed working — `UnitFactory` already filters
  class skills by `learnedAtLevel <= member.level` at battle assembly time.
  The `GuildMember.learnedSkillIdentifiers` field from the earlier design was
  not needed; the class system handles it cleanly.

**2026-06-18 — M4 started: guild reputation tiers.**

- *Reputation tiers* (`src/sim/guild/ReputationTier.ts`, new): Bronze →
  Silver (5 completed quests) → Gold (15) → Platinum (30); the current tier
  is derived on demand from `guild.completedQuestCount` via
  `reputationTierForQuestCount` — no new persisted field.
- *Store gating* (`StoreStock.ts`): `EquipmentDefinition` and
  `ConsumableItemDefinition` gained an optional `minimumReputationTier`;
  `restockStore` now takes the guild's current tier and skips items above
  it. First gated items: Steel Greatblade and Iron Mail (silver, equipment),
  Strong Potion (silver, consumable).
- *Recruitment hall scales with tier* (`RecruitGeneration.ts`): the fixed
  `RECRUITS_ON_OFFER_COUNT` (3) is replaced by `RECRUITS_ON_OFFER_BY_TIER`
  (bronze/silver 3, gold 4, platinum 5).
- *Village header*: a colored reputation badge (`.reputation-tier-badge`)
  next to the quest counter; tier colors in `village.css`.
- *Save migration*: `normalizeLoadedGuild`'s per-member normalization was
  extracted into `normalizeMember` and is now also applied to
  `recruitsOnOffer` (old saves could have offers with missing equipment
  fields, just like roster members); a missing `recruitsOnOffer` array now
  normalizes to `[]` instead of crashing.
- *Verification*: 118 vitest tests (was 101 after M3 — new
  `ReputationTier.test.ts` plus tier coverage added to `StoreStock.test.ts`
  and `RecruitGeneration.test.ts`); typecheck clean.

**2026-06-19 — M4: overworld map, travel, and random encounters.**

- *Overworld map screen* (`src/ui/overworld/`, new folder mirroring
  `src/ui/village/`): `OverworldMapCanvas.ts` draws a hub-and-spoke map —
  a "Wanderer's Rest" home node at the center with road nodes (currently
  North Road / Marsh Trail / Quarry Path) arranged evenly around it,
  built on the same `mapPalette.ts` colors and hover/click mechanics as
  `VillageMapCanvas.ts`. Reached from the village via a new "World Map"
  button on the village header (`VillageScreen.ts` gained
  `onOpenOverworld`); `GameController` gained a third scene
  (`showOverworld()`) alongside village/battle.
- *Region detail + muster* (`OverworldScreen.ts`,
  `presenters/RegionPresenters.ts`, `views/RegionDetailView.ts`): clicking
  a road shows its description, the monsters it may roll, and the gold
  reward, then reuses the existing muster-card components
  (`buildMusterCardViewModels` / `renderMusterCard`) so picking a patrol
  works exactly like picking a quest party.
- *Encounter generation* (`src/sim/guild/`, new files):
  `OverworldRegionDefinition.ts` (region type — battle map, encounter
  chance, monster pool, enemy count range, a pre-validated spawn-tile
  pool, flat gold reward), `EncounterGeneration.ts`
  (`generateEncounterEnemySpawns` — rolls a count in range, then a unique
  tile + random monster per spawn from the region's pools, fully
  deterministic given a seed), `EncounterBattleAssembly.ts`
  (`createUnitsForEncounterBattle`). `QuestBattleAssembly.ts` was
  refactored (no behavior change — existing tests pass unmodified) to
  export `createGuildUnitsFromDeployedMembers` and
  `createEnemyUnitsFromSpawns`, shared by both quest and encounter
  assembly instead of duplicated.
- *Content* (`src/content/regions.ts`, new): 3 regions reusing the
  existing 3 maps and monster pool — North Road (Forest Clearing:
  twisted wolves, gnarlroots), Marsh Trail (Marsh Road: twisted boars,
  hollow wisps), Quarry Path (Old Quarry: stonelings, twisted wolves).
  Spawn tiles reuse positions already proven standable by existing
  quests on the same maps.
- *Controller flow* (`GameController.ts`): `patrolRegion` rolls
  `randomNumberGenerator.rollChance(region.encounterChance)` — a miss
  re-renders the overworld with a "the road was quiet" message and no
  battle; a hit assembles and starts a real battle exactly like
  `embarkOnQuest` does. `concludeEncounterBattle` mirrors
  `concludeQuestBattle`'s victory/defeat shape (kill XP always, gold only
  on victory) but pays `region.rewardGoldPerEncounter` instead of a quest
  reward and skips quest-board/reputation side effects; `onContinue`
  returns to the overworld map, not the village.
- *No save-format change*: a patrol is a round trip resolved in one
  sitting, so nothing new needed persisting in `GuildState` — no v5
  migration.
- **Deliberate v1 simplifications** (flagged in the plan, not bugs):
  - No new settlements or place names. README's other 2 villages aren't
    named in `LORE.md`, and `CLAUDE.md` says not to invent lore — so the
    overworld currently has only Wanderer's Rest plus 3 *roads*
    (README's wording explicitly allows "settlement **and landmark**
    nodes"), not locked settlement placeholders.
  - No monster level-scaling by region. README mentions "a level range
    scaled to region," but monsters are fixed-level data with no growth
    curve; encounter tables instead pick *which* existing monsters can
    appear and how many (1–2).
  - No mid-battle flee button. README says encounters can be fled "at
    any time," but no battle today has any flee/retreat action — defeat
    already has retreat semantics (keep kill XP, no reward), and
    encounters reuse that path. A real flee option would touch
    `Battle.ts`/`BattleController.ts`/`BattleHud.ts` for a nuance, not
    the core ask.
- *Verification*: 126 vitest tests (was 118) — `EncounterGeneration.test.ts`,
  `EncounterBattleAssembly.test.ts` (mirrors `QuestBattleAssembly.test.ts`,
  plus a region content-validity sweep reusing `isPositionInsideMap` /
  `tileAt(...).isImpassable`); typecheck and build clean. Browser E2E
  (`tmp/verify_overworld.mjs`, untracked): World Map button works, the
  canvas renders all 4 nodes, selecting a road shows the right detail and
  muster list, a quiet-road result and a triggered encounter battle (with
  the right map/monsters and a combat-log line naming the region) were
  both observed; zero page errors beyond the pre-existing harmless
  favicon 404.

**2026-06-19 — M4: world map + walkable zones + roaming encounters
(supersedes the same-day entry above).**

After playtesting the dice-roll overworld above, the actual design
direction (FFTA/FFTA2 references, user-decided) turned out to be
different enough to rework rather than extend: **the guild has no home
location** — "Wanderer's Rest" is its name, not a place — and random
encounters should be *visible, avoidable roaming groups* on a walkable
grid, not a hidden chance roll. This entry replaces most of the above.

- *Retired entirely*: `src/ui/village/VillageScreen.ts`,
  `VillageMapCanvas.ts`, `village.css`; `src/sim/guild/OverworldRegionDefinition.ts`,
  `src/content/regions.ts`; `#village-root`. No unit tests referenced any
  of these (UI here is browser-E2E-verified only), so the deletion was
  clean. Their still-needed generic rules (`.village-card`, `.muster-*`,
  `.quest-detail`, `.modal-*`, `.character-sheet-*`, `.class-picker-*`,
  `.primary-action-button`, `.outcome-summary`, etc.) moved verbatim to a
  new `src/ui/sharedPanels.css` — **class names were kept unchanged**,
  only the file moved.
- *World map* (`OverworldMapCanvas.ts`/`OverworldScreen.ts`, rewritten):
  the home/hub node and party-marker-at-home concept are gone — just zone
  nodes in a simple chain, connected by roads. Clicking a node enters that
  zone directly; there's no more region-detail/muster panel on the world
  map itself (muster now happens at the moment of collision, inside the
  zone, not before travel).
- *Zone exploration* (new): the actual FFTA1-style walkable grid.
  - `src/sim/guild/ZoneDefinition.ts` (replaces `OverworldRegionDefinition.ts`):
    a zone's exploration-grid layout (`explorationGridWidth/Height`,
    `obstacleTiles`, `entryTile`, `tavernTile`,
    `roamingGroups: ZoneRoamingGroupDefinition[]`) plus the reused
    battle-assembly fields (`battleMapIdentifier`, `encounterSpawnTiles`,
    `rewardGoldPerEncounter`) — two coordinate spaces (the walkable grid vs.
    the tactical battle map), never mixed.
  - `src/sim/grid/ZonePathfinding.ts` (new): `findShortestZonePath` — plain
    4-directional BFS, deliberately simpler than `MovementRange.ts`
    (battle-specific height/jump/flight rules don't apply here).
  - `src/sim/guild/ZoneSession.ts` (new): the pure per-visit state machine
    (mirrors `Battle.ts`'s role) — player position, every roaming group's
    patrol index, `movePlayerTo()` advances the player one tile *and*
    every active group one patrol step in lockstep, reporting a collision
    or tavern arrival.
  - `src/app/ZoneController.ts` (new, beside `BattleController.ts`): on a
    click, paths once via `ZonePathfinding` then steps through it one tile
    at a time (160ms apart, `window.setTimeout`, cleared on `dispose()`
    like `BattleController` already does) so the player can watch roaming
    groups patrol — stopping early on collision (opens a muster prompt,
    reusing the existing muster-card components) or on reaching the
    tavern tile (opens the Tavern overlay).
  - `src/ui/overworld/zone/` (new): `ZoneGridCanvas.ts` — a top-down
    parchment grid (not isometric, consistent with the world map's
    aesthetic) with a tavern icon, monster icons, and a player token, full
    redraw per step (cheap on a 9×7 grid, no hover highlight — the screen
    rebuilds on every render like every other screen here, so a
    per-mousemove rebuild would be wasteful). `ZoneScreen.ts` hosts the
    header, the grid, and one `ModalDialog` swapping between the Tavern
    overlay (Quests/Store pill tabs, zone-scoped) and the collision muster
    prompt.
- *Guild menu* (`src/ui/guild/GuildMenu.ts`, new): roster, shared
  inventory, and recruitment as a **persistent modal reachable from
  anywhere** (world map or any zone) — a straight lift of
  `VillageScreen`'s old Guild Hall + Recruitment logic and the character
  sheet/class-picker modal-state handling, re-hosted on its own
  `ModalDialog` attached to `document.body` (already screen-agnostic, per
  `VillageScreen`'s own original pattern) instead of one specific screen.
- *Data model, save format v4 → v5*:
  - `GuildState.questIdentifiersOnBoard`: `string[]` → `Record<zoneIdentifier, string[]>`.
    `QuestBoard.ts` gained `questIdentifiersForZone(zone, quests)` — a
    quest belongs to a zone's tavern iff
    `quest.battleMapIdentifier === zone.battleMapIdentifier` (zero
    `quests.ts` changes needed); `refillQuestBoard`/`completeQuestOnBoard`
    both gained a `zoneIdentifier` parameter.
  - `GuildState.storeStock` stays `Record<string, number>` but keys became
    `` `${zoneIdentifier}:${itemIdentifier}` `` — `StoreStock.ts`'s
    `restockStore`/`storeStockOf`/`takeOneFromStoreStock` all gained a
    `zoneIdentifier` parameter; new `hasZoneBeenStocked` replaces the old
    single-zone "empty map ⇒ never stocked" check, now looped per zone in
    `GameController`'s boot sequence and in `newGame.ts`.
  - `SaveGameStorage.ts`: `CURRENT_SAVE_FORMAT_VERSION` 4 → 5; any pre-v5
    save resets `storeStock`/`questIdentifiersOnBoard` to `{}` (old
    keys/shapes are meaningless under per-zone scoping — same "heal
    forward" approach as every migration before it), and the boot
    sequence's per-zone restock/refill heals it from there, identically to
    a brand-new save.
- *Controller flow* (`GameController.ts`, heavily rewritten): dropped
  `villageScreen`/`showVillage()` entirely; added `guildMenu`,
  `zoneRootElement`, `activeZoneController` (persists across a battle
  interruption — fighting a roaming group does **not** dispose it, so
  returning from battle resumes the same zone visit, same player position,
  with that group now marked defeated for the rest of the visit).
  `showOverworld()` is the new boot/default scene. Quest embarks and
  store actions now resolve against `this.activeZoneIdentifier` (set by
  `showZone()`) instead of a global village context.
- *Content bug found by a new test, not by playtesting*: North Road's
  first `wolf_pack` patrol route was **mathematically uncatchable** —
  every step flips both the player's and the patrol's tile parity, so if
  the entry tile's parity doesn't match the route's, they can never
  coincide no matter how the player paths there. Caught while trying to
  force a collision for this verification pass, confirmed by hand (parity
  argument) and by a brute-force BFS solver script before fixing the
  route by shifting it one tile. Added a permanent regression test:
  `isRoamingGroupCatchableFromEntry` in
  `tests/sim/guild/EncounterBattleAssembly.test.ts` runs a real
  reachability BFS over (position, patrolIndex) states from each zone's
  `entryTile` — verified to fail on the broken route and pass after the
  fix. Any future zone's patrol route must satisfy this test.
- *Deliberate simplifications, not yet built*: a real mid-battle "flee"
  action (avoidance today only works by routing around a group *before*
  contact, same as the previous design's deferral); monster level-scaling
  by region; no persisted zone position (reloading the page always lands
  on the world map; re-entering a zone always starts at its `entryTile`
  unless it's the zone you just came from mid-session, which resumes in
  place).
- *Verification*: 146 vitest tests (was 126) — new
  `tests/sim/grid/ZonePathfinding.test.ts`, `tests/sim/guild/ZoneSession.test.ts`,
  updated `QuestBoard.test.ts`/`StoreStock.test.ts` (zone-scoped
  signatures), new `SaveGameStorage.test.ts` v4→v5 migration case, and the
  zone content-validity sweep described above; typecheck and build clean.
  Browser E2E (`tmp/verify_zone_exploration.mjs`, untracked): boot lands on
  the world map with no village, entering a zone renders the grid with a
  visible tavern icon and roaming-group icon, walking to the tavern opens
  zone-scoped quests/store, the Guild menu shows the same roster from both
  the world map and a zone; a second focused pass forced and confirmed the
  full collision → muster → battle pipeline (correct monsters, correct
  combat-log zone name) after the route fix. Zero page errors beyond the
  pre-existing harmless favicon 404.
- *Follow-up clean-up (same session)*: `embarkOnQuest`/`catchRoamingGroup`
  and `concludeQuestBattle`/`concludeZoneEncounterBattle` had grown ~70%
  identical (assemble units → build `Battle` → show it; then on
  conclusion: persist item pouch, kill XP, reward-on-victory, apply XP,
  build summary) — a real duplication risk, not just line count.
  Extracted `GameController.startBattle()` and `buildBattleConclusion()`;
  the two flows now differ only in their reward amount and post-victory
  side effect (quest board/store/recruits vs. marking the roaming group
  defeated). `GameController.ts` 536 → 505 lines; no behavior change
  (146 tests still pass, browser-reverified the collision → muster →
  battle pipeline through the shared helpers).

**2026-06-19 — Full-bleed map screens + Town screen (follow-up, same day).**

After playtesting the new World Map/Zone screens, the header-bar-above-a-
small-canvas layout read as unfinished — most of the viewport stayed
empty/black. The fix, plus a confirmed scope addition for "the Village
Screen" (the user clarified: not a revert of "no home location," but a
request for each zone's Tavern to open its own full-screen building-map
instead of a popup, like the old `VillageMapCanvas`):

- *Full-bleed canvases*: `OverworldMapCanvas.ts` and `ZoneGridCanvas.ts`
  no longer have a fixed intrinsic pixel size — both now track their
  container's actual rendered size via `ResizeObserver` and recompute
  their layout (node positions / cell size) on every resize, so the
  map/grid fills the viewport instead of floating in a dark void.
  `src/ui/mapVignette.ts` (new) adds a small shared radial-darkening
  helper both canvases call so the edges read as an aged map, not a flat
  color fill.
- *Map chrome replaces the header*: `.map-location-plaque`
  (bottom-left — zone/world name in a new **`IM Fell English`** Google
  Font for display titles only, description below in italic body text),
  `.map-status-pill` (top-right — gold + the reputation tier badge, which
  had quietly stopped being shown anywhere since the village header was
  removed), `.map-corner-buttons` (bottom-right — Guild / World Map /
  Leave Town). All added to `src/ui/sharedPanels.css`; the now-dead
  `.village-header`/`.village-header-stats`/`.world-map-button`/
  `.reputation-tier-badge`/`.village-layout*` rules were deleted.
- *`OverworldMapCanvas.ts` generalized*: `MapNodeEntry` gained
  `kind: 'zone' | 'tavern' | 'store'`; `drawTavernIcon`/`drawStoreIcon`
  were recreated from the deleted `VillageMapCanvas.ts` (notice-board /
  coin-stack, same drawing code) alongside the existing house icon, so the
  same canvas now renders both the World Map (zone nodes) and the new
  Town screen (building nodes).
- *New `src/ui/overworld/zone/TownScreen.ts`*: walking onto a zone's
  tavern tile now opens its own full-bleed building-map (Tavern + Store)
  instead of a two-tab popup modal — a 2-building re-creation of the
  retired `VillageScreen`'s pattern (map + inline building content + a
  `ModalDialog` only for quest-detail muster), reusing
  `buildQuestCardViewModels`/`renderQuestDetail`/`buildStoreCardViewModels`/
  etc. verbatim (lifted out of `ZoneScreen.ts`, not rewritten).
  `ZoneController.ts` gained a `mode: 'exploring' | 'town'` toggle; both
  screens render into the same `zoneRootElement` — no changes needed to
  `GameController.ts`, `index.html`, or `main.ts`. `ZoneScreen.ts` lost
  ~150 lines of Tavern-modal code and now only hosts the collision-muster
  modal.
- *Verification*: presentation-only — 0 new vitest tests (consistent with
  every other UI surface here being browser-verified, not unit-tested);
  `npm test`/`typecheck`/`build` all clean. Browser pass confirmed: the
  World Map and Zone screens fill the viewport with the plaque/pill/corner
  buttons in place at 1600×900; entering North Road and walking to its
  tavern (crossing the wolf pack's patrol en route, correctly triggering
  the muster prompt first) reached the new Town screen; clicking Tavern/
  Store opened the correct zone-scoped quest board and store stock;
  Leave Town returned to the same grid position; the Guild menu opened
  correctly from the World Map, the Zone screen, and the Town screen.
  Zero page errors beyond the pre-existing harmless favicon 404.

**2026-06-19 — Town screen polish (follow-up, after playtesting).**

Three small fixes from actually clicking through the new Town screen:

- *Button/card styling*: `.primary-action-button` (used by both the
  Tavern's Embark button and the collision-muster Fight button) was a
  flat blue rectangle that clashed with the parchment/ink map theme —
  restyled to a warm gold/bronze embossed button (`IM Fell English`
  display font, gradient, drop shadow, pressed state). `.muster-card`/
  `.muster-card.is-selected` moved from navy background + neon-yellow
  border to warm brown/gold, matching.
- *Town opens straight into the Tavern*: previously, entering a zone's
  Town showed the bare building-map first, requiring an extra click on
  the Tavern node. `TownScreen` gained a public `openTavern()`;
  `ZoneController.enterTown()` calls it right after rendering, so the
  quest board is already open the moment you arrive.
- *Guild Hall as a Town building*: added a 3rd node to `TOWN_BUILDINGS`
  (`drawGuildHallIcon` in `OverworldMapCanvas.ts`, recreated from the
  deleted `VillageMapCanvas.ts`'s heraldic-shield icon). Clicking it calls
  the same global `onOpenGuildMenu()` as the corner button everywhere
  else — the guild still has no fixed home, this just gives it a clearer
  entry point while already standing in a town. The floating "Guild"
  corner button was removed from `TownScreen` specifically (World Map and
  Zone screens still have it, since neither has a "town" to host it in).
- *Verification*: presentation-only, 0 new tests; `npm test`/`typecheck`/
  `build` unaffected. Browser-confirmed: Town opens directly into the
  Tavern's quest board; the Guild Hall node opens the Guild menu with the
  correct roster; only "Leave Town" remains as a Town corner button; the
  restyled Fight button renders correctly in both its disabled
  ("Select at least one member") and enabled ("Fight with N") states.

**2026-06-13 — M3 type scaffolding.**

- `AdvancedClassIdentifier` union (all 33 classes from PRD §4) and
  `ClassIdentifier = BaseClassIdentifier | AdvancedClassIdentifier` added to
  `src/sim/units/Unit.ts`.
- `GuildMember.baseClassIdentifier: BaseClassIdentifier` renamed to
  `classIdentifier: ClassIdentifier`; `masteredClasses: BaseClassIdentifier[]`
  field added. Save format bumped to **v3**; `normalizeLoadedGuild` migrates
  old saves transparently (tested).
- `RaceDefinition.allowedAdvancedClasses: AdvancedClassIdentifier[]` added to
  all five races (empty arrays — M3 fills them per the §4 matrix).
- `EquipmentDefinition.allowedBaseClasses` renamed to `allowedClasses:
  ClassIdentifier[]` so advanced-class characters can be granted weapon access
  without data changes.
- `StatusEffectKind` (`poison | sleep | blind`), `ActiveStatusEffect`,
  `tickDownStatusEffects`, and `activeStatusEffects: ActiveStatusEffect[]` on
  `Unit`; `StatusEffectSkillEffect` added to the `SkillEffect` union.
  Processing hook in `Battle` left for M3 once status-inflicting skills exist.
- Development log moved from README to CHANGELOG.md; README retains project
  overview only. 86 tests pass, typecheck clean.

**2026-06-22 — Zone exploration: tile grid → named-location road network.**

Resolves the open design doubt raised 2026-06-19 right after playtesting:
each zone's walkable "minimap" was a 9x7 tile grid with one roaming group
patrolling a literal 4-tile box in one corner — it read as artificial,
since the patrol had nowhere to roam *to*, and the shape didn't resemble
either FFTA1 or FFTA2. Replaced it with a small named-location road
network per zone (one tavern location, the rest plain landmarks,
connected by roads), reusing the existing BFS-pathfind →
step-with-collision-check flow with location identifiers in place of grid
tiles — a mechanical reshape, not new mechanics.

- *Sim layer* (`src/sim/`): `ZoneDefinition.ts` dropped
  `explorationGridWidth/Height`/`obstacleTiles`/`entryTile`/`tavernTile`
  for `entryLocationIdentifier`/`locations: ZoneLocationNode[]`/
  `roads: ZoneRoad[]`; `ZoneRoamingGroupDefinition.patrolRoute` changed
  from `GridPosition[]` to `string[]` (location identifiers). `src/sim/
  grid/ZonePathfinding.ts` (tile BFS) replaced by new `src/sim/graph/
  ZoneRoadGraph.ts` (`findShortestZoneRoute`, BFS over road adjacency;
  `buildZoneRoadAdjacency` exported for reuse). `ZoneSession.ts` reworked
  identically in shape — `movePlayerTo` takes a location identifier,
  lockstep patrol-advance unchanged, collision/`enteredTavern` checks
  became identifier equality / `location.kind === 'tavern'` lookups.
- *Content* (`src/content/zones.ts`): North Road and Marsh Trail each
  redesigned as 5 locations in a fork/diamond shape (entry → crossing →
  two branch landmarks → tavern); Quarry Path as 6 (one extra
  mason's-camp landmark). `wolf_pack`/`boar_herd` patrol 3 locations each,
  `stoneling_watch` patrols 4 — deliberately varied so the three zones
  don't all pace identically.
- *Rendering* (`src/ui/overworld/`): `OverworldMapCanvas.ts` (the World
  Map's/Town screen's shared node-graph renderer) generalized, not
  replaced — `MapNodeEntry.position` and `createOverworldMapCanvas`'s new
  `edges`/`afterRender` params are all optional and default to the exact
  prior auto-distributed-row, consecutive-pair-edge behavior, so
  `OverworldScreen.ts`/`TownScreen.ts` needed zero edits. New `'landmark'`
  `MapNodeKind` + icon. `ZoneGridCanvas.ts` replaced by
  `ZoneRoadMapCanvas.ts`, a thin wrapper feeding a zone's
  `locations`/`roads` into that same renderer and drawing roaming-group/
  player tokens via `afterRender`. `ZoneScreen.ts`/`ZoneController.ts`
  updated in lockstep (type-only changes, same control flow,
  `STEP_DELAY_MILLISECONDS` left at 160ms for this pass).
- *Content bug found and fixed by the existing reachability test, not by
  playtesting* — the same test class (`EncounterBattleAssembly.test.ts`'s
  `isRoamingGroupCatchableFromEntry`) that caught the original tile-parity
  bug in M4's first pass caught a road-graph equivalent: Quarry Path's
  4-stop `stoneling_watch` route formed an even-length cycle on an
  otherwise bipartite road graph, making it mathematically uncatchable
  from the entry location regardless of how the player paths there. Fixed
  by adding a direct `quarry_path_rim`–`quarry_path_pit` road (also reads
  fine thematically — the rim overlooks the pit), which breaks the
  bipartite parity trap. The test was ported to BFS over
  `(locationIdentifier, patrolRouteIndex)` states via road adjacency, plus
  new assertions that every road/patrol-stop/entry reference points at a
  real location and every patrol route has at least two distinct stops.
- *Deliberate simplifications, not yet built*: no unique mechanic on
  landmark locations yet (no location-scoped quests, no flavor-text
  popup) — this pass was structural/navigational only, per the explicit
  request to fix the patrol's repetitive feel before building anything
  else on top.
- *Verification*: sim layer fully vitest-covered (145 tests, typecheck and
  build clean). Presentation layer (`ZoneRoadMapCanvas`/`ZoneScreen`/
  `ZoneController`) has 0 new vitest tests, per this project's established
  pattern for canvas/controller work — verified instead by rewriting
  `tmp/verify_zone_exploration.mjs` for the road-network model and running
  two browser passes: North Road, deliberately walking into the wolf
  pack's patrol (collision → muster prompt → fight selection → battle
  launched, confirmed via screenshot); Marsh Trail, routing straight to
  the tavern without colliding (quest board, store stock, Leave Town, and
  World Map return all confirmed working). Zero page errors beyond the
  pre-existing harmless favicon 404.

**2026-06-22 — Town screen presentation: from modal popups to a docked content panel.**

Several rounds of feedback on the road-network rewrite above, same
session: Tavern/Store/Guild Hall content no longer pops up at all.
`TownScreen`'s building nodes are pushed toward the bottom of the screen
(reusing `OverworldMapCanvas`'s explicit-position support, added for the
road-network rewrite above) and the selected building's content fills the
freed space above them in a plain panel appended directly to the screen's
own root — no `ModalDialog`, no backdrop, nothing intercepting clicks. The
nodes stay visible and clickable underneath at all times, so switching
buildings never closes anything.

- `GuildMenu.ts` no longer owns a `ModalDialog` directly — its constructor
  takes a `GuildMenuHost` (`{ onOpen, onUpdate }`) and only ever builds
  content, never touching a display mechanism itself. `GameController.ts`
  now owns the `ModalDialog` explicitly and wires it as the host for the
  global "Guild" corner button (World Map/Zone screens — unchanged
  behavior). `TownScreen.ts` constructs its own separate `GuildMenu`
  instance, hosted by `.town-content-panel` instead — same
  roster/inventory/recruitment/character-sheet/class-picker code reused
  with zero duplication, two independent instances so neither's tab/
  drill-down state leaks into the other.
- `ZoneContentTables` gained `advancedClasses`/`skills` (the two
  `GuildMenuContentTables` fields it was missing). `TownScreenCallbacks`
  now `extends GuildMenuCallbacks`; dropped the now-unused
  `onOpenGuildMenu` (`ZoneScreen`'s own "Guild" corner button still uses
  it, unaffected). `ZoneControllerCallbacks` carries the same additions
  through from `GameController.ts`.
- Two earlier iterations this same session, rejected in turn: a permanent
  left-map/right-content split (shrinking the map permanently felt
  wrong), then a near-full-frame `ModalDialog` overlay with a non-dimmed
  backdrop (still structurally a popup — centered, rounded corners,
  shadow, floating in empty space on all four sides — "shouldn't even be
  a popup"). The non-dimmed `.modal-backdrop` change survived from that
  second iteration and still benefits the Guild modal and the
  roaming-encounter muster prompt, both unrelated to the docked-panel work
  above them.
- *Verification*: typecheck/tests/build all clean throughout (145 tests
  unaffected — presentation-only, zero new sim-layer surface). Two new
  browser scripts confirmed the global Guild modal and the Town-docked
  Guild panel are genuinely independent (opening one never opens the
  other), that clicking a different building node while the Guild panel
  is open switches content in place without closing anything, and that
  character-sheet drill-down/class-change/tab-switching all render
  correctly inside the docked panel.

**2026-07-01 — Mid-battle flee for roaming encounters.**

Resolves the "deliberate simplification" flagged 2026-06-19 (avoidance
only worked by routing around a group *before* contact): a roaming
encounter can now be abandoned mid-fight.

- `BattleOutcome` gained `'fled'`; `Battle` gained a constructor flag
  `isFleeingPermitted` (roaming encounters pass `true`, quest battles
  `false` — embarking on a posted quest remains a commitment) and a
  `fleeWithActiveUnit()` command that validates the flag and that a guild
  unit is acting, then ends the battle immediately with new
  `guildFled`/`battleEnded('fled')` events. Deterministic by design — the
  strategic cost is forfeiting the reward and leaving the roaming group
  alive on the map, not a dice roll.
- HUD: a "Flee" button appears after End Turn (encounter battles only);
  the outcome overlay gained a "Retreat…" headline. Conclusion handling
  matches defeat's economics: kill experience is kept, gold reward and
  victory side effects are forfeited, the roaming group is *not* marked
  defeated, and the party returns to the zone.
- *Verification*: 3 new vitest tests (flee sets the outcome and events;
  fleeing rejected when not permitted; fleeing rejected on an enemy turn).
  New `tmp/verify_flee.mjs` browser pass: collision → muster → battle →
  Flee shows the Retreat overlay and returns to the zone with the group
  still patrolling; a quest battle's action menu confirmed to have no
  Flee button. Zero page errors beyond the harmless favicon 404.

**2026-07-01 — Five new status effects: slow, haste, protect, shell, regen.**

Same session. The M3 status-effect machinery (apply/tick/expire) covered
them without structural change; the work was the hooks they act through
plus the first skills that use them.

- `slow`/`haste`: speed multipliers (0.5×/1.5×) via a new
  `effectiveSpeed(unit)` in `Unit.ts`, now used everywhere
  `TurnOrderQueue` reads speed (charge accumulation, tie-breaks,
  forecast). **This also fixed a latent bug**: the queue previously read
  `baseStatistics.speed` directly, so speed *stat modifiers* never
  actually changed turn order — only the HUD display. A new test pins the
  fix (a +speed modifier now genuinely earns extra turns).
- `protect`/`shell`: damage-taken multipliers (0.7× physical/magical) in
  `calculateDamageBeforeDice`, applied after elemental affinity on the
  positive-damage path only (absorption healing is untouched), before the
  minimum-damage floor.
- `regen`: start-of-turn healing (8, mirroring poison's 8), processed
  before poison in `processStartOfTurnForActiveUnit`; new
  `regenHealingRestored` event, healing chime, log line. Silent at full
  hit points.
- All five tuning values are named constants in `combatConstants.ts`.
  `Unit.ts` gained `hasStatusEffect()` (replacing the scattered `.some()`
  checks) and `isBeneficialStatusEffect()` — the HUD's skill info box now
  says "Grants haste…" for ally-targeted effects instead of "Inflicts".
  The unit summary panel now lists active status effects with remaining
  turns (previously poison/sleep/blind were invisible outside the log).
- New skills (LORE-compatible naming — Hortian prayer/ward words for the
  Priest, god-free arcane words for the Mage): Priest learns Mending
  Prayer (regen, lv5), Ward of Steel (protect, lv7), Ward of Faith
  (shell, lv9); Mage learns Leaden Curse (slow, lv9) and Quickening
  (haste, lv11). Status-effect count is now 8 of the ~10 target (§8);
  skills 24 of ~150.
- *Verification*: 6 new vitest tests (154 total, typecheck/build clean) —
  haste/slow turn-order ordering, the speed-modifier fix, protect/shell
  asymmetry (each reduces only its damage source), regen healing +
  full-health cap. Browser regression pass via `tmp/verify_flee.mjs`
  re-run (battle start, action menu, HUD all clean).

**2026-07-02 — Equipment-skill mastery (FFTA-style, PRD §7).**

The hybrid skill-learning model's second half is live: gear can carry a
skill that the wearer can use while the piece is equipped; each use in
battle earns one mastery point, and at 3 points (`SKILL_USES_TO_MASTER`,
`src/sim/guild/SkillMastery.ts`) the skill is mastered — known
permanently, with or without the item.

- *Sim*: `EquipmentDefinition` gained `grantedSkillIdentifier`;
  `GuildMember` gained `skillMasteryProgress` (uses per skill — a skill is
  "mastered" when its count reaches the threshold, no second field to keep
  in sync). New `SkillMastery.ts` holds the threshold + the queries +
  `recordEquipmentSkillUses` (credits a battle's uses, but only for skills
  granted by *currently worn* gear and not yet mastered — the same
  condition under which the skill was usable at all; returns what was
  newly mastered so the UI can announce it). Progress is kept on defeat
  and flee, matching the kill-XP retreat rule.
- *Battle plumbing*: `Unit` gained `equipmentGrantedSkillIdentifiers` —
  the subset of its skills that exists only because of worn gear.
  `UnitFactory` computes it by *subtracting* everything known without the
  item (class list at level, secondary set, mastered skills), so a skill
  that is both class-known and gear-granted never reads as gear-dependent,
  and the final list is deduplicated. `Battle` counts skill uses per unit
  (same pattern as `defeatedEnemyLevels` — targeted tracking that feeds
  post-battle progression); `GameController.buildBattleConclusion` credits
  each deployed member and pushes "X has mastered Y!" summary lines.
- *Content* (LORE-aligned): four silver-tier skill-bearing weapons, one
  per base class — Greathorn Cleaver → Cleaving Arc (physical melee
  burst, the game's first physical AoE), Moonshadow Knife → Shadow Fang
  (weak front / brutal flank), Tidecaller Staff → Tide Surge (Yiern water
  AoE), Dawnlight Rod → Dawn's Mercy (Hortian group heal, the game's
  first AoE heal). Skills 28 of ~150.
- *UI*: gear-granted skills show a ✦ badge in the battle action menu and
  a "Granted by equipped gear — use it in battle to master it
  permanently" note in the skill info box; the character sheet's skills
  panel gained a "Gear skills" section showing `Mastery n/3` or
  `Mastered` per skill; store/inventory equipment cards append
  "Teaches: <skill>" to their effect line.
- *Save format*: unchanged (still v5) — `skillMasteryProgress` is healed
  to `{}` on load like earlier additive fields; a dedicated test covers a
  pre-mastery v5 save.
- *Verification*: 12 new vitest tests (166 total, typecheck/build clean) —
  mastery accrual/threshold/no-double-report, gear-vs-known subtraction in
  the factory, per-unit use counting in `Battle`, assembly threading, save
  healing, and a content-validity check that every `grantedSkillIdentifier`
  points at a real skill. New `tmp/verify_mastery.mjs` browser pass
  (injected save, priest at 2/3 mastery): ✦ badge + info-box note
  confirmed in a live battle, one cast + flee produced the "Brakka has
  mastered Dawn's Mercy!" outcome line and persisted progress 3/3; the
  Town character sheet showed "Gear skills · Mastery 2/3" and the store
  card showed "Teaches: Cleaving Arc". Zero page errors beyond the
  harmless favicon 404.
- *Pre-existing quirk noticed while scripting the browser pass, fixed
  same day at the user's request*: skill targeting excluded the caster's
  own tile for every skill, so a lone healer could not cast an
  ally-targeted skill on themselves. `beginChoosingActionTarget` now
  passes `includeOwnTile: skill.targetTeam === 'allies'` — ally skills
  can self-target, hostile skills still cannot (self-range-0 skills were
  always fine, they skip tile choice entirely). Controller-layer change,
  so per this project's pattern it is browser-verified, not
  vitest-covered: `tmp/verify_mastery.mjs` now casts Dawn's Mercy on the
  caster's *own* tile and doubles as the regression check (heal lands on
  self, mastery still credited).

**2026-07-02 — Monster level-scaling per zone (PRD §6.1).**

Same session. Resolves the "monsters are fixed-level data" deliberate
simplification flagged 2026-06-19: roaming-encounter monsters now spawn
at a level rolled from their zone's range, scaled the same way character
classes grow.

- *Model*: `MonsterDefinition.level` is now explicitly the **base level
  its `statistics` describe**, and the definition gained
  `statisticGrowthPerLevel` (same shape as class growth). A spawn above
  or below base derives statistics linearly
  (`deriveMonsterStatisticsForLevel` in `UnitFactory.ts`); hit points
  floor at 1, everything else at 0, evasion stays fractional —
  mirroring character derivation.
- *Zone plumbing*: `ZoneDefinition` gained
  `monsterLevelRange: { minimumLevel, maximumLevel }` (inclusive);
  `generateEncounterEnemySpawns` rolls a level per spawn from it (seeded
  RNG, deterministic); `QuestEnemySpawn` gained optional `spawnLevel`,
  threaded through `createEnemyUnitsFromSpawns` →
  `createUnitFromMonster`. Kill experience scales automatically —
  `defeatedEnemyLevels` records the spawned level and
  `experienceForDefeatingEnemy` was always level-based.
- *Scope decision*: **quest battles stay at authored base levels**
  (spawns omit `spawnLevel`). Quests are fixed-reward authored content;
  their difficulty knob is the authored spawn list + `difficultyRank`.
  Scaling applies to roaming encounters, which are generated content.
- *Content*: growth curves for all 5 monsters (wolves/boars grow attack
  and hit points, stonelings defense, wisps magic, gnarlroots a bit of
  both); zone ranges make the world's difficulty read left to right —
  North Road 2–3 (at/below the pools' base levels, the starter road),
  Marsh Trail 3–5, Quarry Path 4–6 (stonelings/wolves patrol well above
  their base 3 — the hardest of the first three zones).
- *Verification*: 5 new vitest tests (171 total, typecheck/build clean) —
  base-level spawn unchanged, up-scaling math, down-scaling + floor
  clamps, rolled levels always inside the zone range, and a
  zone-content-validity check (1 ≤ min ≤ max). New
  `tmp/verify_level_scaling.mjs` browser pass: caught the North Road
  wolf pack (spawned a **Level 2** Twisted Wolf — down-scaled below its
  base 3) and the Quarry Path stoneling watch (a **Level 6** Stoneling —
  up-scaled), both levels read from the live HUD inspection panel, zero
  page errors.

**2026-07-02 — Zone pipeline made scalable for many zones.**

Same session, at the user's direction: the plan is *way more zones*, so
the seams that only worked because 3 zones ↔ 3 battle maps happened to be
1:1 were fixed before they calcify. No behavior change today — every
binding resolves identically with the current content.

- *Quest ↔ zone binding is now explicit*: `QuestDefinition` gained
  `zoneIdentifier`; `questIdentifiersForZone` matches on it instead of
  the old "same battle map" heuristic, which would have merged two
  zones' tavern boards the moment they shared a map. A quest's
  `battleMapIdentifier` is now genuinely independent of its zone — one
  zone can host quests on several maps.
- *`encounterSpawnTiles` moved from `ZoneDefinition` to
  `BattleMapEntry`*, next to `deploymentTiles`: they are map-space data,
  and per-zone copies would have meant re-authoring (and re-validating)
  them for every new zone that reuses a map. New zones now get them for
  free.
- *`ZoneDefinition.worldMapPosition` (optional)*: zones can place their
  own World Map node (normalized 0..1 coordinates, same explicit-position
  support the Town screen already uses). All-or-nothing by design — when
  any zone omits it, the map falls back to today's auto-distributed row,
  so the 3 current zones are unchanged and a larger hand-laid world map
  is pure content work later.
- *Content-validity tests updated to scale with content*: spawn-tile
  standability now iterates `BATTLE_MAPS` (covers every map once, not
  per-zone), the enemy-count check resolves the zone's map entry, and a
  new check pins every quest's `zoneIdentifier` to a real zone. Together
  with the existing patrol-reachability, road-reference, and level-range
  checks, a new zone is fully validated by `npm test` the moment it is
  added to `ZONES` — see CLAUDE.md's new "Adding a zone" checklist.
- *Verification*: 173 vitest tests, typecheck/build clean; browser
  regression via `tmp/verify_level_scaling.mjs` (collisions in two zones,
  spawn tiles now sourced from the map entry — one run even showed mixed
  levels in a single battle) and `tmp/verify_mastery.mjs` (tavern quest
  board, store, town panels — all on the new quest↔zone binding). The
  scaling script's level collector also got hardened against turn-strip
  re-renders mid-hover (script flake, not a game bug).

**2026-07-02 — Dispatch quests (M4: send members away for passive reward).**

The tavern now has a dispatch board under the quest board: errands that
take one guild member instead of a battle party. The member leaves the
muster pool; **time passes in battles the rest of the guild fights**
(the game has no clock — concluded battles are its heartbeat, victory,
defeat, and flee alike); when the posted count runs out, the member
returns in that battle's outcome summary with gold for the guild and
experience for themselves. v1 dispatches always succeed — a
stat-dependent success roll is a future iteration if wanted.

- *Sim* (`src/sim/guild/DispatchQuest.ts`): `DispatchQuestDefinition`
  (zone-bound like quests, `durationInBattles`, gold + member XP);
  `GuildState.activeDispatches` (`ActiveDispatch[]`); `startDispatch`
  validates member exists / not already away / quest not already
  underway; `tickDispatchesAfterBattle` decrements all and resolves the
  finished ones (pays the guild, `applyExperienceGain` on the member,
  returns reports for the summary). Broken references (removed content)
  drop silently rather than crash a save.
- *Hookups*: `GameController.buildBattleConclusion` ticks after the XP
  loop and pushes "X returns from Y — +gold, +XP" (+ level-up) lines;
  `embarkOnQuest`/`catchRoamingGroup` filter dispatched members
  defensively even if the UI let one through.
- *UI*: tavern content gained the "Dispatch board" section — cards reuse
  the quest-card view (underway cards read "Underway — X returns in N
  battles"); the detail reuses the quest-detail view as a single-select
  member picker with a "Send <name>" button. Muster cards everywhere
  (quest embark + collision prompt) now render dispatched members
  disabled with an "· Away" note (`MusterCardViewModel.isAway`), and
  roster cards read "· Away on dispatch".
- *Content* (`src/content/dispatchQuests.ts`): 4 dispatches across the 3
  zones (Escort the Carters 2 battles/60g, Walk the Forest Bounds
  4/140g, Guide the Peat-Cutters 3/90g, Watch the Masons' Camp 3/110g) —
  pay deliberately below active-quest rates for the time they take, so
  quests stay the main loop.
- *Save format*: still v5 — `activeDispatches` healed to `[]` on load
  like the other additive fields (test extended).
- *Deliberate simplifications*: no failure roll; equipment/class changes
  while away are not blocked (the member is "away", not frozen — worth
  revisiting if it ever feels exploitable); a dispatch cannot be
  recalled early.
- *Verification*: 9 new vitest tests (182 total, typecheck/build clean) —
  start validations, per-battle ticking, independent clocks, level-up
  reporting, content validity (every dispatch's zone exists, every zone
  posts at least one). Browser pass `tmp/verify_dispatch.mjs`: sent
  Nyssa from the North Road tavern ("Send Nyssa" → "Underway — Nyssa
  returns in 2 battles"), her muster card showed disabled + "· Away" at
  the next collision, fled two encounter battles, and the second outcome
  overlay announced "Nyssa returns from Escort the Carters — +60 gold,
  +40 XP" with the save showing `activeDispatches: []` and gold 300→360.
  Zero page errors.

**2026-07-02 — GameController slimmed: payout rules to sim, commands to
their own class.**

Same session, at the user's observation that `GameController` was
growing without bound (572 lines) and `buildBattleConclusion` had become
a grab-bag. The real problem wasn't size but a boundary leak: the
conclusion method held actual game rules (reward economics, XP,
mastery credit, dispatch ticking) in the app layer, where nothing
vitest-covered them. No behavior change — summary line order shifted
slightly (all level-ups now before all masteries), nothing else.

- **`src/sim/guild/BattleSpoils.ts` (new)** — `applyBattleSpoils(guild,
  spoils, equipment, dispatchQuests)`: takes the battle's outputs as
  plain data (outcome, defeated levels, per-member skill-use counts,
  remaining pouch), applies the PRD §5 rules (pouch home; kill XP always;
  gold + bonus XP victory-only; mastery credit; one battle of dispatch
  time), and returns a structured `BattleSpoilsReport`. 7 new tests pin
  the economics that previously only browser passes exercised.
  `src/ui/BattleSpoilsSummary.ts` (new) turns the report into the
  overlay's summary lines — sim stays free of display strings.
- **`src/app/GuildCommands.ts` (new)** — the ten menu-driven handlers
  (buy/sell item + equipment, equip/unequip, class + secondary-skill
  change, hire, start dispatch) moved wholesale; each still validates
  through the sim layer and reports via an `onGuildChanged` callback
  (GameController's persist-and-refresh). The class never touches a
  screen.
- **`GameController`** is back to its actual job — scenes, battle flow,
  wiring (~430 lines): the duplicated character-sheet callback literals
  collapsed into one shared `characterCallbacks` object (spread into the
  zone controller's callbacks), and the duplicated deployed-member
  filtering became one `deployableMembers` helper.
- *Verification*: 189 vitest tests, typecheck/build clean; browser
  regression via `tmp/verify_dispatch.mjs` + `tmp/verify_mastery.mjs`
  (both fully green — they cover the conclusion pipeline, dispatch board,
  store panel, character sheet), plus a one-off buy check confirming the
  re-wired store commands persist correctly (gold 300→270, potion count
  up).
