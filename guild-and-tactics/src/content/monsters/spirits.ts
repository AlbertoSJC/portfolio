import type { MonsterContentEntry } from './monsterContentEntry';

/** Bodiless things — wisps, ghosts, and living weather. All flyers. */
export const SPIRIT_MONSTERS = {
  hollow_wisp: {
    identifier: 'hollow_wisp',
    displayName: 'Hollow Wisp',
    level: 4,
    statistics: {
      hitPointsMaximum: 18,
      manaPointsMaximum: 20,
      attack: 3,
      defense: 3,
      magicPower: 9,
      magicResistance: 8,
      speed: 8,
      movementRange: 4,
      jumpHeight: 2,
      evasion: 0.15,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 3,
      manaPointsMaximum: 3,
      magicPower: 2,
      magicResistance: 2,
      defense: 1,
      evasion: 0.01,
    },
    canFly: true,
    skillIdentifiers: ['dark_bolt'],
    // A knot of the Darkness itself: Sacred burns it, Dark feeds it.
    elementalAffinities: { sacred: 1.5, dark: -1 },
  },
  meadow_ghost: {
    identifier: 'meadow_ghost',
    displayName: 'Meadow Ghost',
    level: 3,
    statistics: {
      hitPointsMaximum: 16,
      manaPointsMaximum: 20,
      attack: 2,
      defense: 2,
      magicPower: 8,
      magicResistance: 9,
      speed: 8,
      movementRange: 4,
      jumpHeight: 2,
      evasion: 0.2,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 3,
      manaPointsMaximum: 3,
      magicPower: 2,
      magicResistance: 2,
      evasion: 0.01,
    },
    canFly: true,
    skillIdentifiers: ['dark_bolt'],
    // The night rumor of Slumber Meadow, true after all: Sacred banishes
    // it, the Dark feeds it.
    elementalAffinities: { sacred: 1.75, dark: -1 },
  },
  wind_sprite: {
    identifier: 'wind_sprite',
    displayName: 'Wind Sprite',
    level: 5,
    statistics: {
      hitPointsMaximum: 20,
      manaPointsMaximum: 24,
      attack: 3,
      defense: 3,
      magicPower: 10,
      magicResistance: 9,
      speed: 10,
      movementRange: 5,
      jumpHeight: 3,
      evasion: 0.2,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 3,
      manaPointsMaximum: 3,
      magicPower: 2,
      magicResistance: 2,
      evasion: 0.01,
    },
    canFly: true,
    skillIdentifiers: ['gale_burst'],
    // A knot of living gale. Wind passes through it; Taurk's stone
    // grounds it hard.
    elementalAffinities: { wind: -1, earth: 1.75 },
  },
} satisfies Record<string, MonsterContentEntry>;
