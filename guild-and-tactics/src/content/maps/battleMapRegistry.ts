import type { BattleMap } from '../../sim/grid/BattleMap';
import type { GridPosition } from '../../sim/grid/GridPosition';
import { FOREST_CLEARING_MAP } from './forestClearing';
import { MARSH_ROAD_MAP } from './marshRoad';
import { OLD_QUARRY_MAP } from './oldQuarry';

export interface BattleMapEntry {
  map: BattleMap;
  /** Where deployed party members stand at battle start (south side). */
  deploymentTiles: GridPosition[];
}

export const BATTLE_MAPS: Record<string, BattleMapEntry> = {
  forest_clearing: {
    map: FOREST_CLEARING_MAP,
    deploymentTiles: [
      { column: 3, row: 9 },
      { column: 4, row: 10 },
      { column: 5, row: 10 },
      { column: 6, row: 9 },
      { column: 7, row: 10 },
      { column: 6, row: 10 },
    ],
  },
  marsh_road: {
    map: MARSH_ROAD_MAP,
    deploymentTiles: [
      { column: 3, row: 10 },
      { column: 4, row: 10 },
      { column: 5, row: 10 },
      { column: 6, row: 10 },
      { column: 7, row: 10 },
      { column: 8, row: 10 },
    ],
  },
  old_quarry: {
    map: OLD_QUARRY_MAP,
    deploymentTiles: [
      { column: 5, row: 10 },
      { column: 6, row: 10 },
      { column: 7, row: 10 },
      { column: 8, row: 10 },
      { column: 6, row: 9 },
      { column: 7, row: 9 },
    ],
  },
};
