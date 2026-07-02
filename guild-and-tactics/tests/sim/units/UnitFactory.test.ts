import { describe, expect, it } from 'vitest';
import { createUnitFromCharacter } from '../../../src/sim/units/UnitFactory';
import { BASE_CLASSES } from '../../../src/content/baseClasses';
import { RACES } from '../../../src/content/races';
import type { BaseClassDefinition, RaceDefinition } from '../../../src/sim/units/UnitDefinitions';

function raceOrThrow(raceKey: string): RaceDefinition {
  const race = RACES[raceKey];
  if (race === undefined) {
    throw new Error(`Missing race "${raceKey}" in content`);
  }
  return race;
}

function baseClassOrThrow(classKey: string): BaseClassDefinition {
  const baseClass = BASE_CLASSES[classKey];
  if (baseClass === undefined) {
    throw new Error(`Missing base class "${classKey}" in content`);
  }
  return baseClass;
}

describe('createUnitFromCharacter', () => {
  it('refuses race and class combinations the race does not allow', () => {
    expect(() =>
      createUnitFromCharacter({
        identifier: 'invalid_feryan_mage',
        displayName: 'Impossible Feryan Mage',
        team: 'guild',
        race: raceOrThrow('feryan'),
        baseClass: baseClassOrThrow('mage'),
        level: 1,
        position: { column: 0, row: 0 },
        facing: 'north',
      }),
    ).toThrow(/cannot take/);
  });

  it('derives statistics from class base, per-level growth, and race bonuses', () => {
    const humanWarrior = createUnitFromCharacter({
      identifier: 'test_human_warrior',
      displayName: 'Test Warrior',
      team: 'guild',
      race: raceOrThrow('human'),
      baseClass: baseClassOrThrow('warrior'),
      level: 3,
      position: { column: 0, row: 0 },
      facing: 'north',
    });
    // Warrior level 3: hit points 30 + 6×2 = 42 (humans add no hit points).
    expect(humanWarrior.baseStatistics.hitPointsMaximum).toBe(42);
    // Attack 9 + 2×2 + 1 (human bonus) = 14.
    expect(humanWarrior.baseStatistics.attack).toBe(14);
    expect(humanWarrior.currentHitPoints).toBe(humanWarrior.baseStatistics.hitPointsMaximum);
  });

  it('gives Feryans flight and their movement bonus', () => {
    const feryanWarrior = createUnitFromCharacter({
      identifier: 'test_feryan_warrior',
      displayName: 'Test Feryan',
      team: 'guild',
      race: raceOrThrow('feryan'),
      baseClass: baseClassOrThrow('warrior'),
      level: 1,
      position: { column: 0, row: 0 },
      facing: 'north',
    });
    expect(feryanWarrior.canFly).toBe(true);
    // Warrior movement 4 + Feryan bonus 2 = 6.
    expect(feryanWarrior.baseStatistics.movementRange).toBe(6);
  });

  it('folds equipment bonuses into the derived statistics', () => {
    const recipeWithoutEquipment = {
      identifier: 'test_bare_warrior',
      displayName: 'Bare Warrior',
      team: 'guild' as const,
      race: raceOrThrow('human'),
      baseClass: baseClassOrThrow('warrior'),
      level: 2,
      position: { column: 0, row: 0 },
      facing: 'north' as const,
    };
    const bareWarrior = createUnitFromCharacter(recipeWithoutEquipment);
    const armedWarrior = createUnitFromCharacter({
      ...recipeWithoutEquipment,
      identifier: 'test_armed_warrior',
      equipment: [
        {
          identifier: 'test_blade',
          displayName: 'Test Blade',
          description: 'Test-only weapon.',
          slot: 'weapon',
          priceInGold: 0,
          statisticBonuses: { attack: 3, speed: -1 },
        },
      ],
    });
    expect(armedWarrior.baseStatistics.attack).toBe(bareWarrior.baseStatistics.attack + 3);
    expect(armedWarrior.baseStatistics.speed).toBe(bareWarrior.baseStatistics.speed - 1);
  });

  it('always grants the basic attack on top of class skills', () => {
    const humanThief = createUnitFromCharacter({
      identifier: 'test_thief',
      displayName: 'Test Thief',
      team: 'guild',
      race: raceOrThrow('human'),
      baseClass: baseClassOrThrow('thief'),
      level: 1,
      position: { column: 0, row: 0 },
      facing: 'north',
    });
    expect(humanThief.skillIdentifiers).toContain('basic_attack');
    expect(humanThief.skillIdentifiers).toContain('flanking_strike');
  });

  it('adds equipment-granted skills and marks them as gear-dependent', () => {
    const armedWarrior = createUnitFromCharacter({
      identifier: 'test_gear_warrior',
      displayName: 'Gear Warrior',
      team: 'guild',
      race: raceOrThrow('human'),
      baseClass: baseClassOrThrow('warrior'),
      level: 1,
      position: { column: 0, row: 0 },
      facing: 'north',
      equipmentGrantedSkillIdentifiers: ['cleaving_arc'],
    });
    expect(armedWarrior.skillIdentifiers).toContain('cleaving_arc');
    expect(armedWarrior.equipmentGrantedSkillIdentifiers).toEqual(['cleaving_arc']);
  });

  it('keeps mastered skills without gear and never double-lists a class-known skill', () => {
    const veteranWarrior = createUnitFromCharacter({
      identifier: 'test_veteran_warrior',
      displayName: 'Veteran Warrior',
      team: 'guild',
      race: raceOrThrow('human'),
      baseClass: baseClassOrThrow('warrior'),
      level: 1,
      position: { column: 0, row: 0 },
      facing: 'north',
      masteredSkillIdentifiers: ['cleaving_arc'],
      // The gear grants a skill already known through class and one through mastery:
      // neither counts as gear-dependent, so both survive unequipping.
      equipmentGrantedSkillIdentifiers: ['cleaving_arc', 'power_strike'],
    });
    expect(veteranWarrior.skillIdentifiers).toContain('cleaving_arc');
    expect(veteranWarrior.equipmentGrantedSkillIdentifiers).toEqual([]);
    expect(
      veteranWarrior.skillIdentifiers.filter((identifier) => identifier === 'power_strike'),
    ).toHaveLength(1);
    expect(
      veteranWarrior.skillIdentifiers.filter((identifier) => identifier === 'cleaving_arc'),
    ).toHaveLength(1);
  });
});
