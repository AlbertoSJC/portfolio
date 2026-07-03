# Guild & Tactics

A web-based tactical RPG in the spirit of **Final Fantasy Tactics Advance** and
**FFTA2: Grimoire of the Rift**. You run a guild — **Wanderer's Rest is its
name, not a place it lives**: recruit members of five races, take quests from
zone taverns scattered across the map, fight tactical grid battles, level up,
learn skills, upgrade gear — and repeat. There is no main story; the game *is*
the guild loop.

> **Status**: M1 (combat), M2 (guild loop), and M3 (depth — advanced classes, status effects, village map, element wheel) complete. M4 (content & polish) underway — guild reputation tiers, a world map of walkable, FFTA1-style zones with visible roaming encounters (no home location), mid-battle flee, five more status effects, FFTA-style equipment-skill mastery, monster level-scaling per zone, and dispatch quests, shipped so far.

---

## 1. Vision

- **Genre**: single-player tactical RPG (turn-based, grid combat).
- **Platform**: browser (desktop-first; mouse + keyboard).
- **Fantasy**: you are a guild — not a chosen hero. Progress is the roster,
  its classes/skills, and its equipment, driven by an endless stream of
  quests.
- **Reference games**: FFTA / FFTA2 (combat, class system, guild/quest loop),
  with simplifications where they don't pull their weight.

## 2. Core loop

```
World Map ──► pick a zone ──► walk its grid
   ▲                              │
   │                  ┌───────────┴───────────┐
   │                  ▼                       ▼
   │            Zone's Tavern              Roaming group
   │         (quest board + store)      walks into you (or
   │                  │                  you into it)
   │                  └───────────┬───────────┘
   │                              ▼
   │                Battle: tactical grid combat (win/lose)
   │                              │
   └── Rewards: gold + items + XP ◄──────────┘
        │
        ▼
   level up, learn skills, buy/sell gear, recruit members
   (Guild menu — reachable from anywhere) ──► harder quests
```

## 3. Races

Five playable races. Every guild member belongs to one race; race determines
which advanced classes they can reach (FFTA-style race-gating) and gives
small stat tendencies.

| Race | Flavor | Stat tendency (proposal) |
|---|---|---|
| **Human** | adaptable all-rounders | balanced; +1 to everything minor |
| **Werecat** | feline humanoids, fast and sly | high Speed/Evasion, low Defense |
| **Werelizard** | scaled bruisers, slow and tough | high HP/Defense, low Speed/Magic |
| **Undead** | fallen humans returned, furious at the Darkness that won't let them die | high Magic (Fire above all), low Speed/Evasion; immune to poison/bleed, healed by Dark, weak to Sacred |
| **Feryan** | small centaur-like folk — humanoid torso, but the rear body and hind legs are those of a great eagle, **with wings** | highest Move; **Fly movement** (ignores height differences and passes over obstacles/gaps, but cannot end the move on impassable/occupied tiles); fragile; **cannot use magic** — see the Spellblade exception in §4 |

*(Stat tendencies are proposals — tune freely during balancing. The Feryan
description, wings, flight and no-magic rule are locked design.)*

## 4. Class system

### Base classes (all races)

Every recruit starts in one of four base classes:

| Class | Role | Resources |
|---|---|---|
| **Warrior** | front-line melee, high HP | HP-focused, few MP skills |
| **Thief** | speed, positioning, stealing, crits | HP + small MP pool |
| **Mage** | offensive magic, AoE | MP-centric |
| **Priest** | healing, buffs, support magic | MP-centric |

### Base class access by race (locked constraints, matrix under review)

Not every race can take every base class:

| Race | Warrior | Thief | Mage | Priest | Why |
|---|:---:|:---:|:---:|:---:|---|
| Human | ✓ | ✓ | ✓ | ✓ | adaptable generalists |
| Werecat | ✓ | ✓ | ✓ | ✓ | full access, but different advanced gates |
| Werelizard | ✓ | — | ✓ | ✓ | too slow and heavy for thievery |
| Undead | ✓ | ✓ | ✓ | — | holy magic rejects the unliving |
| Feryan | ✓ | ✓ | — | — | **Feryans cannot use magic** (locked rule) |

### Advanced classes (final matrix — decided)

Advanced classes come in two kinds:

- **Pure advanced**: deepens one base class.
- **Hybrid advanced**: combines **two** base classes; each race has one
  hybrid per pair of base classes it can access.

**Unlock rules (decided)**:
- Pure: level 5 in the base class + class-unlock quest.
- Hybrid: level 5 in the primary base + level 3 in the secondary base +
  class-unlock quest.
- Characters switch class in the village; skills from previously mastered
  classes are kept in a secondary skill slot (FFTA's "secondary A-ability"
  model).

