import type { GridPosition } from '../grid/GridPosition';

/**
 * A roaming enemy party patrolling a zone's exploration grid. It steps
 * along `patrolRoute` one tile per player step (see ZoneSession) — walking
 * into it (or it into you) starts a battle generated from its pool.
 */
export interface ZoneRoamingGroupDefinition {
  identifier: string;
  /** Tiles visited in order on the exploration grid; loops back to index 0. */
  patrolRoute: GridPosition[];
  monsterIdentifiers: string[];
  minimumEnemyCount: number;
  maximumEnemyCount: number;
}

/**
 * A zone reachable from the world map (PRD §6.0/§6.1): a small walkable
 * grid (FFTA1-style) with a tavern and roaming monster groups you can see
 * and choose to avoid. Battles triggered here play out on a separate
 * tactical battle map — `battleMapIdentifier`/`encounterSpawnTiles` refer
 * to that map's coordinate space, never the exploration grid's.
 */
export interface ZoneDefinition {
  identifier: string;
  displayName: string;
  description: string;

  // ── Exploration grid (the walkable mini-map) ──────────────────────────
  explorationGridWidth: number;
  explorationGridHeight: number;
  obstacleTiles: GridPosition[];
  entryTile: GridPosition;
  tavernTile: GridPosition;
  roamingGroups: ZoneRoamingGroupDefinition[];

  // ── Battle assembly (the tactical grid a collision/quest plays on) ────
  battleMapIdentifier: string;
  /** Pre-validated standable tiles enemies may spawn on for a roaming-group fight. */
  encounterSpawnTiles: GridPosition[];
  rewardGoldPerEncounter: number;
}
