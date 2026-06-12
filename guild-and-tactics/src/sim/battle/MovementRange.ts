import type { BattleMap } from '../grid/BattleMap';
import { isPositionInsideMap, tileAt } from '../grid/BattleMap';
import type { GridPosition } from '../grid/GridPosition';
import { ALL_CARDINAL_DIRECTIONS, positionKey, stepInDirection } from '../grid/GridPosition';
import type { Unit } from '../units/Unit';
import { isKnockedOut } from '../units/Unit';

/**
 * Breadth-first search of every tile the unit can end its move on.
 *
 * Rules:
 * - each step costs 1 movement point, up to the unit's movement range;
 * - ground units cannot enter impassable tiles, and a step whose height
 *   difference exceeds their jump height is blocked;
 * - flying units (Feryans) ignore impassable tiles and height while moving;
 * - tiles occupied by standing units block passage for ground units
 *   (flyers pass over) and nobody may stop on an occupied tile.
 */
export function findReachableTiles(
  movingUnit: Unit,
  map: BattleMap,
  allUnits: readonly Unit[],
): GridPosition[] {
  const occupiedTileKeys = new Set(
    allUnits
      .filter((unit) => !isKnockedOut(unit) && unit.identifier !== movingUnit.identifier)
      .map((unit) => positionKey(unit.position)),
  );

  const startingPosition = movingUnit.position;
  const visitedCostByTileKey = new Map<string, number>([[positionKey(startingPosition), 0]]);
  const reachableTiles: GridPosition[] = [];
  const searchQueue: { position: GridPosition; costSoFar: number }[] = [
    { position: startingPosition, costSoFar: 0 },
  ];

  while (searchQueue.length > 0) {
    const current = searchQueue.shift();
    if (current === undefined) {
      break;
    }
    if (current.costSoFar >= movingUnit.baseStatistics.movementRange) {
      continue;
    }
    for (const direction of ALL_CARDINAL_DIRECTIONS) {
      const nextPosition = stepInDirection(current.position, direction);
      if (!isPositionInsideMap(map, nextPosition)) {
        continue;
      }
      const nextKey = positionKey(nextPosition);
      const nextCost = current.costSoFar + 1;
      const previousCost = visitedCostByTileKey.get(nextKey);
      if (previousCost !== undefined && previousCost <= nextCost) {
        continue;
      }

      const currentTile = tileAt(map, current.position);
      const nextTile = tileAt(map, nextPosition);
      if (!movingUnit.canFly) {
        if (nextTile.isImpassable) {
          continue;
        }
        const heightDifference = Math.abs(nextTile.heightLevel - currentTile.heightLevel);
        if (heightDifference > movingUnit.baseStatistics.jumpHeight) {
          continue;
        }
        if (occupiedTileKeys.has(nextKey)) {
          continue; // ground units cannot pass through other units
        }
      }

      visitedCostByTileKey.set(nextKey, nextCost);
      searchQueue.push({ position: nextPosition, costSoFar: nextCost });

      const canStopHere = !occupiedTileKeys.has(nextKey) && !nextTile.isImpassable;
      if (canStopHere) {
        reachableTiles.push(nextPosition);
      }
    }
  }

  return reachableTiles;
}
