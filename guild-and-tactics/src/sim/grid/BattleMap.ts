import type { GridPosition } from './GridPosition';

export type TerrainKind = 'grass' | 'path' | 'rock' | 'water' | 'tree';

export interface BattleTile {
  terrain: TerrainKind;
  /** Elevation in height levels; walking up/down more than a unit's jump height blocks the step. */
  heightLevel: number;
  /** Ground units cannot enter impassable tiles; flying units pass over but cannot stop on them. */
  isImpassable: boolean;
}

export interface BattleMap {
  identifier: string;
  displayName: string;
  widthInTiles: number;
  heightInTiles: number;
  tiles: BattleTile[][];
}

interface TerrainLegendEntry {
  terrain: TerrainKind;
  heightLevel: number;
  isImpassable: boolean;
}

/**
 * Legend for the human-readable map rows used in content files:
 *   .  grass        ,  path
 *   r  rock +1      R  rock +2
 *   t  tree (impassable)
 *   ~  water (impassable for ground units; flyers pass over)
 */
const MAP_CHARACTER_LEGEND: Record<string, TerrainLegendEntry> = {
  '.': { terrain: 'grass', heightLevel: 0, isImpassable: false },
  ',': { terrain: 'path', heightLevel: 0, isImpassable: false },
  r: { terrain: 'rock', heightLevel: 1, isImpassable: false },
  R: { terrain: 'rock', heightLevel: 2, isImpassable: false },
  t: { terrain: 'tree', heightLevel: 0, isImpassable: true },
  '~': { terrain: 'water', heightLevel: 0, isImpassable: true },
};

export function parseBattleMapFromRows(
  identifier: string,
  displayName: string,
  mapRows: readonly string[],
): BattleMap {
  const tiles: BattleTile[][] = mapRows.map((mapRow, rowIndex) =>
    [...mapRow].map((character, columnIndex) => {
      const legendEntry = MAP_CHARACTER_LEGEND[character];
      if (legendEntry === undefined) {
        throw new Error(
          `Unknown map character "${character}" at column ${columnIndex}, row ${rowIndex} of map "${identifier}"`,
        );
      }
      return { ...legendEntry };
    }),
  );
  const firstRow = mapRows[0];
  if (firstRow === undefined) {
    throw new Error(`Map "${identifier}" has no rows`);
  }
  return {
    identifier,
    displayName,
    widthInTiles: firstRow.length,
    heightInTiles: mapRows.length,
    tiles,
  };
}

export function isPositionInsideMap(map: BattleMap, position: GridPosition): boolean {
  return (
    position.column >= 0 &&
    position.column < map.widthInTiles &&
    position.row >= 0 &&
    position.row < map.heightInTiles
  );
}

export function tileAt(map: BattleMap, position: GridPosition): BattleTile {
  const tileRow = map.tiles[position.row];
  const tile = tileRow?.[position.column];
  if (tile === undefined) {
    throw new Error(`Position ${position.column},${position.row} is outside map "${map.identifier}"`);
  }
  return tile;
}
