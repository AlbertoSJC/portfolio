import { describe, expect, it } from 'vitest';
import { findShortestZoneRoute } from '../../../src/sim/graph/ZoneRoadGraph';
import type { ZoneRoad } from '../../../src/sim/guild/ZoneDefinition';

const LINEAR_ROADS: ZoneRoad[] = [
  { fromLocationIdentifier: 'a', toLocationIdentifier: 'b' },
  { fromLocationIdentifier: 'b', toLocationIdentifier: 'c' },
  { fromLocationIdentifier: 'c', toLocationIdentifier: 'd' },
];

const DIAMOND_ROADS: ZoneRoad[] = [
  { fromLocationIdentifier: 'entry', toLocationIdentifier: 'left' },
  { fromLocationIdentifier: 'entry', toLocationIdentifier: 'right' },
  { fromLocationIdentifier: 'left', toLocationIdentifier: 'far_left' },
  { fromLocationIdentifier: 'far_left', toLocationIdentifier: 'tavern' },
  { fromLocationIdentifier: 'right', toLocationIdentifier: 'tavern' },
];

describe('findShortestZoneRoute', () => {
  it('finds the shortest route on a small road network', () => {
    const route = findShortestZoneRoute('a', 'd', LINEAR_ROADS);
    expect(route).toEqual(['b', 'c', 'd']);
  });

  it('returns an empty route when the destination is the start', () => {
    const route = findShortestZoneRoute('b', 'b', LINEAR_ROADS);
    expect(route).toEqual([]);
  });

  it('picks the shorter of two paths through a branching road network', () => {
    const route = findShortestZoneRoute('entry', 'tavern', DIAMOND_ROADS);
    expect(route).toEqual(['right', 'tavern']);
  });

  it('returns undefined when the destination is unreachable', () => {
    const disconnectedRoads: ZoneRoad[] = [
      ...LINEAR_ROADS,
      { fromLocationIdentifier: 'isolated_one', toLocationIdentifier: 'isolated_two' },
    ];
    const route = findShortestZoneRoute('a', 'isolated_two', disconnectedRoads);
    expect(route).toBeUndefined();
  });

  it('returns undefined for a destination identifier not present in any road', () => {
    const route = findShortestZoneRoute('a', 'nowhere', LINEAR_ROADS);
    expect(route).toBeUndefined();
  });
});
