import type { MonsterContentEntry } from './monsterContentEntry';

/** Twisted animals — the fangs-tusks-and-talons half of the bestiary. */
export const BEAST_MONSTERS = {
  twisted_wolf: {
    identifier: 'twisted_wolf',
    displayName: 'Twisted Wolf',
    level: 3,
    statistics: {
      hitPointsMaximum: 26,
      manaPointsMaximum: 6,
      attack: 9,
      defense: 5,
      magicPower: 0,
      magicResistance: 3,
      speed: 10,
      movementRange: 5,
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
    skillIdentifiers: ['savage_bite'],
    // Twisted wolves burn easily and shy from sacred light.
    elementalAffinities: { fire: 1.5, sacred: 1.25, water: 0.75 },
  },
  twisted_boar: {
    identifier: 'twisted_boar',
    displayName: 'Twisted Boar',
    level: 4,
    statistics: {
      hitPointsMaximum: 34,
      manaPointsMaximum: 6,
      attack: 11,
      defense: 6,
      magicPower: 0,
      magicResistance: 3,
      speed: 9,
      movementRange: 5,
      jumpHeight: 1,
      evasion: 0.05,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 6,
      attack: 2,
      defense: 1,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['goring_charge'],
    // Boars are tough but burn.
    elementalAffinities: { fire: 1.5, earth: 0.75 },
  },
  thornback_boar: {
    identifier: 'thornback_boar',
    displayName: 'Thornback Boar',
    level: 4,
    statistics: {
      hitPointsMaximum: 36,
      manaPointsMaximum: 6,
      attack: 11,
      defense: 8,
      magicPower: 0,
      magicResistance: 4,
      speed: 8,
      movementRange: 5,
      jumpHeight: 1,
      evasion: 0.05,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 6,
      attack: 2,
      defense: 2,
      magicResistance: 1,
    },
    canFly: false,
    skillIdentifiers: ['goring_charge'],
    // The Breirwood cousin of the marsh boar — its briar hide turns
    // blades better and burns worse.
    elementalAffinities: { fire: 1.75, earth: 0.5 },
  },
  dire_owl: {
    identifier: 'dire_owl',
    displayName: 'Dire Owl',
    level: 4,
    statistics: {
      hitPointsMaximum: 24,
      manaPointsMaximum: 8,
      attack: 10,
      defense: 4,
      magicPower: 0,
      magicResistance: 5,
      speed: 12,
      movementRange: 5,
      jumpHeight: 3,
      evasion: 0.2,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 4,
      attack: 2,
      defense: 1,
      magicResistance: 1,
      evasion: 0.01,
    },
    canFly: true,
    skillIdentifiers: ['talon_dive'],
    // A hunter grown fat on Breir's wind — it rides gales that would
    // ground anything else.
    elementalAffinities: { wind: 0.5, fire: 1.25, lightning: 1.5 },
  },
} satisfies Record<string, MonsterContentEntry>;
