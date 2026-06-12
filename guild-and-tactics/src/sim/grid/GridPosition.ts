export interface GridPosition {
  column: number;
  row: number;
}

export type CardinalDirection = 'north' | 'east' | 'south' | 'west';

export const ALL_CARDINAL_DIRECTIONS: readonly CardinalDirection[] = [
  'north',
  'east',
  'south',
  'west',
];

const DIRECTION_OFFSETS: Record<CardinalDirection, GridPosition> = {
  north: { column: 0, row: -1 },
  east: { column: 1, row: 0 },
  south: { column: 0, row: 1 },
  west: { column: -1, row: 0 },
};

export function arePositionsEqual(first: GridPosition, second: GridPosition): boolean {
  return first.column === second.column && first.row === second.row;
}

export function manhattanDistance(from: GridPosition, to: GridPosition): number {
  return Math.abs(from.column - to.column) + Math.abs(from.row - to.row);
}

export function stepInDirection(from: GridPosition, direction: CardinalDirection): GridPosition {
  const offset = DIRECTION_OFFSETS[direction];
  return { column: from.column + offset.column, row: from.row + offset.row };
}

export function oppositeDirection(direction: CardinalDirection): CardinalDirection {
  const opposites: Record<CardinalDirection, CardinalDirection> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
  };
  return opposites[direction];
}

/**
 * The dominant cardinal direction pointing from one tile toward another.
 * Ties between the two axes resolve to the horizontal direction.
 */
export function directionFromTo(from: GridPosition, to: GridPosition): CardinalDirection {
  const columnDelta = to.column - from.column;
  const rowDelta = to.row - from.row;
  if (Math.abs(columnDelta) >= Math.abs(rowDelta)) {
    return columnDelta >= 0 ? 'east' : 'west';
  }
  return rowDelta >= 0 ? 'south' : 'north';
}

export function positionKey(position: GridPosition): string {
  return `${position.column},${position.row}`;
}