⭐ = race-exclusive. 33 distinct advanced classes total.

**Human (13)** — breadth over exclusivity; Hortian sacred tradition.

| Class | Kind | Identity |
|---|---|---|
| Knight | W | heavy tank, covers adjacent allies |
| Dragoon | W | spears, Jump attacks across the battlefield |
| Ranger | T | bows, traps laid on tiles |
| Duelist | T | counter-stance fencer, punishes attackers |
| Black Mage | M | the full elemental arsenal — fitting the race that uses all magic |
| Illusionist | M | control: sleep, blind, charm |
| Bishop | P | greater heals + sacred damage, church of Hort |
| Assassin | W+T (shared w/ Werecat) | status afflictions, lethal setups from behind |
| Rune Knight | W+M | inscribes elemental runes on weapon and tiles, detonates in melee |
| Paladin ⭐ | W+P | Hortian holy melee tank with minor heals |
| Spellthief | T+M | steals MP and buffs, sleight-of-hand magic |
| Inquisitor | T+P | Hort's judgment from the shadows — marks, reveals, punishes |
| Sage | M+P (shared) | arcane + divine utility: buffs, debuffs, dispels |

**Werecat (10)** — wind and earth, speed and stealth; Breir and Taurk.

| Class | Kind | Identity |
|---|---|---|
| Berserker | W | feral frenzy: huge damage, drops own defense |
| Duelist | T | shared |
| Shadowdancer ⭐ | T | battle dances: evasion auras, repositioning, untargetable turns |
| Galeweaver ⭐ | M | wind/earth trickery: blinding dust, vanishing gusts, light-step |
| Assassin | W+T (shared w/ Human) | as above |
| Windwanderer ⭐ | W+M | wind and stealth magic woven into melee |
| Priest of the 8 Lives ⭐ | W+P | sacred magic + melee, from a priest who already spent one life |
| Phantom ⭐ | T+M | blink-steps and wind after-images; strikes from tiles it isn't on |
| Shrine Warden ⭐ | T+P | guards allies from the shadows with blessings of Breir and Taurk |
| Sage | M+P (shared) | |

**Werelizard (7)** — earth and water, enhancement and healing; Taurk and Yiern.

| Class | Kind | Identity |
|---|---|---|
| Knight | W | shared |
| Berserker | W | shared — fierce when angered |
| Geomancer ⭐ | M | terrain magic: tile-powered attacks, terraforming |
| Shaman ⭐ | P | totems on tiles pulsing healing/wards each turn |
| Stonefist ⭐ | W+M | earth magic channeled through crushing two-handed blows |
| Totem Guard ⭐ | W+P | fights carrying a war-totem that wards nearby allies |
| Sage | M+P (shared) | |

**Undead (7)** — fire, darkness, and the grave; Kosh's faithful. No Priest
(holy rejects them); their dark magic heals their own kind.

| Class | Kind | Identity |
|---|---|---|
| Knight | W | shared |
| Dread Knight ⭐ | W | dark melee that drains HP from victims |
| Pyromancer ⭐ | M | Kosh's fire — the most powerful offensive magic in the game |
| Necromancer ⭐ | M | DoTs, fear, raises one skeletal minion; dark heals undead allies |
| Revenant ⭐ | W+T | the relentless stalker — rises once per battle when KO'd |
| Ashguard ⭐ | W+M | armored melee channeling fire and darkness |
| Wraith ⭐ | T+M | phases through enemies and walls, shadow-magic stealth |

**Feryan (5)** — godless weapon-experts of the sky. No magic, one forced
exception.

| Class | Kind | Identity |
|---|---|---|
| Skylancer ⭐ | W | winged dragoon: flight-charges, devastating dive attacks |
| Spellblade ⭐ | W | **the sole Feryan magic**: fire and lightning forced into melee strikes — never cast, only fought |
| Ranger | T | shared — death from above |
| Duelist | T | shared |
| Skytalon ⭐ | W+T | dive-ambush predator: warrior force, thief precision, altitude |

## 5. Combat

Tactical, turn-based, on a square grid (FFTA model):

- **Maps**: hand-authored grid maps (~10×10 to ~16×16) with height levels,
  obstacles, and terrain types (grass, water, rock…). Height affects movement
  (Jump stat) and ranged line-of-fire.
- **Turn order**: speed-based individual turns (FFTA's charge-time style —
  faster units act more often), not team-alternating.
- **A unit's turn**: Move (up to Move stat) + one Action (attack / skill /
  spell / item) + facing choice. Move and Action in either order.
- **Facing matters**: attacks from the side/back have higher hit/crit chance.
- **Stats**: HP, MP, Attack, Defense, Magic, Resistance, Speed, Move, Jump,
  Evasion.
