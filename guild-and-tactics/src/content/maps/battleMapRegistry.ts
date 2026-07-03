import type { BattleMap } from '../../sim/grid/BattleMap';
import type { GridPosition } from '../../sim/grid/GridPosition';
import { BREIRWOOD_DEEP_MAP } from './breirwoodDeep';
import { CROSSPATHS_FIELD_MAP } from './crosspathsField';
import { FOREST_CLEARING_MAP } from './forestClearing';
import { MARSH_ROAD_MAP } from './marshRoad';
import { OLD_QUARRY_MAP } from './oldQuarry';
import { SLUMBER_MEADOW_MAP } from './slumberMeadow';
import { THORN_FLATS_MAP } from './thornFlats';

export interface BattleMapEntry {
  map: BattleMap;
  /** Where deployed party members stand at battle start (south side). */
  deploymentTiles: GridPosition[];
  /**
   * Standable tiles roaming-encounter enemies may spawn on (north side).
   * Map-space data like `deploymentTiles`, so every zone that plays its
   * fights on this map shares them — new zones need no spawn authoring.
   */
  encounterSpawnTiles: GridPosition[];
}

const BATTLE_MAP_ENTRIES = {
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
    encounterSpawnTiles: [
      { column: 2, row: 1 },
      { column: 5, row: 0 },
      { column: 9, row: 1 },
      { column: 4, row: 2 },
      { column: 6, row: 1 },
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
    encounterSpawnTiles: [
      { column: 3, row: 2 },
      { column: 8, row: 2 },
      { column: 4, row: 1 },
      { column: 8, row: 1 },
      { column: 6, row: 2 },
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
    encounterSpawnTiles: [
      { column: 6, row: 2 },
      { column: 8, row: 2 },
      { column: 3, row: 1 },
      { column: 10, row: 2 },
      { column: 4, row: 2 },
    ],
  },
  slumber_meadow: {
    map: SLUMBER_MEADOW_MAP,
    deploymentTiles: [
      { column: 3, row: 9 },
      { column: 4, row: 10 },
      { column: 5, row: 10 },
      { column: 6, row: 9 },
      { column: 7, row: 10 },
      { column: 6, row: 10 },
    ],
    encounterSpawnTiles: [
      { column: 2, row: 1 },
      { column: 5, row: 0 },
      { column: 9, row: 1 },
      { column: 4, row: 2 },
      { column: 6, row: 1 },
    ],
  },
  crosspaths_field: {
    map: CROSSPATHS_FIELD_MAP,
    deploymentTiles: [
      { column: 3, row: 10 },
      { column: 4, row: 10 },
      { column: 5, row: 10 },
      { column: 6, row: 10 },
      { column: 7, row: 10 },
      { column: 5, row: 9 },
    ],
    encounterSpawnTiles: [
      { column: 2, row: 1 },
      { column: 4, row: 1 },
      { column: 6, row: 1 },
      { column: 5, row: 2 },
      { column: 8, row: 2 },
    ],
  },
  thorn_flats: {
    map: THORN_FLATS_MAP,
    deploymentTiles: [
      { column: 3, row: 9 },
      { column: 4, row: 10 },
      { column: 5, row: 10 },
      { column: 6, row: 9 },
      { column: 7, row: 10 },
      { column: 8, row: 9 },
    ],
    encounterSpawnTiles: [
      { column: 3, row: 0 },
      { column: 5, row: 1 },
      { column: 2, row: 2 },
      { column: 7, row: 2 },
      { column: 9, row: 2 },
    ],
  },
  breirwood_deep: {
    map: BREIRWOOD_DEEP_MAP,
    deploymentTiles: [
      { column: 4, row: 9 },
      { column: 5, row: 9 },
      { column: 6, row: 9 },
      { column: 5, row: 10 },
      { column: 7, row: 10 },
      { column: 8, row: 10 },
    ],
    encounterSpawnTiles: [
      { column: 1, row: 1 },
      { column: 5, row: 1 },
      { column: 8, row: 1 },
      { column: 6, row: 2 },
      { column: 3, row: 3 },
    ],
  },
} satisfies Record<string, BattleMapEntry>;

/** Every valid battle map identifier — zones and quests reference maps through this type. */
export type BattleMapIdentifier = keyof typeof BATTLE_MAP_ENTRIES;

export const BATTLE_MAPS: Record<string, BattleMapEntry> = BATTLE_MAP_ENTRIES;
