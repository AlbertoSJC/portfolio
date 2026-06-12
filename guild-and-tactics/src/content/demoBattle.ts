import type { Unit } from '../sim/units/Unit';
import { createUnitFromCharacter, createUnitFromMonster } from '../sim/units/UnitFactory';
import { BASE_CLASSES } from './baseClasses';
import { MONSTERS } from './monsters';
import { RACES } from './races';

const DEMO_PARTY_LEVEL = 3;

function definitionOrThrow<DefinitionType>(
  table: Record<string, DefinitionType>,
  key: string,
): DefinitionType {
  const definition = table[key];
  if (definition === undefined) {
    throw new Error(`Unknown content key "${key}"`);
  }
  return definition;
}

/**
 * The M1 demo battle: one guild member of each race (proving the
 * data-driven race/class rules) against a pack of Darkness creatures.
 */
export function createDemoBattleUnits(): Unit[] {
  const guildMembers: Unit[] = [
    createUnitFromCharacter({
      identifier: 'guild_garrick',
      displayName: 'Garrick',
      team: 'guild',
      race: definitionOrThrow(RACES, 'human'),
      baseClass: definitionOrThrow(BASE_CLASSES, 'warrior'),
      level: DEMO_PARTY_LEVEL,
      position: { column: 3, row: 9 },
      facing: 'north',
    }),
    createUnitFromCharacter({
      identifier: 'guild_nyssa',
      displayName: 'Nyssa',
      team: 'guild',
      race: definitionOrThrow(RACES, 'werecat'),
      baseClass: definitionOrThrow(BASE_CLASSES, 'thief'),
      level: DEMO_PARTY_LEVEL,
      position: { column: 5, row: 10 },
      facing: 'north',
    }),
    createUnitFromCharacter({
      identifier: 'guild_morvane',
      displayName: 'Morvane',
      team: 'guild',
      race: definitionOrThrow(RACES, 'undead'),
      baseClass: definitionOrThrow(BASE_CLASSES, 'mage'),
      level: DEMO_PARTY_LEVEL,
      position: { column: 6, row: 9 },
      facing: 'north',
    }),
    createUnitFromCharacter({
      identifier: 'guild_brakka',
      displayName: 'Brakka',
      team: 'guild',
      race: definitionOrThrow(RACES, 'werelizard'),
      baseClass: definitionOrThrow(BASE_CLASSES, 'priest'),
      level: DEMO_PARTY_LEVEL,
      position: { column: 4, row: 10 },
      facing: 'north',
    }),
    createUnitFromCharacter({
      identifier: 'guild_skreel',
      displayName: 'Skreel',
      team: 'guild',
      race: definitionOrThrow(RACES, 'feryan'),
      baseClass: definitionOrThrow(BASE_CLASSES, 'warrior'),
      level: DEMO_PARTY_LEVEL,
      position: { column: 7, row: 10 },
      facing: 'north',
    }),
  ];

  const enemies: Unit[] = [
    createUnitFromMonster(definitionOrThrow(MONSTERS, 'twisted_wolf'), 'enemy_wolf_1', { column: 2, row: 1 }, 'south'),
    createUnitFromMonster(definitionOrThrow(MONSTERS, 'twisted_wolf'), 'enemy_wolf_2', { column: 5, row: 0 }, 'south'),
    createUnitFromMonster(definitionOrThrow(MONSTERS, 'twisted_wolf'), 'enemy_wolf_3', { column: 9, row: 1 }, 'south'),
    createUnitFromMonster(definitionOrThrow(MONSTERS, 'stoneling'), 'enemy_stoneling_1', { column: 7, row: 1 }, 'south'),
    createUnitFromMonster(definitionOrThrow(MONSTERS, 'gnarlroot'), 'enemy_gnarlroot_1', { column: 4, row: 2 }, 'south'),
  ];

  return [...guildMembers, ...enemies];
}