- **Resources** (decided — 100% FFTA model): **HP** (0 = KO) and **MP**
  (spent on spells/skills). Units **start battle with full MP**; MP does
  not regenerate on its own. Wanting more MP mid-battle means **items**
  (ethers) or **passive MP-regeneration skills** that certain classes learn.
- **Damage model**: deterministic formulas + seeded RNG for hit/crit rolls
  (fully unit-testable, replayable).
- **Status effects**: poison, slow, haste, blind, sleep, protect, shell,
  regen… (initial set ~10; the 8 listed are all live as of 2026-07-01).
- **Elements** (tied to the pantheon of Aentea — see `LORE.md`, untracked):
  **Fire** (Kosh) / **Water** (Yiern) / **Earth** (Taurk) / **Wind** (Breir) /
  **Sacred** (Hort) / **Dark** (the unnamed god) / **Lightning** (the
  godless element — no god claims it; it is what Feryan Spellblades force
  into their steel). Resistances and weaknesses per race and gear (Undead:
  healed by Dark, weak to Sacred; Werecats can never use Dark).
- **Win/Lose**: per-quest objectives — defeat all foes (default), defeat
  boss, survive N turns, protect an NPC. Lose = guild retreats: keep XP
  earned, lose the quest reward (no permadeath — KO'd members are fine after
  battle).
- **Enemy AI**: utility-scoring per unit (evaluate reachable tiles × usable
  actions, pick best). Archetypes: aggressive, defensive, healer-priority,
  coward.

**Not in scope (v1)**: FFTA's Judge/Law system, monster taming, multiplayer.

## 6. World & zones

The game is set in **Aentea** (world lore in `LORE.md`, untracked): the
last safe continent, besieged by the Darkness. The guild both defends the
held territory and pushes outward to reclaim the world.

