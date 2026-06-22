import type { ZoneDefinition, ZoneLocationNode, ZoneRoamingGroupDefinition } from './ZoneDefinition';

export interface ZoneRoamingGroupLocation {
  groupIdentifier: string;
  locationIdentifier: string;
}

export interface ZoneStepResult {
  /** Set when the player's new location coincides with an active roaming group. */
  collidedGroupIdentifier: string | undefined;
  enteredTavern: boolean;
}

/**
 * The authoritative state for "you are walking this zone's road network" —
 * player location, every roaming group's patrol progress, and which groups
 * have already been fought this visit. Mirrors Battle.ts's role for
 * exploration; the caller (ZoneController) is trusted to only pass
 * adjacent, road-connected locations (validated up front by
 * findShortestZoneRoute).
 */
export class ZoneSession {
  private readonly zone: ZoneDefinition;
  private playerLocationIdentifier: string;
  private readonly patrolIndexByGroupIdentifier = new Map<string, number>();
  private readonly defeatedGroupIdentifiers = new Set<string>();
  private readonly locationsByIdentifier = new Map<string, ZoneLocationNode>();

  constructor(zone: ZoneDefinition) {
    this.zone = zone;
    this.playerLocationIdentifier = zone.entryLocationIdentifier;
    for (const group of zone.roamingGroups) {
      this.patrolIndexByGroupIdentifier.set(group.identifier, 0);
    }
    for (const location of zone.locations) {
      this.locationsByIdentifier.set(location.identifier, location);
    }
  }

  getZone(): ZoneDefinition {
    return this.zone;
  }

  getPlayerLocationIdentifier(): string {
    return this.playerLocationIdentifier;
  }

  getActiveRoamingGroupLocations(): ZoneRoamingGroupLocation[] {
    return this.zone.roamingGroups
      .filter((group) => !this.defeatedGroupIdentifiers.has(group.identifier))
      .map((group) => ({ groupIdentifier: group.identifier, locationIdentifier: this.locationForGroup(group) }));
  }

  /** Removes a roaming group from the rest of this visit — call only on a won fight. */
  markGroupDefeated(groupIdentifier: string): void {
    this.defeatedGroupIdentifiers.add(groupIdentifier);
  }

  /**
   * Moves the player to `nextLocationIdentifier` (assumed to be one legal
   * road-hop from their current location) and advances every active
   * roaming group one patrol step in lockstep, then reports whether that
   * left the player sharing a location with a group or standing on the
   * tavern.
   */
  movePlayerTo(nextLocationIdentifier: string): ZoneStepResult {
    this.playerLocationIdentifier = nextLocationIdentifier;
    for (const group of this.zone.roamingGroups) {
      if (this.defeatedGroupIdentifiers.has(group.identifier)) {
        continue;
      }
      const currentIndex = this.patrolIndexByGroupIdentifier.get(group.identifier) ?? 0;
      this.patrolIndexByGroupIdentifier.set(group.identifier, (currentIndex + 1) % group.patrolRoute.length);
    }

    const collidedGroupIdentifier = this.getActiveRoamingGroupLocations().find(
      (entry) => entry.locationIdentifier === this.playerLocationIdentifier,
    )?.groupIdentifier;

    const arrivedLocation = this.locationsByIdentifier.get(this.playerLocationIdentifier);

    return {
      collidedGroupIdentifier,
      enteredTavern: arrivedLocation?.kind === 'tavern',
    };
  }

  private locationForGroup(group: ZoneRoamingGroupDefinition): string {
    const index = this.patrolIndexByGroupIdentifier.get(group.identifier) ?? 0;
    return group.patrolRoute[index] ?? group.patrolRoute[0] ?? this.zone.entryLocationIdentifier;
  }
}
