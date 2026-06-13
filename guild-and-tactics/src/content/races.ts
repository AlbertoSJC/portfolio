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
    allowedAdvancedClasses: [],
    elementalAffinities: {},
  },
  werecat: {
    identifier: 'werecat',
    displayName: 'Werecat',
    statisticBonuses: { speed: 2, evasion: 0.08, defense: -1 },
    canFly: false,
    allowedBaseClasses: ['warrior', 'thief', 'mage', 'priest'],
    allowedAdvancedClasses: [],
    elementalAffinities: {},
  },
  werelizard: {
    identifier: 'werelizard',
    displayName: 'Werelizard',
    statisticBonuses: { hitPointsMaximum: 8, defense: 3, speed: -2, magicPower: -1 },
    canFly: false,
    // Too slow and heavy for thievery (PRD §4).
    allowedBaseClasses: ['warrior', 'mage', 'priest'],
    allowedAdvancedClasses: [],
    elementalAffinities: {},
  },
  undead: {
    identifier: 'undead',
    displayName: 'Undead',
    statisticBonuses: { magicPower: 3, speed: -2, evasion: -0.03 },
    canFly: false,
    // Holy magic rejects the unliving (PRD §4) — no Priest.
    allowedBaseClasses: ['warrior', 'thief', 'mage'],
    allowedAdvancedClasses: [],
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
    allowedAdvancedClasses: [],
    elementalAffinities: {},
  },
};
