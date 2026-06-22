import type { ZoneRoad } from '../guild/ZoneDefinition';

/** Builds an undirected adjacency map (location identifier -> its directly connected neighbors) from a zone's roads. */
export function buildZoneRoadAdjacency(roads: readonly ZoneRoad[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const road of roads) {
    addAdjacency(adjacency, road.fromLocationIdentifier, road.toLocationIdentifier);
    addAdjacency(adjacency, road.toLocationIdentifier, road.fromLocationIdentifier);
  }
  return adjacency;
}

function addAdjacency(adjacency: Map<string, string[]>, from: string, to: string): void {
  const neighbors = adjacency.get(from);
  if (neighbors === undefined) {
    adjacency.set(from, [to]);
    return;
  }
  neighbors.push(to);
}

/**
 * Plain BFS over a zone's road network — deliberately simpler than
 * MovementRange.ts (battle-specific height/jump/flight rules) or the
 * tile-grid BFS this replaces. Returns the location-identifier list from
 * (excluding) `from` to (including) `to`, or undefined if `to` is not
 * reachable from `from` via the road network.
 */
export function findShortestZoneRoute(
  fromLocationIdentifier: string,
  toLocationIdentifier: string,
  roads: readonly ZoneRoad[],
): string[] | undefined {
  if (fromLocationIdentifier === toLocationIdentifier) {
    return [];
  }

  const adjacency = buildZoneRoadAdjacency(roads);
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>([fromLocationIdentifier]);
  const queue: string[] = [fromLocationIdentifier];

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (current === undefined) continue;
    if (current === toLocationIdentifier) {
      return reconstructRoute(cameFrom, fromLocationIdentifier, toLocationIdentifier);
    }
    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      cameFrom.set(neighbor, current);
      queue.push(neighbor);
    }
  }
  return undefined;
}

function reconstructRoute(cameFrom: Map<string, string>, from: string, to: string): string[] {
  const route: string[] = [];
  let current = to;
  while (current !== from) {
    route.push(current);
    const previous = cameFrom.get(current);
    if (previous === undefined) break;
    current = previous;
  }
  return route.reverse();
}
