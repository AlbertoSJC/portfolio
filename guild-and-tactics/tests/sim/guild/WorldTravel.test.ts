import { describe, expect, it } from 'vitest';
import { ZONES } from '../../../src/content/zones';
import { STARTING_ZONE_IDENTIFIER, WORLD_ROADS } from '../../../src/content/zones/worldMap';
import { REPUTATION_TIER_LABELS, type ReputationTier } from '../../../src/sim/guild/ReputationTier';
import { findWorldTravelRoute, type WorldRoad } from '../../../src/sim/guild/WorldTravel';
import { isZoneAccessibleAtTier } from '../../../src/sim/guild/ZoneAccess';

const TEST_ROADS: WorldRoad[] = [
  { fromZoneIdentifier: 'west', toZoneIdentifier: 'center' },
  { fromZoneIdentifier: 'center', toZoneIdentifier: 'east' },
  { fromZoneIdentifier: 'center', toZoneIdentifier: 'locked_branch' },
  { fromZoneIdentifier: 'west', toZoneIdentifier: 'far_shore_via_locked' },
  { fromZoneIdentifier: 'far_shore_via_locked', toZoneIdentifier: 'island' },
];

const everyZonePassable = () => true;

describe('findWorldTravelRoute', () => {
  it('returns an empty route when already at the destination', () => {
    expect(findWorldTravelRoute('west', 'west', TEST_ROADS, everyZonePassable)).toEqual([]);
  });

  it('walks roads zone by zone instead of jumping', () => {
    expect(findWorldTravelRoute('west', 'east', TEST_ROADS, everyZonePassable)).toEqual(['center', 'east']);
  });

  it('never routes through an impassable zone', () => {
    const passableExceptFarShore = (zoneIdentifier: string) => zoneIdentifier !== 'far_shore_via_locked';
    expect(findWorldTravelRoute('west', 'island', TEST_ROADS, passableExceptFarShore)).toBeUndefined();
  });

  it('returns undefined for zones with no connecting road', () => {
    expect(findWorldTravelRoute('west', 'nowhere', TEST_ROADS, everyZonePassable)).toBeUndefined();
  });
});

describe('world map content validity', () => {
  it('only connects real zones', () => {
    for (const road of WORLD_ROADS) {
      expect(ZONES[road.fromZoneIdentifier], road.fromZoneIdentifier).toBeDefined();
      expect(ZONES[road.toZoneIdentifier], road.toZoneIdentifier).toBeDefined();
    }
  });

  it('starts new guilds in a zone open to bronze', () => {
    const startingZone = ZONES[STARTING_ZONE_IDENTIFIER];
    expect(startingZone).toBeDefined();
    expect(startingZone !== undefined && isZoneAccessibleAtTier(startingZone, 'bronze')).toBe(true);
  });

  // The layout rule locked zones must obey: they hang off the open network
  // as branches, never as corridors. If a locked zone were the only way
  // through to open content, a fresh guild would be walled off from zones
  // it is entitled to enter.
  it('keeps every zone reachable from the start at its own unlock tier, crossing only unlocked zones', () => {
    const tiers: ReputationTier[] = ['bronze', 'silver', 'gold', 'platinum'];
    for (const tier of tiers) {
      const isPassableAtTier = (zoneIdentifier: string) => {
        const zone = ZONES[zoneIdentifier];
        return zone !== undefined && isZoneAccessibleAtTier(zone, tier);
      };
      for (const zone of Object.values(ZONES)) {
        if (!isZoneAccessibleAtTier(zone, tier)) continue;
        const route = findWorldTravelRoute(STARTING_ZONE_IDENTIFIER, zone.identifier, WORLD_ROADS, isPassableAtTier);
        expect(
          route,
          `${zone.displayName} must be reachable at ${REPUTATION_TIER_LABELS[tier]} without crossing locked zones`,
        ).toBeDefined();
      }
    }
  });
});
