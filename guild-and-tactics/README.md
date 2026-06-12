# Guild & Tactics

A web-based tactical RPG in the spirit of **Final Fantasy Tactics Advance** and
**FFTA2: Grimoire of the Rift**. You run a guild: recruit members of five
races, take quests from village taverns, fight tactical grid battles, level
up, learn skills, upgrade gear — and repeat. There is no main story; the game
*is* the guild loop.

> **Status**: PRD / design document. No code yet.

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
Village ──► Tavern: pick a quest
   ▲              │
   │              ▼
   │        Battle: tactical grid combat (win/lose)
   │              │
   │              ▼
   └── Rewards: gold + items + XP ──► level up, learn skills,
        buy/sell gear, recruit new members ──► harder quests
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
  regen… (initial set ~10).
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

## 6. World & villages

The game is set in **Aentea** (world lore in `LORE.md`, untracked): the
last safe continent, besieged by the Darkness. The guild both defends the
held territory and pushes outward to reclaim the world.

A small overworld map with **3 settlements** (v1: start with the capital,
add 2 villages later). The capital is **Wanderer's Rest** — where
everything happens, home to all five races. Each settlement has three
buildings:

- **Tavern** — the quest board. 4–6 quests available at a time, refreshed as
  quests complete; mix of combat quests (grid battle) and simple dispatch
  quests (send N members away for M quest-cycles, FFTA-style, for passive
  reward). Quest difficulty is rated so the player can self-select.
- **Store** — buy/sell weapons, armor, accessories, consumables. Inventory
  grows with guild reputation tier.
- **Recruitment hall** — hire new members. Offers a rotating set of recruits
  (random race / base class / minor stat variance) for gold. Guild roster cap:
  ~20; battle party size: up to 6.

**Guild progression**: completing quests raises guild **reputation**; tiers
(Bronze → Silver → Gold → …) unlock better store stock, better recruits,
harder quest ranks, and the other villages.

### 6.1 Overworld random encounters

Traveling between villages on the overworld map can trigger a random
encounter (FFTA-style ambush on the road):

- **Trigger**: each travel leg rolls against an encounter chance per region
  (named constant, e.g. `ROAD_ENCOUNTER_CHANCE`), using the seeded RNG so
  travel outcomes are deterministic and testable.
- **Enemy parties are generated, not authored**: each overworld region has
  an **encounter table** in `src/content/` (typed data, like everything
  else) listing possible enemy compositions and a level range scaled to the
  region. Region difficulty rises with distance from the starting village.
- **Battle**: plays on one of the region's battle maps with the standard
  "defeat all foes" objective. Rewards: XP + small gold + chance of common
  drops — deliberately below quest rewards, so quests stay the main loop and
  encounters are seasoning (and a grinding option for players who want it).
- **Fleeing**: the guild can retreat from a random encounter at any time
  from the battle menu (units simply exit; no reward, no penalty beyond
  time). Quest battles cannot be fled this casually — retreating a quest
  forfeits its reward.

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
| Villages | 3 |
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
  ui/             HTML/CSS screens: battle HUD, village, shops, roster
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
3. ⬜ **M3 — Depth**: advanced classes + race gating, secondary skill sets,
   status effects, elements, equipment slots/tiers.
4. ⬜ **M4 — Content & polish**: all maps/quests/items to target, 2 more
   villages, overworld travel + random encounters (§6.1), reputation tiers,
   dispatch quests, balancing pass, audio, visual polish.

### Development log

A short record of what was built and decided, so anyone (including future
us, or a desktop/Steam port effort per §10) can follow the trail.

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

## 13. Explicitly out of scope (v1)

Multiplayer/online anything, story campaign/cutscenes, Judge/Law system,
monster recruitment, crafting, mobile/touch UI.

**Permanently out of scope (not just v1)**: permadeath and ironman modes —
KO'd guild members always recover after battle.
