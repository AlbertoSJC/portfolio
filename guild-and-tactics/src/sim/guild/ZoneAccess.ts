import { meetsReputationRequirement, type ReputationTier } from './ReputationTier';
import type { ZoneDefinition } from './ZoneDefinition';

/** A zone without an explicit requirement is open to any guild. */
export function requiredReputationTierForZone(zone: ZoneDefinition): ReputationTier {
  return zone.minimumReputationTier ?? 'bronze';
}

/**
 * Whether a guild of the given tier may enter the zone (PRD §6). Locked
 * zones are not hidden — the World Map shows them, and attempting entry is
 * turned back diegetically by the roadwatch dialogue.
 */
export function isZoneAccessibleAtTier(zone: ZoneDefinition, currentTier: ReputationTier): boolean {
  return meetsReputationRequirement(currentTier, requiredReputationTierForZone(zone));
}
