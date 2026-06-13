import type { Unit, UnitStatistics } from '../../src/sim/units/Unit';

export const NEUTRAL_TEST_STATISTICS: UnitStatistics = {
  hitPointsMaximum: 30,
  manaPointsMaximum: 10,
  attack: 10,
  defense: 6,
  magicPower: 8,
  magicResistance: 4,
  speed: 8,
  movementRange: 4,
  jumpHeight: 1,
  evasion: 0,
};

let nextMockUnitNumber = 1;

export function createTestUnit(
  overrides: Partial<Omit<Unit, 'baseStatistics'>> & {
    baseStatistics?: Partial<UnitStatistics>;
  } = {},
): Unit {
  const statistics: UnitStatistics = { ...NEUTRAL_TEST_STATISTICS, ...overrides.baseStatistics };
  const fallbackIdentifier = `test_unit_${nextMockUnitNumber}`;
  nextMockUnitNumber += 1;
  return {
    identifier: fallbackIdentifier,
    displayName: 'Test Unit',
    team: 'guild',
    raceLabel: 'Human',
    classLabel: 'Warrior',
    level: 1,
    currentHitPoints: statistics.hitPointsMaximum,
    currentManaPoints: statistics.manaPointsMaximum,
    position: { column: 0, row: 0 },
    facing: 'north',
    canFly: false,
    skillIdentifiers: ['basic_attack'],
    elementalAffinities: {},
    activeStatModifiers: [],
    activeStatusEffects: [],
    hasMovedThisTurn: false,
    hasActedThisTurn: false,
    turnCharge: 0,
    ...overrides,
    baseStatistics: statistics,
  };
}
