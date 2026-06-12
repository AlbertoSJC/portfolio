import { describe, expect, it } from 'vitest';
import { parseBattleMapFromRows } from '../../../src/sim/grid/BattleMap';
import { positionKey } from '../../../src/sim/grid/GridPosition';
import { findReachableTiles } from '../../../src/sim/battle/MovementRange';
import { createTestUnit } from '../../mocks/unitMocks';

const OPEN_FIVE_BY_FIVE_MAP = parseBattleMapFromRows('open', 'Open Field', [
  '.....',
  '.....',
  '.....',
  '.....',
  '.....',
]);

describe('findReachableTiles', () => {
  it('reaches every tile within movement range on open ground', () => {
    const mover = createTestUnit({
      position: { column: 2, row: 2 },
      baseStatistics: { movementRange: 2 },
    });
    const reachable = findReachableTiles(mover, OPEN_FIVE_BY_FIVE_MAP, [mover]);
    // Manhattan distance ≤ 2 around the center, excluding the start tile: 12 tiles.
    expect(reachable).toHaveLength(12);
  });

  it('does not path through impassable terrain for ground units', () => {
    const corridorWithTree = parseBattleMapFromRows('corridor', 'Corridor', ['..t..']);
    const groundMover = createTestUnit({
      position: { column: 0, row: 0 },
      baseStatistics: { movementRange: 4 },
    });
    const reachable = findReachableTiles(groundMover, corridorWithTree, [groundMover]);
    expect(reachable.map(positionKey)).toEqual(['1,0']);
  });

  it('blocks steps taller than the unit jump height', () => {
    const mapWithCliff = parseBattleMapFromRows('cliff', 'Cliff', ['.R.']);
    const groundMover = createTestUnit({
      position: { column: 0, row: 0 },
      baseStatistics: { movementRange: 2, jumpHeight: 1 },
    });
    const reachable = findReachableTiles(groundMover, mapWithCliff, [groundMover]);
    expect(reachable.map(positionKey)).not.toContain('1,0');
  });

  it('lets flying units cross water, cliffs, and other units, but not stop on them', () => {
    const riverMap = parseBattleMapFromRows('river', 'River', ['..~..']);
    const flyer = createTestUnit({
      position: { column: 0, row: 0 },
      canFly: true,
      baseStatistics: { movementRange: 4 },
    });
    const blockingAlly = createTestUnit({ position: { column: 1, row: 0 } });
    const reachable = findReachableTiles(flyer, riverMap, [flyer, blockingAlly]);
    const reachableKeys = reachable.map(positionKey);
    expect(reachableKeys).toContain('3,0');
    expect(reachableKeys).toContain('4,0');
    expect(reachableKeys).not.toContain('1,0'); // occupied
    expect(reachableKeys).not.toContain('2,0'); // water: flyers pass over but cannot land
  });

  it('stops ground units from passing through occupied tiles', () => {
    const corridor = parseBattleMapFromRows('blocked', 'Blocked Corridor', ['.....']);
    const groundMover = createTestUnit({
      position: { column: 0, row: 0 },
      baseStatistics: { movementRange: 4 },
    });
    const blockingUnit = createTestUnit({ position: { column: 1, row: 0 } });
    const reachable = findReachableTiles(groundMover, corridor, [groundMover, blockingUnit]);
    expect(reachable).toHaveLength(0);
  });
});
