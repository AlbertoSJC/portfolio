import { describe, expect, it } from 'vitest';
import { Battle } from '@/sim/battle/Battle';
import { parseBattleMapFromRows } from '@/sim/grid/BattleMap';
import { ITEMS } from '@/content/items';
import { SKILLS } from '@/content/skills';
import { createTestUnit } from '@tests/mocks/unitMocks';
import type { Unit } from '@/sim/units/Unit';

const TEST_MAP = parseBattleMapFromRows('arena', 'Test Arena', [
  '......',
  '......',
  '......',
  '......',
]);

const FIXED_TEST_SEED = 42;

function createTestBattle(units: Unit[]): Battle {
  return new Battle(TEST_MAP, units, SKILLS, FIXED_TEST_SEED);
}

describe('Battle', () => {
  it('gives the first turn to the fastest unit', () => {
    const fastUnit = createTestUnit({ identifier: 'fast', baseStatistics: { speed: 12 } });
    const slowEnemy = createTestUnit({
      identifier: 'slow',
      team: 'enemy',
      position: { column: 5, row: 0 },
      baseStatistics: { speed: 6 },
    });
    const battle = createTestBattle([fastUnit, slowEnemy]);
    expect(battle.getActiveUnit().identifier).toBe('fast');
  });

  it('rejects moving to an unreachable tile', () => {
    const mover = createTestUnit({ baseStatistics: { speed: 12, movementRange: 2 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 3 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([mover, enemy]);
    expect(() => battle.moveActiveUnit({ column: 5, row: 3 })).toThrow();
  });

  it('rejects a second move in the same turn', () => {
    const mover = createTestUnit({ baseStatistics: { speed: 12 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 3 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([mover, enemy]);
    battle.moveActiveUnit({ column: 1, row: 0 });
    expect(() => battle.moveActiveUnit({ column: 2, row: 0 })).toThrow();
  });

  it('rejects a second action in the same turn', () => {
    const healer = createTestUnit({
      identifier: 'healer',
      skillIdentifiers: ['first_aid'],
      baseStatistics: { speed: 12 },
    });
    const woundedAlly = createTestUnit({
      position: { column: 1, row: 0 },
      currentHitPoints: 10,
      baseStatistics: { speed: 4 },
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 3 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([healer, woundedAlly, enemy]);
    battle.useSkillWithActiveUnit('first_aid', woundedAlly.position);
    expect(() => battle.useSkillWithActiveUnit('first_aid', woundedAlly.position)).toThrow();
  });

  it('counts each unit\'s skill uses for post-battle mastery', () => {
    const healer = createTestUnit({
      identifier: 'healer',
      skillIdentifiers: ['first_aid'],
      baseStatistics: { speed: 12 },
    });
    const woundedAlly = createTestUnit({
      position: { column: 1, row: 0 },
      currentHitPoints: 10,
      baseStatistics: { speed: 4 },
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 3 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([healer, woundedAlly, enemy]);
    expect(battle.getSkillUseCountsForUnit('healer')).toEqual({});
    battle.useSkillWithActiveUnit('first_aid', woundedAlly.position);
    expect(battle.getSkillUseCountsForUnit('healer')).toEqual({ first_aid: 1 });
    expect(battle.getSkillUseCountsForUnit(woundedAlly.identifier)).toEqual({});
  });

  it('rejects skills the active unit cannot afford', () => {
    const caster = createTestUnit({
      skillIdentifiers: ['fire_bolt'],
      currentManaPoints: 0,
      baseStatistics: { speed: 12 },
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 2, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([caster, enemy]);
    expect(() => battle.useSkillWithActiveUnit('fire_bolt', enemy.position)).toThrow();
  });

  it('passes the turn to the next unit and resets its turn flags', () => {
    // Speeds close together so the faster unit does not lap the slower one.
    const firstUnit = createTestUnit({ identifier: 'first', baseStatistics: { speed: 10 } });
    const secondUnit = createTestUnit({
      identifier: 'second',
      team: 'enemy',
      position: { column: 5, row: 0 },
      baseStatistics: { speed: 9 },
      hasMovedThisTurn: true,
      hasActedThisTurn: true,
    });
    const battle = createTestBattle([firstUnit, secondUnit]);
    battle.endActiveUnitTurn('south');
    expect(battle.getActiveUnit().identifier).toBe('second');
    expect(battle.getActiveUnit().hasMovedThisTurn).toBe(false);
    expect(battle.getActiveUnit().hasActedThisTurn).toBe(false);
    expect(firstUnit.facing).toBe('south');
  });

  it('always puts the acting unit first in the turn-order forecast', () => {
    const firstUnit = createTestUnit({ identifier: 'first', baseStatistics: { speed: 10 } });
    const secondUnit = createTestUnit({
      identifier: 'second',
      team: 'enemy',
      position: { column: 5, row: 0 },
      baseStatistics: { speed: 9 },
    });
    const battle = createTestBattle([firstUnit, secondUnit]);
    expect(battle.getTurnOrderForecast()[0]?.identifier).toBe('first');
    battle.endActiveUnitTurn();
    // After the turn passes, the forecast leads with the new acting unit.
    expect(battle.getTurnOrderForecast()[0]?.identifier).toBe('second');
  });

  it('declares victory when every enemy is knocked out', () => {
    const guildUnit = createTestUnit({ baseStatistics: { speed: 12 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([guildUnit, enemy]);
    enemy.currentHitPoints = 0;
    expect(battle.getBattleOutcome()).toBe('victory');
  });

  it('uses a potion on an adjacent ally, consuming one charge and the action', () => {
    const user = createTestUnit({ baseStatistics: { speed: 12 } });
    const woundedAlly = createTestUnit({
      position: { column: 1, row: 0 },
      currentHitPoints: 5,
      baseStatistics: { speed: 4 },
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 3 }, baseStatistics: { speed: 6 } });
    const battle = new Battle(TEST_MAP, [user, woundedAlly, enemy], SKILLS, FIXED_TEST_SEED, ITEMS, {
      potion: 2,
    });
    const events = battle.useItemWithActiveUnit('potion', woundedAlly.position);
    expect(events.some((event) => event.kind === 'itemUsed')).toBe(true);
    // Potion restores 30, capped by the 30-hit-point maximum: 5 → 30.
    expect(woundedAlly.currentHitPoints).toBe(30);
    expect(battle.getRemainingItemPouch()['potion']).toBe(1);
    expect(battle.getActiveUnit().hasActedThisTurn).toBe(true);
  });

  it('restores mana with an ether and refuses items aimed at enemies', () => {
    const user = createTestUnit({ currentManaPoints: 0, baseStatistics: { speed: 12 } });
    const adjacentEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 1, row: 0 },
      baseStatistics: { speed: 6 },
    });
    const battle = new Battle(TEST_MAP, [user, adjacentEnemy], SKILLS, FIXED_TEST_SEED, ITEMS, {
      ether: 1,
    });
    expect(() => battle.useItemWithActiveUnit('ether', adjacentEnemy.position)).toThrow();
    battle.useItemWithActiveUnit('ether', user.position);
    expect(user.currentManaPoints).toBe(10); // ether restores up to 12, capped at the 10 maximum
  });

  it('records the levels of defeated enemies for kill experience', () => {
    const attacker = createTestUnit({ baseStatistics: { speed: 12, attack: 100 } });
    const fragileEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 1, row: 0 },
      level: 4,
      currentHitPoints: 1,
      baseStatistics: { speed: 6, evasion: 0 },
    });
    const battle = new Battle(TEST_MAP, [attacker, fragileEnemy], SKILLS, FIXED_TEST_SEED);
    // Attack until the dice land a hit (misses are possible, never fatal here).
    while (battle.getBattleOutcome() === 'ongoing') {
      if (battle.getActiveUnit().identifier === attacker.identifier) {
        attacker.hasActedThisTurn = false;
        battle.useSkillWithActiveUnit('basic_attack', fragileEnemy.position);
        if (battle.getBattleOutcome() === 'ongoing') {
          battle.endActiveUnitTurn();
        }
      } else {
        battle.endActiveUnitTurn();
      }
    }
    expect(battle.defeatedEnemyLevels).toEqual([4]);
  });

  it('declares defeat when every guild member is knocked out', () => {
    const guildUnit = createTestUnit({ baseStatistics: { speed: 12 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([guildUnit, enemy]);
    guildUnit.currentHitPoints = 0;
    expect(battle.getBattleOutcome()).toBe('defeat');
  });

  it('deals poison damage at start of a poisoned unit turn', () => {
    const poisonedUnit = createTestUnit({
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'poison', remainingTurns: 3, sourceSkillName: 'Venom Strike' }],
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([poisonedUnit, enemy]);
    const hpBefore = poisonedUnit.currentHitPoints;
    const events = battle.processStartOfTurnForActiveUnit();
    expect(poisonedUnit.currentHitPoints).toBeLessThan(hpBefore);
    expect(events.some((event) => event.kind === 'poisonDamageDealt')).toBe(true);
  });

  it('restores hit points to a regenerating unit at the start of its turn, capped at maximum', () => {
    const regeneratingUnit = createTestUnit({
      currentHitPoints: 10,
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'regen', remainingTurns: 3, sourceSkillName: 'Mending Prayer' }],
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([regeneratingUnit, enemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(regeneratingUnit.currentHitPoints).toBeGreaterThan(10);
    expect(events.some((event) => event.kind === 'regenHealingRestored')).toBe(true);

    // At full hit points, regen restores nothing and stays silent.
    regeneratingUnit.currentHitPoints = regeneratingUnit.baseStatistics.hitPointsMaximum;
    const eventsAtFullHealth = battle.processStartOfTurnForActiveUnit();
    expect(regeneratingUnit.currentHitPoints).toBe(regeneratingUnit.baseStatistics.hitPointsMaximum);
    expect(eventsAtFullHealth.some((event) => event.kind === 'regenHealingRestored')).toBe(false);
  });

  it('auto-ends the turn of a sleeping unit and emits a skip event', () => {
    const sleepingUnit = createTestUnit({
      identifier: 'sleeper',
      baseStatistics: { speed: 9 },
      activeStatusEffects: [{ kind: 'sleep', remainingTurns: 2, sourceSkillName: 'Sleep Dust' }],
    });
    const enemy = createTestUnit({
      identifier: 'enemy_wake',
      team: 'enemy',
      position: { column: 5, row: 0 },
      baseStatistics: { speed: 8 },
    });
    const battle = createTestBattle([sleepingUnit, enemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(events.some((event) => event.kind === 'turnSkippedBySleep')).toBe(true);
    expect(events.some((event) => event.kind === 'turnEnded')).toBe(true);
    expect(battle.getActiveUnit().identifier).toBe('enemy_wake');
  });

  it('blocks a silenced unit from casting a mana-cost skill but still allows a basic attack', () => {
    const silencedCaster = createTestUnit({
      identifier: 'caster',
      skillIdentifiers: ['basic_attack', 'fire_bolt'],
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'silence', remainingTurns: 3, sourceSkillName: 'Mana Theft' }],
    });
    const enemy = createTestUnit({
      team: 'enemy',
      position: { column: 1, row: 0 },
      baseStatistics: { speed: 6 },
    });
    const battle = createTestBattle([silencedCaster, enemy]);
    expect(() => battle.useSkillWithActiveUnit('fire_bolt', enemy.position)).toThrow();
    expect(() => battle.useSkillWithActiveUnit('basic_attack', enemy.position)).not.toThrow();
  });

  it('kills a doomed unit exactly on the countdown\'s last turn, not before', () => {
    const notYetDoomedUnit = createTestUnit({
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'doom', remainingTurns: 3, sourceSkillName: 'Grave Sentence' }],
    });
    const earlyEnemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const earlyBattle = createTestBattle([notYetDoomedUnit, earlyEnemy]);
    const earlyEvents = earlyBattle.processStartOfTurnForActiveUnit();
    expect(notYetDoomedUnit.currentHitPoints).toBeGreaterThan(0);
    expect(earlyEvents.some((event) => event.kind === 'doomTriggered')).toBe(false);

    const doomedUnit = createTestUnit({
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'doom', remainingTurns: 1, sourceSkillName: 'Grave Sentence' }],
    });
    const lateEnemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const lateBattle = createTestBattle([doomedUnit, lateEnemy]);
    const lateEvents = lateBattle.processStartOfTurnForActiveUnit();
    expect(doomedUnit.currentHitPoints).toBe(0);
    expect(lateEvents.some((event) => event.kind === 'doomTriggered')).toBe(true);
    expect(lateEvents.some((event) => event.kind === 'unitKnockedOut')).toBe(true);
  });

  it('fully freezes a stopped unit: turn skipped, no poison or regen tick that turn', () => {
    const stoppedUnit = createTestUnit({
      identifier: 'stopped',
      currentHitPoints: 10,
      baseStatistics: { speed: 9 },
      activeStatusEffects: [
        { kind: 'stop', remainingTurns: 2, sourceSkillName: 'Petrifying Gaze' },
        { kind: 'poison', remainingTurns: 3, sourceSkillName: 'Venom Strike' },
        { kind: 'regen', remainingTurns: 3, sourceSkillName: 'Mending Prayer' },
      ],
    });
    const enemy = createTestUnit({
      identifier: 'enemy_wake',
      team: 'enemy',
      position: { column: 5, row: 0 },
      baseStatistics: { speed: 8 },
    });
    const battle = createTestBattle([stoppedUnit, enemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(stoppedUnit.currentHitPoints).toBe(10);
    expect(events.some((event) => event.kind === 'turnSkippedByStop')).toBe(true);
    expect(events.some((event) => event.kind === 'poisonDamageDealt')).toBe(false);
    expect(events.some((event) => event.kind === 'regenHealingRestored')).toBe(false);
    expect(battle.getActiveUnit().identifier).toBe('enemy_wake');
  });

  it('lets doom kill a unit on its final turn even while that unit is also stopped', () => {
    const doomedAndStoppedUnit = createTestUnit({
      identifier: 'doomed_and_stopped',
      baseStatistics: { speed: 12 },
      activeStatusEffects: [
        { kind: 'doom', remainingTurns: 1, sourceSkillName: 'Grave Sentence' },
        { kind: 'stop', remainingTurns: 2, sourceSkillName: 'Petrifying Gaze' },
      ],
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([doomedAndStoppedUnit, enemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(doomedAndStoppedUnit.currentHitPoints).toBe(0);
    expect(events.some((event) => event.kind === 'doomTriggered')).toBe(true);
    expect(events.some((event) => event.kind === 'turnSkippedByStop')).toBe(false);
  });

  it('forces a berserk unit to attack the nearest enemy when one is in range', () => {
    const berserkUnit = createTestUnit({
      identifier: 'berserker',
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'berserk', remainingTurns: 3, sourceSkillName: 'Feral Frenzy' }],
    });
    const nearEnemy = createTestUnit({
      identifier: 'near_enemy',
      team: 'enemy',
      position: { column: 1, row: 0 },
      baseStatistics: { speed: 6 },
    });
    const battle = createTestBattle([berserkUnit, nearEnemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(events.some((event) => event.kind === 'berserkAttackResolved')).toBe(true);
    expect(events.some((event) => event.kind === 'damageDealt' || event.kind === 'attackMissed')).toBe(true);
    expect(events.some((event) => event.kind === 'turnEnded')).toBe(true);
  });

  it('wastes a berserk unit\'s turn when no enemy is in range', () => {
    const berserkUnit = createTestUnit({
      identifier: 'berserker',
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'berserk', remainingTurns: 3, sourceSkillName: 'Feral Frenzy' }],
    });
    const farEnemy = createTestUnit({
      identifier: 'far_enemy',
      team: 'enemy',
      position: { column: 5, row: 3 },
      baseStatistics: { speed: 6 },
    });
    const battle = createTestBattle([berserkUnit, farEnemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(events.some((event) => event.kind === 'berserkAttackResolved')).toBe(true);
    expect(events.some((event) => event.kind === 'skillUsed')).toBe(false);
    expect(events.some((event) => event.kind === 'turnEnded')).toBe(true);
  });

  it('forces a confused unit to strike a random unit in range, including allies', () => {
    const confusedUnit = createTestUnit({
      identifier: 'confused',
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'confuse', remainingTurns: 2, sourceSkillName: 'Shattered Mind' }],
    });
    const onlyAlly = createTestUnit({
      identifier: 'ally',
      position: { column: 1, row: 0 },
      baseStatistics: { speed: 4 },
    });
    const farEnemy = createTestUnit({
      identifier: 'far_enemy',
      team: 'enemy',
      position: { column: 5, row: 3 },
      baseStatistics: { speed: 6 },
    });
    const battle = createTestBattle([confusedUnit, onlyAlly, farEnemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(events.some((event) => event.kind === 'confusedAttackResolved')).toBe(true);
    expect(events.some((event) => event.kind === 'damageDealt' || event.kind === 'attackMissed')).toBe(true);
    expect(events.some((event) => event.kind === 'turnEnded')).toBe(true);
  });

  it('wastes a confused unit\'s turn when no one is in range', () => {
    const confusedUnit = createTestUnit({
      identifier: 'confused',
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'confuse', remainingTurns: 2, sourceSkillName: 'Shattered Mind' }],
    });
    const farEnemy = createTestUnit({
      identifier: 'far_enemy',
      team: 'enemy',
      position: { column: 5, row: 3 },
      baseStatistics: { speed: 6 },
    });
    const battle = createTestBattle([confusedUnit, farEnemy]);
    const events = battle.processStartOfTurnForActiveUnit();
    expect(events.some((event) => event.kind === 'confusedAttackResolved')).toBe(true);
    expect(events.some((event) => event.kind === 'skillUsed')).toBe(false);
    expect(events.some((event) => event.kind === 'turnEnded')).toBe(true);
  });

  it('ends the battle as fled when a guild unit retreats from a fleeable battle', () => {
    const guildUnit = createTestUnit({ baseStatistics: { speed: 12 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = new Battle(TEST_MAP, [guildUnit, enemy], SKILLS, FIXED_TEST_SEED, {}, {}, true);
    const events = battle.fleeWithActiveUnit();
    expect(events.some((event) => event.kind === 'guildFled')).toBe(true);
    expect(events.some((event) => event.kind === 'battleEnded' && event.outcome === 'fled')).toBe(true);
    expect(battle.getBattleOutcome()).toBe('fled');
  });

  it('rejects fleeing when the battle does not permit it', () => {
    const guildUnit = createTestUnit({ baseStatistics: { speed: 12 } });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([guildUnit, enemy]);
    expect(() => battle.fleeWithActiveUnit()).toThrow();
  });

  it('rejects fleeing during an enemy turn', () => {
    const guildUnit = createTestUnit({ baseStatistics: { speed: 6 } });
    const fasterEnemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 12 } });
    const battle = new Battle(TEST_MAP, [guildUnit, fasterEnemy], SKILLS, FIXED_TEST_SEED, {}, {}, true);
    expect(battle.getActiveUnit().team).toBe('enemy');
    expect(() => battle.fleeWithActiveUnit()).toThrow();
  });

  it('ticks down status effects at end of turn and removes expired ones', () => {
    const affectedUnit = createTestUnit({
      baseStatistics: { speed: 12 },
      activeStatusEffects: [{ kind: 'poison', remainingTurns: 1, sourceSkillName: 'Venom Strike' }],
    });
    const enemy = createTestUnit({ team: 'enemy', position: { column: 5, row: 0 }, baseStatistics: { speed: 6 } });
    const battle = createTestBattle([affectedUnit, enemy]);
    battle.endActiveUnitTurn();
    expect(affectedUnit.activeStatusEffects).toHaveLength(0);
  });
});
