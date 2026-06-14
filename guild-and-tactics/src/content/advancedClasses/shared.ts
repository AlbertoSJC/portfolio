import type { AdvancedClassDefinition } from '../../sim/units/UnitDefinitions';

/** Minimum level in the primary base class before a pure advanced class unlocks. */
export const PURE_ADVANCED_CLASS_UNLOCK_LEVEL = 5;
/** Minimum level in the primary base class before a hybrid advanced class unlocks. */
export const HYBRID_PRIMARY_UNLOCK_LEVEL = 5;
/** Minimum level in the secondary base class before a hybrid advanced class unlocks. */
export const HYBRID_SECONDARY_UNLOCK_LEVEL = 3;

/** Classes available to more than one race (PRD §4). */
export const SHARED_ADVANCED_CLASSES: Record<string, AdvancedClassDefinition> = {
  knight: {
    identifier: 'knight',
    displayName: 'Knight',
    description: 'The unbreakable wall of the guild. Knights hold ground, shield allies, and outlast every blow thrown at them — trading speed for near-impenetrable defense.',
    prerequisite: {
      primaryBaseClass: 'warrior',
      primaryBaseClassLevel: PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 36,
      manaPointsMaximum: 8,
      attack: 11,
      defense: 12,
      magicPower: 2,
      magicResistance: 6,
      speed: 6,
      movementRange: 3,
      jumpHeight: 1,
      evasion: 0.03,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 8,
      manaPointsMaximum: 1,
      attack: 2,
      defense: 2,
      magicResistance: 0.5,
      speed: 0.3,
    },
    skills: [],
  },

  berserker: {
    identifier: 'berserker',
    displayName: 'Berserker',
    description: 'Fury given form. Berserkers sacrifice defense for overwhelming attack power, turning battle-rage into something barely controllable and entirely lethal.',
    prerequisite: {
      primaryBaseClass: 'warrior',
      primaryBaseClassLevel: PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 32,
      manaPointsMaximum: 6,
      attack: 14,
      defense: 5,
      magicPower: 1,
      magicResistance: 3,
      speed: 8,
      movementRange: 4,
      jumpHeight: 1,
      evasion: 0.05,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 6,
      attack: 3,
      defense: 0.5,
      speed: 0.5,
    },
    skills: [],
  },

  ranger: {
    identifier: 'ranger',
    displayName: 'Ranger',
    description: 'A hunter trained to strike from distance and cover vast ground. Rangers pick off targets before they can close the gap and fade before retaliation lands.',
    prerequisite: {
      primaryBaseClass: 'thief',
      primaryBaseClassLevel: PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 24,
      manaPointsMaximum: 12,
      attack: 9,
      defense: 5,
      magicPower: 4,
      magicResistance: 5,
      speed: 9,
      movementRange: 5,
      jumpHeight: 2,
      evasion: 0.12,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 4,
      manaPointsMaximum: 1,
      attack: 2,
      defense: 0.5,
      speed: 0.6,
    },
    skills: [],
  },

  duelist: {
    identifier: 'duelist',
    displayName: 'Duelist',
    description: 'A master of single combat who reads every enemy movement and turns it back on them. The Duelist is near-impossible to land a clean hit on.',
    prerequisite: {
      primaryBaseClass: 'thief',
      primaryBaseClassLevel: PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 26,
      manaPointsMaximum: 10,
      attack: 10,
      defense: 6,
      magicPower: 3,
      magicResistance: 4,
      speed: 11,
      movementRange: 5,
      jumpHeight: 2,
      evasion: 0.2,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 4,
      manaPointsMaximum: 1,
      attack: 2,
      defense: 1,
      speed: 0.7,
      evasion: 0.007,
    },
    skills: [],
  },

  sage: {
    identifier: 'sage',
    displayName: 'Sage',
    description: 'A scholar who fused arcane study with healing devotion. Sages wield both the Mage\'s power and the Priest\'s restoration — without the full depth of either.',
    prerequisite: {
      primaryBaseClass: 'mage',
      primaryBaseClassLevel: HYBRID_PRIMARY_UNLOCK_LEVEL,
      secondaryBaseClass: 'priest',
      secondaryBaseClassLevel: HYBRID_SECONDARY_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 22,
      manaPointsMaximum: 26,
      attack: 4,
      defense: 5,
      magicPower: 9,
      magicResistance: 11,
      speed: 7,
      movementRange: 3,
      jumpHeight: 1,
      evasion: 0.05,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 3.5,
      manaPointsMaximum: 4,
      attack: 0.5,
      defense: 0.5,
      magicPower: 1.5,
      magicResistance: 2,
      speed: 0.4,
    },
    skills: [],
  },

  assassin: {
    identifier: 'assassin',
    displayName: 'Assassin',
    description: 'A shadow operative trained to kill fast and vanish. Assassins combine a warrior\'s raw lethality with a thief\'s cunning — no target is truly safe.',
    prerequisite: {
      primaryBaseClass: 'warrior',
      primaryBaseClassLevel: HYBRID_PRIMARY_UNLOCK_LEVEL,
      secondaryBaseClass: 'thief',
      secondaryBaseClassLevel: HYBRID_SECONDARY_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 26,
      manaPointsMaximum: 14,
      attack: 11,
      defense: 5,
      magicPower: 3,
      magicResistance: 4,
      speed: 11,
      movementRange: 5,
      jumpHeight: 2,
      evasion: 0.15,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 5,
      manaPointsMaximum: 1.5,
      attack: 2.5,
      defense: 1,
      speed: 0.6,
    },
    skills: [],
  },
};
