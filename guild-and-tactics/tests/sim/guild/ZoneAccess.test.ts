import { describe, expect, it } from 'vitest';
import { ZONES } from '@/content/zones';
import { isZoneAccessibleAtTier, requiredReputationTierForZone } from '@/sim/guild/ZoneAccess';
import type { ZoneDefinition } from '@/sim/guild/ZoneDefinition';

function zoneRequiring(minimumReputationTier: ZoneDefinition['minimumReputationTier']): ZoneDefinition {
  return {
    identifier: 'test_zone',
    displayName: 'Test Zone',
    description: 'A zone for access tests.',
    entryLocationIdentifier: 'gate',
    locations: [{ identifier: 'gate', displayName: 'The Gate', kind: 'landmark', position: { x: 0, y: 0 } }],
    roads: [],
    roamingGroups: [],
    battleMapIdentifier: 'forest_clearing',
    monsterLevelRange: { minimumLevel: 1, maximumLevel: 2 },
    rewardGoldPerEncounter: 10,
    ...(minimumReputationTier === undefined ? {} : { minimumReputationTier }),
  };
}

describe('requiredReputationTierForZone', () => {
  it('defaults to bronze when a zone declares no requirement', () => {
    expect(requiredReputationTierForZone(zoneRequiring(undefined))).toBe('bronze');
  });

  it('returns the declared requirement', () => {
    expect(requiredReputationTierForZone(zoneRequiring('gold'))).toBe('gold');
  });
});

describe('isZoneAccessibleAtTier', () => {
  it('always admits guilds to zones without a requirement', () => {
    expect(isZoneAccessibleAtTier(zoneRequiring(undefined), 'bronze')).toBe(true);
  });

  it('turns back guilds below the required tier', () => {
    expect(isZoneAccessibleAtTier(zoneRequiring('silver'), 'bronze')).toBe(false);
    expect(isZoneAccessibleAtTier(zoneRequiring('gold'), 'silver')).toBe(false);
  });

  it('admits guilds at or above the required tier', () => {
    expect(isZoneAccessibleAtTier(zoneRequiring('silver'), 'silver')).toBe(true);
    expect(isZoneAccessibleAtTier(zoneRequiring('silver'), 'platinum')).toBe(true);
  });
});

describe('zone access content validity', () => {
  it('offers a fresh (bronze) guild at least one accessible zone', () => {
    const bronzeAccessibleZones = Object.values(ZONES).filter((zone) =>
      isZoneAccessibleAtTier(zone, 'bronze'),
    );
    expect(bronzeAccessibleZones.length).toBeGreaterThan(0);
  });

  it('keeps a level-1-friendly zone accessible to a fresh guild', () => {
    const gentlestAccessibleLevel = Math.min(
      ...Object.values(ZONES)
        .filter((zone) => isZoneAccessibleAtTier(zone, 'bronze'))
        .map((zone) => zone.monsterLevelRange.minimumLevel),
    );
    expect(gentlestAccessibleLevel).toBe(1);
  });

  it('never locks a zone behind a harder tier than its levels suggest are needed', () => {
    // Every gated zone must be strictly harder than the gentlest open zone —
    // a lock on low-level content would only frustrate, not pace.
    for (const zone of Object.values(ZONES)) {
      if (requiredReputationTierForZone(zone) !== 'bronze') {
        expect(zone.monsterLevelRange.minimumLevel).toBeGreaterThan(1);
      }
    }
  });
});
