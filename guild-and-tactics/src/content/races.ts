import type { RaceDefinition } from '../sim/units/UnitDefinitions';

/**
 * The five races of Aentea (PRD §3; lore in LORE.md, untracked).
 * Statistic bonuses stack on top of class statistics.
 */
export const RACES: Record<string, RaceDefinition> = {
  human: {
    identifier: 'human',
    displayName: 'Human',
    statisticBonuses: { attack: 1, defense: 1, magicPower: 1, magicResistance: 1 },
    canFly: false,
    allowedBaseClasses: ['warrior', 'thief', 'mage', 'priest'],
    // Breadth over exclusivity; Hortian sacred tradition (PRD §4 — 13 classes).
    allowedAdvancedClasses: [
      'knight', 'dragoon',
      'ranger', 'duelist',
      'black_mage', 'illusionist',
      'bishop',
      'assassin', 'rune_knight', 'paladin', 'spellthief', 'inquisitor',
      'sage',
    ],
    elementalAffinities: {},
  },
  werecat: {
    identifier: 'werecat',
    displayName: 'Werecat',
    statisticBonuses: { speed: 2, evasion: 0.08, defense: -1 },
    canFly: false,
    allowedBaseClasses: ['warrior', 'thief', 'mage', 'priest'],
    // Wind and earth, speed and stealth; Breir and Taurk (PRD §4 — 10 classes).
    allowedAdvancedClasses: [
      'berserker',
      'duelist', 'shadowdancer',
      'galeweaver',
      'assassin', 'windwanderer', 'priest_of_the_8_lives', 'phantom', 'shrine_warden',
      'sage',
    ],
    elementalAffinities: {},
  },
  werelizard: {
    identifier: 'werelizard',
    displayName: 'Werelizard',
    statisticBonuses: { hitPointsMaximum: 8, defense: 3, speed: -2, magicPower: -1 },
    canFly: false,
    // Too slow and heavy for thievery (PRD §4).
    allowedBaseClasses: ['warrior', 'mage', 'priest'],
    // Earth and water, enhancement and healing; Taurk and Yiern (PRD §4 — 7 classes).
    allowedAdvancedClasses: [
      'knight', 'berserker',
      'geomancer',
      'shaman',
      'stonefist', 'totem_guard',
      'sage',
    ],
    elementalAffinities: {},
  },
  undead: {
    identifier: 'undead',
    displayName: 'Undead',
    statisticBonuses: { magicPower: 3, speed: -2, evasion: -0.03 },
    canFly: false,
    // Holy magic rejects the unliving (PRD §4) — no Priest.
    allowedBaseClasses: ['warrior', 'thief', 'mage'],
    // Fire, darkness, and the grave; Kosh's faithful (PRD §4 — 7 classes).
    allowedAdvancedClasses: [
      'knight', 'dread_knight',
      'pyromancer', 'necromancer',
      'revenant', 'ashguard', 'wraith',
    ],
    // Sacred wounds them deeply; Dark knits them back together.
    elementalAffinities: { sacred: 1.5, dark: -1 },
  },
  feryan: {
    identifier: 'feryan',
    displayName: 'Feryan',
    statisticBonuses: { movementRange: 2, speed: 1, hitPointsMaximum: -4 },
    canFly: true,
    // Feryans renounce magic (locked rule, PRD §3/§4) — Warrior and Thief only.
    allowedBaseClasses: ['warrior', 'thief'],
    // Godless weapon-experts of the sky (PRD §4 — 5 classes).
    allowedAdvancedClasses: ['skylancer', 'spellblade', 'ranger', 'duelist', 'skytalon'],
    elementalAffinities: {},
  },
};
