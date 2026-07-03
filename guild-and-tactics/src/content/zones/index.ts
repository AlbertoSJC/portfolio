import type { ZoneDefinition } from '../../sim/guild/ZoneDefinition';
import { BREIRWOOD_ZONE } from './breirwood';
import { CROSSPATHS_FIELD_ZONE } from './crosspathsField';
import { MARSH_TRAIL_ZONE } from './marshTrail';
import { NORTH_ROAD_ZONE } from './northRoad';
import { QUARRY_PATH_ZONE } from './quarryPath';
import { SLUMBER_MEADOW_ZONE } from './slumberMeadow';
import { THORNS_PLAIN_ZONE } from './thornsPlain';

/**
 * Zones reachable from the world map (M4, PRD §6.0/§6.1), one file per
 * zone. All names and creature rosters follow LORE.md's "The lay of the
 * land" (canon 2026-07-03).
 *
 * ORDER MATTERS for presentation: the world map draws a road between
 * consecutive entries, so zones are listed as a winding north → heartland
 * → south → east tour that matches their `worldMapPosition`s without the
 * road crossing itself. Slot new zones into the tour, don't append.
 */
const ZONE_ENTRIES = {
  breirwood: BREIRWOOD_ZONE,
  north_road: NORTH_ROAD_ZONE,
  slumber_meadow: SLUMBER_MEADOW_ZONE,
  thorns_plain: THORNS_PLAIN_ZONE,
  crosspaths_field: CROSSPATHS_FIELD_ZONE,
  quarry_path: QUARRY_PATH_ZONE,
  marsh_trail: MARSH_TRAIL_ZONE,
} satisfies Record<string, ZoneDefinition>;

/** Every valid zone identifier — quests and dispatches reference zones through this type. */
export type ZoneIdentifier = keyof typeof ZONE_ENTRIES;

export const ZONES: Record<string, ZoneDefinition> = ZONE_ENTRIES;
