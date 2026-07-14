import { describe, expect, it } from 'vitest';
import { SeededRandomNumberGenerator } from '@/sim/SeededRandomNumberGenerator';
import {
  executeSkill,
  findUnitsAffectedBySkill,
  isUnitSilencedForSkill,
} from '@/sim/battle/SkillExecution';
import type { SkillDefinition } from '@/sim/battle/SkillDefinition';
import { SKILLS } from '@/content/skills';
import { effectiveStatistic } from '@/sim/units/Unit';
import { createTestUnit } from '@tests/mocks/unitMocks';

function skillOrThrow(skillIdentifier: string): SkillDefinition {
  const skill = SKILLS[skillIdentifier];
  if (skill === undefined) {
    throw new Error(`Missing skill "${skillIdentifier}" in content`);
  }
  return skill;
}

function generatorThatRolls(plannedRolls: boolean[]): SeededRandomNumberGenerator {
  const generator = new SeededRandomNumberGenerator(1);
  generator.rollChance = () => plannedRolls.shift() ?? true;
  return generator;
}

describe('executeSkill', () => {
  it('spends the mana cost of the skill', () => {
    const caster = createTestUnit({ position: { column: 0, row: 0 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 1, row: 0 } });
    executeSkill(
      caster,
      skillOrThrow('fire_bolt'),
      enemy.position,
      [caster, enemy],
      generatorThatRolls([true, false]),
    );
    expect(caster.currentManaPoints).toBe(
      caster.baseStatistics.manaPointsMaximum - skillOrThrow('fire_bolt').manaPointCost,
    );
  });

  it('reports a miss without dealing damage when the hit roll fails', () => {
    const caster = createTestUnit({ position: { column: 0, row: 0 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 1, row: 0 } });
    const hitPointsBefore = enemy.currentHitPoints;
    const events = executeSkill(
      caster,
      skillOrThrow('basic_attack'),
      enemy.position,
      [caster, enemy],
      generatorThatRolls([false]),
    );
    expect(events.some((event) => event.kind === 'attackMissed')).toBe(true);
    expect(enemy.currentHitPoints).toBe(hitPointsBefore);
  });

  it('heals an ally and never beyond their maximum hit points', () => {
    const healer = createTestUnit({
      position: { column: 0, row: 0 },
      baseStatistics: { magicPower: 8 },
    });
    const woundedAlly = createTestUnit({
      position: { column: 1, row: 0 },
      currentHitPoints: 25,
    });
    executeSkill(
      healer,
      skillOrThrow('first_aid'),
      woundedAlly.position,
      [healer, woundedAlly],
      generatorThatRolls([]),
    );
    // 8 × 1.5 = 12 healing onto 25/30 caps at the maximum of 30.
    expect(woundedAlly.currentHitPoints).toBe(woundedAlly.baseStatistics.hitPointsMaximum);
  });

  it('applies a stat modifier that effectiveStatistic reflects', () => {
    const warrior = createTestUnit({ baseStatistics: { attack: 10 } });
    executeSkill(
      warrior,
      skillOrThrow('war_cry'),
      warrior.position,
      [warrior],
      generatorThatRolls([]),
    );
    expect(effectiveStatistic(warrior, 'attack')).toBe(14);
    expect(warrior.activeStatModifiers).toHaveLength(1);
  });

  it('hits every enemy inside the area of effect', () => {
    const caster = createTestUnit({ position: { column: 0, row: 0 } });
    const firstEnemy = createTestUnit({ team: 'enemy', position: { column: 3, row: 0 } });
    const secondEnemy = createTestUnit({ team: 'enemy', position: { column: 3, row: 1 } });
    const distantEnemy = createTestUnit({ team: 'enemy', position: { column: 3, row: 3 } });
    const events = executeSkill(
      caster,
      skillOrThrow('flame_burst'),
      { column: 3, row: 0 },
      [caster, firstEnemy, secondEnemy, distantEnemy],
      generatorThatRolls([true, false, true, false]),
    );
    const damagedIdentifiers = events
      .filter((event) => event.kind === 'damageDealt')
      .map((event) => (event.kind === 'damageDealt' ? event.defenderIdentifier : ''));
    expect(damagedIdentifiers).toContain(firstEnemy.identifier);
    expect(damagedIdentifiers).toContain(secondEnemy.identifier);
    expect(damagedIdentifiers).not.toContain(distantEnemy.identifier);
  });

  it('heals the Undead when struck with Dark damage (absorption)', () => {
    const darkSkill: SkillDefinition = {
      identifier: 'test_dark_bolt',
      displayName: 'Dark Bolt',
      description: 'Test-only dark damage.',
      manaPointCost: 0,
      targetingRange: 3,
      areaOfEffectRadius: 0,
      targetTeam: 'enemies',
      effect: { kind: 'damage', damageSource: 'magical', powerMultiplier: 1.0, element: 'dark' },
    };
    const caster = createTestUnit({ position: { column: 0, row: 0 } });
    const undeadEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 1, row: 0 },
      currentHitPoints: 10,
      elementalAffinities: { dark: -1 },
    });
    const events = executeSkill(
      caster,
      darkSkill,
      undeadEnemy.position,
      [caster, undeadEnemy],
      generatorThatRolls([true, false]),
    );
    expect(events.some((event) => event.kind === 'healingReceived')).toBe(true);
    expect(undeadEnemy.currentHitPoints).toBeGreaterThan(10);
  });

  it('emits a knockout event when damage drops a unit to zero', () => {
    const caster = createTestUnit({
      position: { column: 0, row: 0 },
      baseStatistics: { attack: 100 },
    });
    const fragileEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 1, row: 0 },
      currentHitPoints: 5,
    });
    const events = executeSkill(
      caster,
      skillOrThrow('basic_attack'),
      fragileEnemy.position,
      [caster, fragileEnemy],
      generatorThatRolls([true, false]),
    );
    expect(events.some((event) => event.kind === 'unitKnockedOut')).toBe(true);
    expect(fragileEnemy.currentHitPoints).toBe(0);
  });

  it('applies a status effect to the target', () => {
    const caster = createTestUnit({ position: { column: 0, row: 0 } });
    const target = createTestUnit({ team: 'enemy', position: { column: 1, row: 0 } });
    const events = executeSkill(
      caster,
      skillOrThrow('venom_strike'),
      target.position,
      [caster, target],
      generatorThatRolls([]),
    );
    expect(target.activeStatusEffects.some((effect) => effect.kind === 'poison')).toBe(true);
    expect(events.some((event) => event.kind === 'statusEffectApplied')).toBe(true);
  });
});

describe('isUnitSilencedForSkill', () => {
  it('blocks mana-cost skills but not the free basic attack', () => {
    const silencedUnit = createTestUnit({
      activeStatusEffects: [{ kind: 'silence', remainingTurns: 3, sourceSkillName: 'Mana Theft' }],
    });
    expect(isUnitSilencedForSkill(silencedUnit, skillOrThrow('fire_bolt'))).toBe(true);
    expect(isUnitSilencedForSkill(silencedUnit, skillOrThrow('basic_attack'))).toBe(false);
  });

  it('never blocks a unit that is not silenced', () => {
    const unaffectedUnit = createTestUnit();
    expect(isUnitSilencedForSkill(unaffectedUnit, skillOrThrow('fire_bolt'))).toBe(false);
  });
});

describe('findUnitsAffectedBySkill', () => {
  it('never targets knocked-out units', () => {
    const caster = createTestUnit({ position: { column: 0, row: 0 } });
    const downedEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 1, row: 0 },
      currentHitPoints: 0,
    });
    const affected = findUnitsAffectedBySkill(
      caster,
      skillOrThrow('basic_attack'),
      downedEnemy.position,
      [caster, downedEnemy],
    );
    expect(affected).toHaveLength(0);
  });
});
