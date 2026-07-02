import { describe, expect, it } from 'vitest';
import {
  advanceToNextReadyUnit,
  forecastUpcomingTurnOrder,
} from '../../../src/sim/battle/TurnOrderQueue';
import { TURN_ORDER_FORECAST_LENGTH } from '../../../src/sim/battle/combatConstants';
import { createTestUnit } from '../../mocks/unitMocks';

describe('advanceToNextReadyUnit', () => {
  it('lets a unit with double speed act twice before a slow unit acts once', () => {
    const fastUnit = createTestUnit({ identifier: 'fast', baseStatistics: { speed: 10 } });
    const slowUnit = createTestUnit({ identifier: 'slow', baseStatistics: { speed: 5 } });
    const units = [fastUnit, slowUnit];

    expect(advanceToNextReadyUnit(units).identifier).toBe('fast');
    expect(advanceToNextReadyUnit(units).identifier).toBe('fast');
    expect(advanceToNextReadyUnit(units).identifier).toBe('slow');
  });

  it('gives a hasted unit two of the first three turns against an equal-speed unit', () => {
    // Haste multiplies 10 speed to 15: ready at ticks 7 / 14 vs the normal unit's 10.
    const hastedUnit = createTestUnit({
      identifier: 'hasted',
      baseStatistics: { speed: 10 },
      activeStatusEffects: [{ kind: 'haste', remainingTurns: 3, sourceSkillName: 'Quickening' }],
    });
    const normalUnit = createTestUnit({ identifier: 'normal', baseStatistics: { speed: 10 } });
    const units = [hastedUnit, normalUnit];

    expect(advanceToNextReadyUnit(units).identifier).toBe('hasted');
    expect(advanceToNextReadyUnit(units).identifier).toBe('normal');
    expect(advanceToNextReadyUnit(units).identifier).toBe('hasted');
  });

  it('makes a slowed unit fall behind an equal-speed unit', () => {
    const slowedUnit = createTestUnit({
      identifier: 'slowed',
      baseStatistics: { speed: 10 },
      activeStatusEffects: [{ kind: 'slow', remainingTurns: 3, sourceSkillName: 'Leaden Curse' }],
    });
    const normalUnit = createTestUnit({ identifier: 'normal', baseStatistics: { speed: 10 } });
    const units = [slowedUnit, normalUnit];

    expect(advanceToNextReadyUnit(units).identifier).toBe('normal');
    expect(advanceToNextReadyUnit(units).identifier).toBe('normal');
    expect(advanceToNextReadyUnit(units).identifier).toBe('slowed');
  });

  it('counts active speed modifiers toward turn charge', () => {
    const buffedUnit = createTestUnit({
      identifier: 'buffed',
      baseStatistics: { speed: 10 },
      activeStatModifiers: [
        { statistic: 'speed', amount: 10, remainingTurns: 3, sourceSkillName: 'Test Buff' },
      ],
    });
    const normalUnit = createTestUnit({ identifier: 'normal', baseStatistics: { speed: 10 } });
    const units = [buffedUnit, normalUnit];

    expect(advanceToNextReadyUnit(units).identifier).toBe('buffed');
    expect(advanceToNextReadyUnit(units).identifier).toBe('buffed');
    expect(advanceToNextReadyUnit(units).identifier).toBe('normal');
  });

  it('skips knocked-out units', () => {
    const livingUnit = createTestUnit({ identifier: 'living', baseStatistics: { speed: 5 } });
    const knockedOutUnit = createTestUnit({
      identifier: 'downed',
      baseStatistics: { speed: 50 },
      currentHitPoints: 0,
    });
    expect(advanceToNextReadyUnit([livingUnit, knockedOutUnit]).identifier).toBe('living');
  });
});

describe('forecastUpcomingTurnOrder', () => {
  it('predicts the configured number of turns without mutating charges', () => {
    const firstUnit = createTestUnit({ identifier: 'first', baseStatistics: { speed: 9 } });
    const secondUnit = createTestUnit({ identifier: 'second', baseStatistics: { speed: 6 } });
    const chargesBefore = [firstUnit.turnCharge, secondUnit.turnCharge];

    const forecast = forecastUpcomingTurnOrder([firstUnit, secondUnit]);

    expect(forecast).toHaveLength(TURN_ORDER_FORECAST_LENGTH);
    expect([firstUnit.turnCharge, secondUnit.turnCharge]).toEqual(chargesBefore);
    expect(forecast[0]?.identifier).toBe('first');
  });
});
