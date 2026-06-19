import { describe, expect, it } from 'vitest';
import { findShortestZonePath } from '../../../src/sim/grid/ZonePathfinding';

describe('findShortestZonePath', () => {
  it('finds the shortest path on an open grid', () => {
    const path = findShortestZonePath({ column: 0, row: 0 }, { column: 2, row: 1 }, 5, 5, []);
    expect(path).toBeDefined();
    expect(path).toHaveLength(3);
    expect(path?.[path.length - 1]).toEqual({ column: 2, row: 1 });
  });

  it('returns an empty path when the destination is the start', () => {
    const path = findShortestZonePath({ column: 1, row: 1 }, { column: 1, row: 1 }, 5, 5, []);
    expect(path).toEqual([]);
  });

  it('routes around obstacles', () => {
    const obstacles = [
      { column: 1, row: 0 },
      { column: 1, row: 1 },
      { column: 1, row: 2 },
    ];
    const path = findShortestZonePath({ column: 0, row: 1 }, { column: 2, row: 1 }, 5, 5, obstacles);
    expect(path).toBeDefined();
    for (const step of path ?? []) {
      expect(obstacles).not.toContainEqual(step);
    }
  });

  it('returns undefined when the destination is unreachable', () => {
    const wall = [
      { column: 1, row: 0 },
      { column: 1, row: 1 },
      { column: 1, row: 2 },
      { column: 1, row: 3 },
      { column: 1, row: 4 },
    ];
    const path = findShortestZonePath({ column: 0, row: 2 }, { column: 4, row: 2 }, 5, 5, wall);
    expect(path).toBeUndefined();
  });

  it('returns undefined for an out-of-bounds destination', () => {
    const path = findShortestZonePath({ column: 0, row: 0 }, { column: 9, row: 9 }, 5, 5, []);
    expect(path).toBeUndefined();
  });

  it('returns undefined when the destination tile is itself an obstacle', () => {
    const path = findShortestZonePath(
      { column: 0, row: 0 },
      { column: 2, row: 2 },
      5,
      5,
      [{ column: 2, row: 2 }],
    );
    expect(path).toBeUndefined();
  });
});
