import type { AdvancedClassDefinition } from '../../sim/units/UnitDefinitions';
import {
  PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
  HYBRID_PRIMARY_UNLOCK_LEVEL,
  HYBRID_SECONDARY_UNLOCK_LEVEL,
} from './shared';

/** Feryan-exclusive advanced classes (PRD §4 — 3 classes; 5 total with shared). */
export const FERYAN_ADVANCED_CLASSES: Record<string, AdvancedClassDefinition> = {
  skylancer: {
    identifier: 'skylancer',
    displayName: 'Skylancer',
    description: 'A Feryan warrior who made their wings part of the attack. Skylancers dive from altitude with unstoppable force, hitting harder than any grounded fighter ever could.',
    prerequisite: {
      primaryBaseClass: 'warrior',
      primaryBaseClassLevel: PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 28,
      manaPointsMaximum: 8,
      attack: 12,
      defense: 7,
      magicPower: 2,
      magicResistance: 4,
      speed: 9,
      movementRange: 5,
      jumpHeight: 4,
      evasion: 0.07,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 6,
      manaPointsMaximum: 1,
      attack: 2.5,
      defense: 1.5,
      magicResistance: 0.5,
      speed: 0.6,
    },
    skills: [],
  },

  spellblade: {
    identifier: 'spellblade',
    displayName: 'Spellblade',
    description: 'A Feryan who forces lightning and fire into their steel under battle-fury. The godless element for a godless people — the Spellblade is the Feryan way made manifest.',
    prerequisite: {
      primaryBaseClass: 'warrior',
      primaryBaseClassLevel: PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 26,
      manaPointsMaximum: 18,
      attack: 11,
      defense: 6,
      magicPower: 8,
      magicResistance: 5,
      speed: 9,
      movementRange: 5,
      jumpHeight: 2,
      evasion: 0.07,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 5,
      manaPointsMaximum: 2.5,
      attack: 2,
      defense: 1,
      magicPower: 2,
      magicResistance: 1,
      speed: 0.6,
    },
    skills: [],
  },

  skytalon: {
    identifier: 'skytalon',
    displayName: 'Skytalon',
    description: 'A Feryan predator who strikes from altitude with lethal precision. Skytallons hunt down fast, evasive targets that no grounded fighter could ever catch.',
    prerequisite: {
      primaryBaseClass: 'warrior',
      primaryBaseClassLevel: HYBRID_PRIMARY_UNLOCK_LEVEL,
      secondaryBaseClass: 'thief',
      secondaryBaseClassLevel: HYBRID_SECONDARY_UNLOCK_LEVEL,
    },
    statisticsAtLevelOne: {
      hitPointsMaximum: 26,
      manaPointsMaximum: 10,
      attack: 12,
      defense: 6,
      magicPower: 2,
      magicResistance: 3,
      speed: 11,
      movementRange: 6,
      jumpHeight: 3,
      evasion: 0.12,
    },
    statisticGrowthPerLevel: {
      hitPointsMaximum: 5,
      manaPointsMaximum: 1,
      attack: 2.5,
      defense: 1,
      speed: 0.7,
    },
    skills: [],
  },
};
