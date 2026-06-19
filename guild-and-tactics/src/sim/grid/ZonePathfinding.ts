import type { GridPosition } from './GridPosition';
import { positionKey } from './GridPosition';

const STEP_OFFSETS: readonly GridPosition[] = [
  { column: 0, row: -1 },
  { column: 0, row: 1 },
  { column: -1, row: 0 },
  { column: 1, row: 0 },
];

export function isWithinBounds(position: GridPosition, gridWidth: number, gridHeight: number): boolean {
  return (
    position.column >= 0 &&
    position.column < gridWidth &&
    position.row >= 0 &&
    position.row < gridHeight
  );
}

/**
 * Plain 4-directional BFS over a zone's exploration grid — deliberately
 * simpler than MovementRange.ts, which handles the battle grid's
 * height/jump/flight rules. Returns the step list from (excluding) `from`
 * to (including) `to`, or undefined if `to` is out of bounds, blocked, or
 * unreachable.
 */
export function findShortestZonePath(
  from: GridPosition,
  to: GridPosition,
  gridWidth: number,
  gridHeight: number,
  obstacleTiles: readonly GridPosition[],
): GridPosition[] | undefined {
  const obstacleKeys = new Set(obstacleTiles.map(positionKey));
  if (!isWithinBounds(to, gridWidth, gridHeight) || obstacleKeys.has(positionKey(to))) {
    return undefined;
  }

  const cameFrom = new Map<string, GridPosition>();
  const visited = new Set<string>([positionKey(from)]);
  const queue: GridPosition[] = [from];

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (current === undefined) continue;
    if (positionKey(current) === positionKey(to)) {
      return reconstructPath(cameFrom, from, to);
    }
    for (const offset of STEP_OFFSETS) {
      const next: GridPosition = { column: current.column + offset.column, row: current.row + offset.row };
      const nextKey = positionKey(next);
      if (visited.has(nextKey) || obstacleKeys.has(nextKey) || !isWithinBounds(next, gridWidth, gridHeight)) {
        continue;
      }
      visited.add(nextKey);
      cameFrom.set(nextKey, current);
      queue.push(next);
    }
  }
  return undefined;
}

function reconstructPath(
  cameFrom: Map<string, GridPosition>,
  from: GridPosition,
  to: GridPosition,
): GridPosition[] {
  const path: GridPosition[] = [];
  let current = to;
  while (positionKey(current) !== positionKey(from)) {
    path.push(current);
    const previous = cameFrom.get(positionKey(current));
    if (previous === undefined) break;
    current = previous;
  }
  return path.reverse();
}
