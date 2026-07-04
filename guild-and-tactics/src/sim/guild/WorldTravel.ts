/** An undirected road connecting two zones on the World Map. */
export interface WorldRoad {
  fromZoneIdentifier: string;
  toZoneIdentifier: string;
}

/** Undirected adjacency (zone identifier -> directly connected zones) from the World Map's roads. */
export function buildWorldRoadAdjacency(roads: readonly WorldRoad[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const road of roads) {
    addAdjacency(adjacency, road.fromZoneIdentifier, road.toZoneIdentifier);
    addAdjacency(adjacency, road.toZoneIdentifier, road.fromZoneIdentifier);
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
 * BFS over the World Map's road network (PRD §6.0): the guild stands at one
 * zone and travels along roads, FFTA2-style — it cannot jump to an
 * arbitrary node. `isZonePassable` keeps the route out of zones the guild
 * may not enter (reputation-locked ones): a locked zone can never be
 * crossed on the way to somewhere else. Returns the zone-identifier list
 * from (excluding) `from` to (including) `to`, or undefined when no
 * passable road connects them.
 */
export function findWorldTravelRoute(
  fromZoneIdentifier: string,
  toZoneIdentifier: string,
  roads: readonly WorldRoad[],
  isZonePassable: (zoneIdentifier: string) => boolean,
): string[] | undefined {
  if (fromZoneIdentifier === toZoneIdentifier) {
    return [];
  }

  const adjacency = buildWorldRoadAdjacency(roads);
  const cameFrom = new Map<string, string>();
  const visited = new Set<string>([fromZoneIdentifier]);
  const queue: string[] = [fromZoneIdentifier];

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (current === undefined) continue;
    if (current === toZoneIdentifier) {
      return reconstructRoute(cameFrom, fromZoneIdentifier, toZoneIdentifier);
    }
    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor) || !isZonePassable(neighbor)) continue;
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
