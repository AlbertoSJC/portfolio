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
