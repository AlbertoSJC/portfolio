import { describe, expect, it } from 'vitest';
import { Battle } from '../../../src/sim/battle/Battle';
import { parseBattleMapFromRows } from '../../../src/sim/grid/BattleMap';
import { ITEMS } from '../../../src/content/items';
import { SKILLS } from '../../../src/content/skills';
import { createTestUnit } from '../../mocks/unitMocks';
import type { Unit } from '../../../src/sim/units/Unit';

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
});
