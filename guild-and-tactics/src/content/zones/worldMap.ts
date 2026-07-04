import type { WorldRoad } from '../../sim/guild/WorldTravel';
import type { ZoneIdentifier } from './index';

/** A world road as authored in content: both endpoints are compile-checked zone identifiers. */
interface WorldRoadContentEntry extends WorldRoad {
  fromZoneIdentifier: ZoneIdentifier;
  toZoneIdentifier: ZoneIdentifier;
}

/** Where a fresh guild charter stands on the World Map — the gentlest zone in the game. */
export const STARTING_ZONE_IDENTIFIER: ZoneIdentifier = 'slumber_meadow';

/**
 * The World Map's road network (PRD §6.0): the guild travels zone to zone
 * along these, FFTA2-style — it cannot jump to an arbitrary node.
 *
 * Layout rule (enforced by WorldTravel.test.ts's per-tier reachability
 * sweep): the bronze zones form the connected core, and every
 * reputation-locked zone hangs off it as a branch — never a corridor the
 * player must cross to reach open content. Per the LORE.md compass: the
 * North Road is the lone road up into the Breirwood (gold), the Quarry
 * Path (silver) sits off the heartland's eastern hills, and Thorns Plain
 * (silver) guards the south.
 */
export const WORLD_ROADS = [
  { fromZoneIdentifier: 'slumber_meadow', toZoneIdentifier: 'north_road' },
  { fromZoneIdentifier: 'slumber_meadow', toZoneIdentifier: 'crosspaths_field' },
  { fromZoneIdentifier: 'north_road', toZoneIdentifier: 'crosspaths_field' },
  { fromZoneIdentifier: 'north_road', toZoneIdentifier: 'breirwood' },
  { fromZoneIdentifier: 'crosspaths_field', toZoneIdentifier: 'marsh_trail' },
  { fromZoneIdentifier: 'crosspaths_field', toZoneIdentifier: 'quarry_path' },
  { fromZoneIdentifier: 'marsh_trail', toZoneIdentifier: 'quarry_path' },
  { fromZoneIdentifier: 'crosspaths_field', toZoneIdentifier: 'thorns_plain' },
  { fromZoneIdentifier: 'slumber_meadow', toZoneIdentifier: 'thorns_plain' },
] satisfies WorldRoadContentEntry[];