**Wanderer's Rest is the guild's name — not a place (decided, supersedes
the original "capital settlement" framing).** The guild has no home
location to return to: roster, shared inventory, and recruitment ("Guild
Hall") live in a **persistent Guild menu**, reachable from anywhere — the
world map or any zone — since that's guild data, not tied to a location.

The world is **zones**, reached from the world map (§6.0). Each zone has
its own:

- **Tavern** — that zone's quest board. 4 quests at a time, refreshed as
  quests complete; eligible quests are derived automatically from the
  zone's battle map (`quest.battleMapIdentifier === zone.battleMapIdentifier`)
  — no separate per-zone authoring needed. Quest difficulty is rated so the
  player can self-select. *(Dispatch quests — send N members away for M
  cycles, FFTA-style — are still planned, not built.)*
- **Store** — buy/sell weapons, armor, accessories, consumables,
  **independently stocked per zone** (buying out one zone's potions never
  touches another's shelves). Inventory grows with guild reputation tier
  (reputation itself is guild-wide, not per-zone).
- **Roaming monster groups** — visible on the zone's road map; see §6.1.

Recruitment (a rotating set of hireable candidates — random race / base
class / minor stat variance, for gold) is **global**, via the Guild menu,
not per-zone. Guild roster cap: ~20; battle party size: up to 6.

**Guild progression**: completing quests raises guild **reputation**
(guild-wide); tiers (Bronze → Silver → Gold → …) unlock better store stock
and better recruits. Harder quest ranks and reaching new zones gated by
reputation are still open (§6.0 next steps).

### 6.0 World map, zones, and towns (decided — supersedes the original settlement framing)

Three levels, all canvas-drawn and **full-bleed** (the map/grid fills the
screen, FFTA/FFTA2-style — name/description as a bottom-left map plaque,
gold/reputation as a top-right pill, menu access as small bottom-right
corner buttons, not a header bar). Procedural and swappable later via the
same swap-point principle as `SpriteRegistry`:

- **World map** (zoomed out, FFTA2-style): zone nodes connected by roads.
  Clicking a node enters that zone. There is no "home" node — by design,
  the guild has nowhere it belongs.
- **Zone screen** (zoomed in, **FFTA1-style — revised 2026-06-22**): a
  small named-location **road network**, not a walkable tile grid — a
  handful of locations (one a tavern, the rest plain landmarks) connected
  by roads. One click finds the shortest route via the road graph and
  steps through it one location at a time (not a single jump) so roaming
  groups visibly patrol in sync with you — see §6.1. The earlier tile-grid
  version (a 9x7 grid with a 4-tile boxed patrol loop) is retired: it read
  as artificial on playtesting, since the patrol had nowhere to roam *to*.
  The road-network model gives patrols real range across several
  locations instead of pacing one corner.
- **Town screen**: stepping onto a zone's tavern location opens its own
  full-screen building-map (Tavern + Store + **Guild Hall** as
  icon-nodes, pushed toward the bottom of the screen), the same "click a
  node" interaction as the World Map, just zoomed to one zone's buildings.
  Picking a building shows its content — quest board, store, or the
  Guild's roster/inventory/recruitment — directly in the freed-up space
  above the nodes, as a plain panel in the same screen, **not a modal**:
  the nodes stay visible and clickable underneath the whole time, so
  switching buildings never requires closing anything first. The Tavern's
  quest board opens automatically on arrival (no extra click needed). The
  Guild Hall node shows the same roster/inventory/recruitment content the
  global Guild menu (reachable from the World Map/Zone screens) shows,
  just docked in this panel instead of a modal — giving the guild a
  clearer entry point while standing in a town without giving it a fixed
  home. A corner button leaves Town back to the same spot on the road
  network.
- **v1 scope (decided)**: the first 3 zones (North Road, Marsh Trail,
  Quarry Path) reuse the 3 existing battle maps and monster pools, now as
  5-6 location road networks each instead of tile grids. **More
  zones/settlements are explicitly future iterations**, not part of this
  pass — see the CHANGELOG.

### 6.1 Roaming encounters (decided — replaces the original dice-roll design)

No hidden chance roll. Each zone has one or more **roaming groups**: an
enemy party patrolling a fixed loop of named locations on the zone's road
network, generated (not authored) per fight.

- **Movement is turn-synced and deterministic**: every time the player
  moves to a new location, every active roaming group also advances one
  stop along its patrol route. Nothing is hidden — a group's location is
  always knowable by watching it.
- **Trigger**: a battle starts only if the player's location and a roaming
  group's location coincide after a move. This is **avoidable** — routing
  around a group to reach the tavern without fighting is a legitimate
  strategy, not a failure state.
- **Enemy parties are generated, not authored**: each roaming group has a
  monster pool and an enemy-count range; the actual composition is rolled
  fresh per encounter (`generateEncounterEnemySpawns`), and the fight plays
  out on the zone's tactical battle map. Rewards: a flat small gold amount
  + kill XP — deliberately below quest rewards, so quests stay the main
  loop and roaming fights are seasoning (and a grinding option for players
  who want it).
- **Losing** forfeits the reward but keeps kill XP (same retreat rule as
  quests, §5). **Winning** removes that roaming group for the rest of the
  current visit; leaving and re-entering the zone resets it.
- **Patrol routes must stay reachable**: a route whose length doesn't mix
  well with the road network's cycle structure can be mathematically
  uncatchable (the road-graph equivalent of the tile-grid's old parity
  bug) — `EncounterBattleAssembly.test.ts` checks every zone's roaming
  group against this before it ships.
- **Fleeing (built 2026-07-01)**: a roaming-encounter battle offers a
  "Flee" action on any guild unit's turn — deterministic, ends the battle
  immediately, keeps kill XP, forfeits the gold reward, and leaves the
  group alive on the map. Quest battles cannot be fled (embarking is a
  commitment).
- **Monster level-scaling (built 2026-07-02)**: each roaming-encounter
  monster spawns at a level rolled from the zone's `monsterLevelRange`,
  with statistics derived from per-monster growth curves (North Road 2–3,
  Marsh Trail 3–5, Quarry Path 4–6). Quest battles stay at authored base
  levels — quests are fixed-reward authored content.

## 7. Character progression

- **XP/Levels**: per-character; XP from battle actions and quest completion
  (cap ~30 for v1). Level-ups raise stats by class-specific growth rates.
- **Skills/Spells (decided — hybrid model)**: most skills are learned from
  the class's skill list at fixed class levels. In addition, **each class
  has a few special skills that live on equipment**, FFTA-style: while the
  item is equipped the skill is usable; using it in battle earns mastery
  points, and once mastered the skill is known permanently even without the
  item. Each character carries: primary class skill set + one secondary set
  from a previously mastered class + passive slot.
- **Shared skill pools** (decided — keeps content volume sane): skills are
  defined once in `src/content/skills.ts` and referenced by multiple
  classes; each class is a *combination* of shared skills plus a few
  signature ones. E.g. `First Aid` appears in several priest-line classes;
  `Fire Strike` is shared by Rune Knight and Ashguard with different
  follow-ups. Authoring a class is mostly curation, not writing 6 new
  skills from scratch.
- **Equipment slots**: weapon, shield/offhand, head, body, accessory.
- **Item tiers**: common → fine → masterwork per item family; store upgrades
  + rare quest drops.

## 8. Content targets (v1)

| Content | Target |
|---|---|
| Races | 5 |
| Base classes | 4 |
| Advanced classes | 33 (pure + two-base hybrids, per the §4 matrix) |
| Skills/spells | ~5–6 per class with heavy sharing across classes ⇒ ~150 distinct |
| Battle maps | 10–15 |
| Quests | ~40 (template-driven + handcrafted bosses) |
| Items | ~80 |
| Zones | 3+ (more iteratively, §6.0) |
| Status effects | ~10 |

## 9. Technical design

Lessons taken from `world-of-claudecraft` (same author-tooling: built with
Claude Code, spec-driven, test-verified):

- **Language**: TypeScript everywhere. Vite for dev/build. Vitest for tests.
- **Architecture — deterministic sim core, renderer-free**:
  - `src/sim/` — all game rules (combat resolution, turn order, AI, quest
    state, progression). No DOM imports. Seeded RNG. A battle is a pure
    function of (map, units, seed, player commands) ⇒ fully unit-testable,
    and battles are replayable from a command log.
  - `src/render/` — draws whatever sim says. Swappable.
  - `src/ui/` — HTML/CSS overlay UI (menus, unit panels, shops, quest board),
    like claudecraft's HUD. No canvas UI.
  - `src/game/` — input, camera, audio glue.
- **Rendering — DECIDED: 2D** (isometric or top-down grid, canvas-based).
  Placeholder sprites are fine for the entire build-out. What matters is
  that characters are **data-driven**: race, class, stats, and skills live
  in the sim and are shown in the UI; the sprite is just a skin we can swap
  any time. Sprite lookup goes through a single `SpriteRegistry` mapping
  `race + class (+ facing + animation state)` → visual, so upgrading art
  later touches one module and zero game logic. *(Current placeholder
  level: procedural vector miniatures — race silhouette + class item +
  team base plate, drawn on canvas, no asset files. The future real-art
  pass replaces only `SpriteRegistry` internals.)*
- **Persistence**: single-player → save games as JSON in `localStorage` +
  export/import file. **No server, no database, no accounts** (v1). The
  whole game is a static site — deployable on GitHub Pages/Netlify.
- **Audio/icons**: procedural (WebAudio synth + canvas-painted icons),
  claudecraft-style — zero binary asset debt for v1.
- **Testing**: vitest for all formulas/combat/AI/progression; later, a
  headless "bot plays a battle" harness for end-to-end verification.

### 9.1 Code conventions (binding — follow in every file)

The codebase must be understandable by reading it, modeled on the
`HRCandidatures` project's structure. Concretely:

- **Literal, full-word naming**. `calculateDamageAfterDefense()`, not
  `calcDmg()`. `remainingMovementPoints`, not `mp` (which is also ambiguous
  with mana). Booleans read as questions: `isFlanking`, `hasActedThisTurn`.
- **No magic numbers**. Every tuning value is a named constant in a
  dedicated constants/config module, e.g.
  `const BACK_ATTACK_HIT_CHANCE_BONUS = 0.2` in `combatConstants.ts` —
  never a bare `0.2` inside a formula.
- **One concept per file**, file named after the concept:
  `TurnOrderQueue.ts`, `QuestBoard.ts`, `DamageCalculation.ts`. No `utils.ts`
  grab-bags; if a helper is date-related it lives in `dateUtilities.ts`, etc.
- **Domain layer separated from presentation** (HRCandidatures'
  `src/domain/` pattern): game rules never import rendering or UI code.
- **Tests mirror source 1:1**: `src/sim/combat/DamageCalculation.ts` ⇒
  `tests/sim/combat/DamageCalculation.test.ts`. Shared test data in
  `tests/mocks/`.
- **Data over code for content**: races, classes, skills, items, quests and
  maps are declared as typed data objects (e.g. `src/content/races.ts`,
  `src/content/skills.ts`), not hardcoded into logic — adding a skill means
  adding a data entry, not editing combat code.
- Folder skeleton:

```
src/
  sim/            game rules: combat, turn order, AI, progression, quests
    combat/
    progression/
    guild/
  content/        typed data: races, classes, skills, items, quests, maps
  render/         2D canvas drawing + SpriteRegistry
  ui/             HTML/CSS screens: battle HUD, world map, zones, Guild menu
  platform/       save/load + platform services (browser now, Steam later)
  app/            composition root, game state machine, scene routing
tests/            mirrors src/ exactly + tests/mocks/
```

## 10. Desktop / Steam path

The goal: the same game, shippable on Steam as a real desktop app. Options
analyzed:

| Option | What it is | Verdict |
|---|---|---|
| **Electron + steamworks.js** | bundle the web build with Chromium; `steamworks.js` exposes the Steam SDK (achievements, cloud saves, overlay) from Node | **Recommended.** Most-proven path for TS games on Steam (Vampire Survivors shipped this way). ~150–250MB installer — irrelevant for a Steam release. Zero game-code changes. |
| **Tauri** | Rust shell around the OS webview; ~10MB binaries | Viable and lighter, but each OS's webview renders slightly differently (testing burden) and Steam SDK integration is more manual. Good fallback if Electron feels heavy. |
| **Godot** (note: an *engine*, scripted in GDScript/C#, not a language) | re-implement the game in Godot, export native builds | **Not recommended for this project**: it discards the TypeScript codebase. Worth knowing: thanks to the sim/render split, a Godot port would only need renderer + UI rewritten — the sim could be transpiled or ported behind the same interfaces — but that's a v3 conversation, not a plan. |
| **Plain PWA / itch.io web** | ship the browser build as-is | Zero effort; fine for itch.io, but Steam wants a real executable and Steam features. |

**Decision**: build pure-web first; ship Steam later via **Electron +
steamworks.js**. What we do *now* to keep that door open is one rule:

- All platform-touching behavior goes through `src/platform/` interfaces —
  e.g. `SaveGameStorage` (browser: `localStorage`; Steam: file system +
  Steam Cloud) and later `AchievementService` (browser: no-op; Steam:
  Steamworks). The sim, UI and renderer never call `localStorage` or any
  browser-only API directly.

With that rule respected, the Steam port is roughly: an Electron main
process file, a build script, Steamworks wiring, and store assets —
days of work, not a rewrite.

## 11. Milestones

1. ✅ **M1 — Combat vertical slice**: one map, 4 base classes, basic attack +
   ~8 skills, turn order, movement/range/facing, enemy AI, win/lose. *Playable
   battle in the browser.* — **done 2026-06-12, browser-verified**
2. ✅ **M2 — Guild loop**: one village (tavern/store/recruitment), quest board,
   gold/XP/levels, save/load. *The full loop is playable.* — **done 2026-06-12,
   browser-verified**
3. ✅ **M3 — Depth** — **done 2026-06-18**:
   - ✅ **Advanced class definitions** — all 33 classes, race/class matrix, mastery tracking, prerequisite gates.
   - ✅ **Skills per level** — `ClassSkillEntry[]` with `learnedAtLevel` on all classes; unlocks happen at battle assembly time.
   - ✅ **Status effects** — poison (damage per turn), sleep (auto-skip turn), blind (hit-chance penalty); `venom_strike` / `smoke_dart` / `sleep_dust` added to Thief and Mage skill lines.
   - ✅ **Element wheel** — `earth_spike` (Warrior lv7, earth) and `frost_bolt` (Mage lv7, water) added; richer monster affinities covering fire/water/earth/sacred/dark.
   - ✅ **Village map screen (§6.0)** — canvas-drawn 4-node town map (Tavern, Store, Recruitment Hall, Guild Hall) replaces the tab bar; party marker on the active building; keyboard/click navigation.
4. 🔶 **M4 — Content & polish** (in progress): all maps/quests/items to
   target, 2 more villages, dispatch quests, balancing pass, audio, visual
   polish.
   - ✅ **Guild reputation tiers** — done 2026-06-18: Bronze/Silver/Gold/Platinum
     by completed-quest count, gating store stock and recruitment offer
     count (now via the global Guild menu); remaining tier hooks (harder
     quest ranks, new zones) still to come.
   - ✅ **World map + walkable zones + roaming encounters (§6.0/§6.1)** —
     done 2026-06-19, **superseding** an earlier same-day design (a single
     "Wanderer's Rest" hub + a hidden dice roll per road). The guild now
     has no home location; roster/inventory/recruitment moved to a
     persistent Guild menu; the world map's 3 zones are real walkable
     FFTA1-style grids with visible, patrolling, avoidable roaming monster
     groups. Deliberately deferred: more zones/settlements, monster
     level-scaling by region, and a real mid-battle flee action — see the
     CHANGELOG for the full rationale.
   - ✅ **Full-bleed map screens + Town screen** — done 2026-06-19: World
     Map, Zone, and Town screens redrawn to fill the viewport (map-style
     plaque/pill/corner-button chrome instead of a small canvas under a
     header bar). Follow-up polish after playtesting: the Fight/Embark
     button and muster cards restyled to match the parchment/ink map
     theme instead of a flat blue/navy HTML-default look; Town now opens
     straight into the Tavern's quest board on arrival; the Guild Hall
     became a 3rd Town building node (§6.0).
   - ✅ **Zone exploration: tile grid → named-location road network** —
     done 2026-06-22, resolving the §12 open question flagged 2026-06-19
     (a boxed 4-tile patrol loop read as artificial). Each zone is now a
     small road network of named locations (one tavern, the rest
     landmarks) instead of a 9x7 tile grid; roaming groups patrol several
     locations instead of pacing one corner. A reachability test caught a
     real content bug in the new model the same way it caught one in the
     old (§6.1) — see the CHANGELOG.
   - ✅ **Town screen: from modal popups to a docked content panel** —
     done 2026-06-22, same session, after further playtesting feedback.
     Tavern/Store/Guild Hall content no longer pops up — Town's building
     nodes are pushed to the bottom of the screen and the selected
     building's content fills the freed space above them as a plain panel
     in the same screen, not a `ModalDialog`; the nodes stay clickable
     underneath throughout. `GuildMenu` was decoupled from `ModalDialog`
     so the same roster/inventory/recruitment/character-sheet content can
     be hosted either way (the global modal, or Town's docked panel) from
     two independent instances — see the CHANGELOG for the two rejected
     intermediate iterations.
   - ✅ **Mid-battle flee for roaming encounters** — done 2026-07-01:
     `BattleOutcome` gained `'fled'`; encounter battles (never quest
     battles) show a Flee button that deterministically ends the fight —
     kill XP kept, reward forfeited, the roaming group stays on the map.
     Resolves the deliberate simplification flagged 2026-06-19.
   - ✅ **Five new status effects** — done 2026-07-01, same session: slow,
     haste (speed multipliers via a new `effectiveSpeed`, which also fixed
     speed stat-modifiers never actually affecting turn order), protect,
     shell (physical/magical damage-taken multipliers), regen (start-of-turn
     healing mirroring poison). New skills: Priest's Mending Prayer /
     Ward of Steel / Ward of Faith (lv5/7/9), Mage's Leaden Curse /
     Quickening (lv9/11). 8 of ~10 target status effects now live (§5).
   - ✅ **Equipment-skill mastery (§7)** — done 2026-07-02: gear with a
     `grantedSkillIdentifier` lets the wearer use that skill while it is
     equipped; 3 uses in battle master it permanently
     (`src/sim/guild/SkillMastery.ts`). Four silver-tier skill-bearing
     weapons shipped (one per base class): Greathorn Cleaver, Moonshadow
     Knife, Tidecaller Staff, Dawnlight Rod. Gear skills carry a ✦ badge
     in battle, a "Gear skills" mastery section on the character sheet,
     and a "Teaches:" line on store cards.
   - ✅ **Monster level-scaling per zone (§6.1)** — done 2026-07-02, same
     session: monsters gained growth curves, zones gained a
     `monsterLevelRange`, and roaming-encounter spawns roll a level from
     it (North Road 2–3, Marsh Trail 3–5, Quarry Path 4–6). Quest
     battles stay at authored levels. Resolves the deliberate
     simplification flagged 2026-06-19.
   - ✅ **Dispatch quests** — done 2026-07-02, same session: the tavern's
     new dispatch board posts errands for a single member; they leave the
     muster pool, time passes in concluded battles, and they return in a
     battle summary with gold + XP. 4 dispatches across the 3 zones;
     always-succeed in v1 (a stat-based success roll is a future
     iteration).
   - ✅ **Harder quest ranks gated by reputation tier** — done 2026-07-02:
     tavern boards post ★ quests from bronze, ★★ from silver, ★★★ from
     gold, mirroring the store's silent tier gating; boards self-heal
     (pre-gating saves get locked ranks pruned at boot) and refresh across
     all zones on every tier-up. Three new quests shipped so every zone
     has bronze work and a rank-3 capstone (11 total). Closes the
     "remaining tier hooks" note from the 2026-06-18 reputation bullet —
     new-zone gating remains for when more zones exist.
   - ✅ **Gold-tier gear layer** — done 2026-07-02: ten masterwork pieces
     gated behind gold reputation (weapons one per base class, two armors,
     two accessories, two consumables), so the tier that unlocks ★★★
     quests has something to spend the rewards on. Fixed a pre-existing
     store leak found during verification: tier-gated merchandise used to
     render as permanent "Out of stock" cards below its tier; the store
     now hides locked tiers entirely.
   - ✅ **World geography & zone/settlement lore** — decided 2026-07-03
     (authored into `LORE.md`, untracked): the continent's full
     disposition (cold north → heartland → scorched south, the Darkness
     pressing hardest at the western rim), 12 lore zones beyond the 3
     built ones, 9 named settlements, 3 named rail lines, settlement
     naming conventions, and a bestiary expansion (~30 creatures). This
     unblocks M4's "more zones/settlements" content passes. Guns and
     rail travel are established in lore but deferred as approved future
     gameplay iterations (§12).
   - ✅ **Four new zones (7 total)** — done 2026-07-03, same session: the
     heartland/north slice of the canon map — Slumber Meadow (levels
     1–3, Travellers' Rest), Crosspaths Field (3–5, Crosspaths Halt),
     Thorns Plain (5–7, Rocky Dwelling, two roaming patrols), The
     Breirwood (6–8, Highbranch). Four new battle maps, 10 new monsters
     (15 total, including the first human enemies — bandits), 7 monster
     skills, 10 procedural sprites, 11 quests (22 total), 4 dispatch
     errands (8 total). The world map is now laid out geographically via
     `worldMapPosition` per the lore compass, and the three old
     "Wanderer's Rest" waystation taverns were renamed under the canon
     convention (Carters' Respite / Peat-Cutters' Haven / Masons' Rest).
     Browser-verified end-to-end; see CHANGELOG.
   - ✅ **Content layer made scalable** — done 2026-07-03, same session:
     zones/quests/monsters split into per-concept folders (one file per
     zone, one board per zone, monsters by family) with identical public
     APIs, and all cross-file content references (monster→skill,
     quest→zone/map/monster, zone→map/monster, gear→skill) became
     compile-checked via `keyof typeof`-derived identifier unions +
     `satisfies` — a typo'd identifier now fails `tsc` with a "did you
     mean" hint instead of surfacing mid-battle. See CHANGELOG for the
     two deliberate boundaries (sim stays `string`-typed; exports stay
     `Record`).

> Build history is in [CHANGELOG.md](CHANGELOG.md).

## 12. Open decisions

- [x] **Rendering**: ~~3D vs 2D~~ → **2D decided** (placeholder sprites
      acceptable indefinitely; art is swappable via `SpriteRegistry`).
- [x] **2D presentation style**: → **isometric diamond grid** (FFTA look).
      Costs only a projection function, painter's-algorithm draw order and
      click-picking math over flat top-down — cheaper to do from the start
      than to migrate to later.
- [x] **Desktop/Steam**: → **web-first, Electron + steamworks.js later**
      (see §10).
- [x] **Skill learning model**: → **hybrid** — class-level unlocks for most
      skills + a few equipment-bound special skills per class with
      FFTA-style mastery (see §7).
- [x] **MP model**: → **100% FFTA** — full MP at battle start, no natural
      regen; ether items and passive MP-regen skills are the only sources
      (see §5).
- [x] **Permadeath / ironman**: → **never** — moved to §13 permanently.
- [x] **Race ↔ advanced-class matrix**: → **decided** — full matrix in §4
      (33 classes: pure advanced + one hybrid per base-class pair per race;
      Spellblade is Feryan-exclusive; base-access trims kept). Names are
      lore-aligned via `LORE.md`.
- [x] **Guild home location**: → **none** — "Wanderer's Rest" is the
      guild's name, not a place; roster/inventory/recruitment live in a
      persistent Guild menu reachable from anywhere (§6).
- [x] **World map structure**: → **two-level, FFTA-hybrid** — a zoomed-out
      world map of zone nodes (FFTA2-style) opens into walkable, named-
      location road networks with visible, avoidable, patrolling roaming
      monster groups (§6.0/§6.1). Supersedes an initial same-day
      dice-roll design.
- [x] **Zone exploration grid ("the inside minimap")**: flagged 2026-06-19,
      after playtesting, as not feeling like a keeper (a boxed 4-tile
      patrol loop read as artificial, and the layout didn't resemble
      either FFTA1 or FFTA2). **Resolved 2026-06-22** → replaced the tile
      grid with a small named-location **road network** per zone (one
      tavern location, the rest plain landmarks, roaming groups patrolling
      across several locations instead of one corner) — see §6.0/§6.1.
- [x] **World geography & settlement roster**: → **decided 2026-07-03** —
      the continent's disposition, zone/settlement names, rail lines,
      naming conventions, and creature roster are canon in `LORE.md`
      (untracked). Zones get built incrementally through M4+; worldbuilding
      depth is a goal, a main story is not (things must stay cohesive and
      scalable, nothing more).
- [ ] **Guns** (approved direction, future iteration — not scheduled): a
      new weapon category, WW1-style per the lore (one shot, long reload,
      powerful, sometimes combined with magic); probably arrives together
      with new gun-wielding classes rather than being bolted onto existing
      ones.
- [ ] **Trains** (approved direction, future iteration — not scheduled):
      instant travel from settlement X to settlement Y along the named
      rail lines, with the possibility of a battle breaking out on board
      mid-journey, and tavern quests asking the guild to escort a train
      from X to Y.

## 13. Explicitly out of scope (v1)

Multiplayer/online anything, story campaign/cutscenes, Judge/Law system,
monster recruitment, crafting, mobile/touch UI.

**Permanently out of scope (not just v1)**: permadeath and ironman modes —
KO'd guild members always recover after battle.
