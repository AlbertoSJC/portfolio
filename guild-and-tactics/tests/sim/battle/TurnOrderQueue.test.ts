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
