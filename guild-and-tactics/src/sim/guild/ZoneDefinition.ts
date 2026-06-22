import type { GridPosition } from '../grid/GridPosition';

export type ZoneLocationKind = 'tavern' | 'landmark';

/**
 * A point on a zone's road map. `position` is a normalized (0..1, 0..1)
 * layout hint for rendering only — it has no bearing on pathing or
 * reachability, which is purely a function of `ZoneDefinition.roads`.
 */
export interface ZoneLocationNode {
  identifier: string;
  displayName: string;
  kind: ZoneLocationKind;
  position: { x: number; y: number };
}

/** An undirected road connecting two of a zone's locations. */
export interface ZoneRoad {
  fromLocationIdentifier: string;
  toLocationIdentifier: string;
}

/**
 * A roaming enemy party patrolling a zone's road network. It steps to the
 * next location in `patrolRoute` one stop per player move (see
 * ZoneSession) — walking into it (or it into you) starts a battle
 * generated from its pool. Needs at least two distinct stops to actually
 * roam.
 */
export interface ZoneRoamingGroupDefinition {
  identifier: string;
  /** Location identifiers visited in order; loops back to index 0. */
  patrolRoute: string[];
  monsterIdentifiers: string[];
  minimumEnemyCount: number;
  maximumEnemyCount: number;
}

/**
 * A zone reachable from the world map (PRD §6.0/§6.1): a small named-
 * location road network (FFTA1-style) with a tavern and roaming monster
 * groups you can see and choose to avoid. Battles triggered here play out
 * on a separate tactical battle map — `battleMapIdentifier`/
 * `encounterSpawnTiles` refer to that map's own coordinate space, never
 * the road network above.
 */
export interface ZoneDefinition {
  identifier: string;
  displayName: string;
  description: string;

  // ── Exploration (the walkable road network) ───────────────────────────
  entryLocationIdentifier: string;
  locations: ZoneLocationNode[];
  roads: ZoneRoad[];
  roamingGroups: ZoneRoamingGroupDefinition[];

  // ── Battle assembly (the tactical grid a collision/quest plays on) ────
  battleMapIdentifier: string;
  /** Pre-validated standable tiles enemies may spawn on for a roaming-group fight. */
  encounterSpawnTiles: GridPosition[];
  rewardGoldPerEncounter: number;
}
