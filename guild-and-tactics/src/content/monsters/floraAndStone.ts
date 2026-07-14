import type { MonsterContentEntry } from './monsterContentEntry';

/**
 * The living landscape (LORE.md: "rocks came alive, trees walk the
 * earth") — slow, tough, and almost universally fire-shy.
 */
export const FLORA_AND_STONE_MONSTERS = {
  stoneling: {
    identifier: 'stoneling',
    displayName: 'Stoneling',
    level: 3,
    statistics: {
      hitPointsMaximum: 40,
      manaPointsMaximum: 6,
      attack: 10,
      defense: 11,
      magicPower: 0,
      magicResistance: 8,
      speed: 5,
      movementRange: 3,
      jumpHeight: 1,
      evasion: 0,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 6,
      attack: 2,
      defense: 2,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['rock_slam', 'petrifying_gaze'],
    // Stone absorbs fire and earth; water erodes it.
    elementalAffinities: { fire: 0.25, earth: 0.5, water: 1.75 },
  },
  gnarlroot: {
    identifier: 'gnarlroot',
    displayName: 'Gnarlroot',
    level: 3,
    statistics: {
      hitPointsMaximum: 34,
      manaPointsMaximum: 10,
      attack: 8,
      defense: 7,
      magicPower: 4,
      magicResistance: 6,
      speed: 6,
      movementRange: 3,
      jumpHeight: 1,
      evasion: 0.02,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 5,
      attack: 2,
      defense: 1,
      magicPower: 1,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['root_lash'],
    // Roots feed on water; fire scorches them; earth magic passes through.
    elementalAffinities: { fire: 1.75, water: 0.5, earth: 0.5 },
  },
  maneater_bloom: {
    identifier: 'maneater_bloom',
    displayName: 'Man-Eater Bloom',
    level: 2,
    statistics: {
      hitPointsMaximum: 24,
      manaPointsMaximum: 14,
      attack: 7,
      defense: 5,
      magicPower: 3,
      magicResistance: 4,
      speed: 5,
      movementRange: 2,
      jumpHeight: 1,
      evasion: 0,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 5,
      attack: 2,
      defense: 1,
      magicPower: 1,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['savage_bite', 'drowse_spores'],
    // A plant of the sleep-flower fields: drinks water, dreads fire.
    elementalAffinities: { fire: 1.75, water: 0.5, earth: 0.5 },
  },
  treewalker: {
    identifier: 'treewalker',
    displayName: 'Treewalker',
    level: 5,
    statistics: {
      hitPointsMaximum: 46,
      manaPointsMaximum: 10,
      attack: 12,
      defense: 9,
      magicPower: 4,
      magicResistance: 7,
      speed: 5,
      movementRange: 3,
      jumpHeight: 1,
      evasion: 0,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 7,
      attack: 2,
      defense: 2,
      magicPower: 1,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['bough_smash', 'root_lash'],
    // A whole tree on the move — gnarlroot's elder. The Shrine Wardens
    // insist some are peaceful; these ones aren't.
    elementalAffinities: { fire: 1.75, water: 0.5, earth: 0.5 },
  },
} satisfies Record<string, MonsterContentEntry>;
