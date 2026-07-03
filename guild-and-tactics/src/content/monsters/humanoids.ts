import type { MonsterContentEntry } from './monsterContentEntry';

/**
 * Humanoid enemies: goblins, orcs, minotaurs — and plain human bandits,
 * the only foes in the game the Darkness never touched.
 */
export const HUMANOID_MONSTERS = {
  goblin_raider: {
    identifier: 'goblin_raider',
    displayName: 'Goblin Raider',
    level: 3,
    statistics: {
      hitPointsMaximum: 22,
      manaPointsMaximum: 6,
      attack: 8,
      defense: 4,
      magicPower: 0,
      magicResistance: 3,
      speed: 11,
      movementRange: 5,
      jumpHeight: 2,
      evasion: 0.15,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 4,
      attack: 2,
      defense: 1,
      magicResistance: 1,
      evasion: 0.01,
    },
    canFly: false,
    skillIdentifiers: ['jagged_shiv'],
    // Cave vermin of the twisted world: numbers over quality.
    elementalAffinities: { sacred: 1.25, fire: 1.25 },
  },
  orc_brute: {
    identifier: 'orc_brute',
    displayName: 'Orc Brute',
    level: 4,
    statistics: {
      hitPointsMaximum: 42,
      manaPointsMaximum: 6,
      attack: 12,
      defense: 7,
      magicPower: 0,
      magicResistance: 4,
      speed: 7,
      movementRange: 4,
      jumpHeight: 1,
      evasion: 0.02,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 7,
      attack: 2,
      defense: 1,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['crushing_blow'],
    // The quality the goblins lack.
    elementalAffinities: { sacred: 1.25, dark: 0.75 },
  },
  plains_bandit: {
    identifier: 'plains_bandit',
    displayName: 'Bandit',
    level: 4,
    statistics: {
      hitPointsMaximum: 30,
      manaPointsMaximum: 8,
      attack: 10,
      defense: 6,
      magicPower: 0,
      magicResistance: 5,
      speed: 10,
      movementRange: 4,
      jumpHeight: 2,
      evasion: 0.1,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 5,
      attack: 2,
      defense: 1,
      magicResistance: 1,
      evasion: 0.01,
    },
    canFly: false,
    skillIdentifiers: ['jagged_shiv'],
    // Plain desperate humans (LORE.md: prone to desperation and violence)
    // — no twisted elemental quirks at all.
    elementalAffinities: {},
  },
  minotaur: {
    identifier: 'minotaur',
    displayName: 'Minotaur',
    level: 5,
    statistics: {
      hitPointsMaximum: 48,
      manaPointsMaximum: 6,
      attack: 13,
      defense: 8,
      magicPower: 0,
      magicResistance: 5,
      speed: 7,
      movementRange: 4,
      jumpHeight: 1,
      evasion: 0.02,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 7,
      attack: 3,
      defense: 1,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['horn_toss'],
    // A bull of the thorn flats: too big to trip, too angry to burn — but
    // Sacred still bites what the Darkness made.
    elementalAffinities: { sacred: 1.25, earth: 0.75 },
  },
} satisfies Record<string, MonsterContentEntry>;
