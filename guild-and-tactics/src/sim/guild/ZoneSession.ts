import { arePositionsEqual, type GridPosition } from '../grid/GridPosition';
import type { ZoneDefinition, ZoneRoamingGroupDefinition } from './ZoneDefinition';

export interface ZoneRoamingGroupPosition {
  groupIdentifier: string;
  position: GridPosition;
}

export interface ZoneStepResult {
  /** Set when the player's new tile coincides with an active roaming group. */
  collidedGroupIdentifier: string | undefined;
  enteredTavern: boolean;
}

/**
 * The authoritative state for "you are walking around this zone" — player
 * position, every roaming group's patrol progress, and which groups have
 * already been fought this visit. Mirrors Battle.ts's role for the
 * exploration grid: pure state, no DOM; the caller (ZoneController) is
 * trusted to only pass adjacent, in-bounds steps (validated up front by
 * ZonePathfinding).
 */
export class ZoneSession {
  private readonly zone: ZoneDefinition;
  private playerPosition: GridPosition;
  private readonly patrolIndexByGroupIdentifier = new Map<string, number>();
  private readonly defeatedGroupIdentifiers = new Set<string>();

  constructor(zone: ZoneDefinition) {
    this.zone = zone;
    this.playerPosition = zone.entryTile;
    for (const group of zone.roamingGroups) {
      this.patrolIndexByGroupIdentifier.set(group.identifier, 0);
    }
  }

  getZone(): ZoneDefinition {
    return this.zone;
  }

  getPlayerPosition(): GridPosition {
    return this.playerPosition;
  }

  getActiveRoamingGroupPositions(): ZoneRoamingGroupPosition[] {
    return this.zone.roamingGroups
      .filter((group) => !this.defeatedGroupIdentifiers.has(group.identifier))
      .map((group) => ({ groupIdentifier: group.identifier, position: this.positionForGroup(group) }));
  }

  /** Removes a roaming group from the rest of this visit — call only on a won fight. */
  markGroupDefeated(groupIdentifier: string): void {
    this.defeatedGroupIdentifiers.add(groupIdentifier);
  }

  /**
   * Moves the player to `nextPosition` (assumed to be one legal step from
   * their current tile) and advances every active roaming group one
   * patrol step in lockstep, then reports whether that left the player
   * sharing a tile with a group or standing on the tavern.
   */
  movePlayerTo(nextPosition: GridPosition): ZoneStepResult {
    this.playerPosition = nextPosition;
    for (const group of this.zone.roamingGroups) {
      if (this.defeatedGroupIdentifiers.has(group.identifier)) {
        continue;
      }
      const currentIndex = this.patrolIndexByGroupIdentifier.get(group.identifier) ?? 0;
      this.patrolIndexByGroupIdentifier.set(group.identifier, (currentIndex + 1) % group.patrolRoute.length);
    }

    const collidedGroupIdentifier = this.getActiveRoamingGroupPositions().find((entry) =>
      arePositionsEqual(entry.position, this.playerPosition),
    )?.groupIdentifier;

    return {
      collidedGroupIdentifier,
      enteredTavern: arePositionsEqual(this.playerPosition, this.zone.tavernTile),
    };
  }

  private positionForGroup(group: ZoneRoamingGroupDefinition): GridPosition {
    const index = this.patrolIndexByGroupIdentifier.get(group.identifier) ?? 0;
    return group.patrolRoute[index] ?? group.patrolRoute[0] ?? this.zone.entryTile;
  }
}
