import { applyExperienceGain } from '../progression/ExperienceAndLevels';
import { findRosterMember, type GuildMember, type GuildState } from './GuildState';
import type { ZoneDefinition } from './ZoneDefinition';

/**
 * A dispatch quest (PRD §11 M4): the tavern posts errands that need a
 * guild member, not a battle party. One member is sent away and cannot be
 * mustered; time passes in battles fought by the rest of the guild
 * (`durationInBattles`), and when it runs out the member returns with the
 * reward — no failure roll in v1, dispatches always succeed.
 */
export interface DispatchQuestDefinition {
  identifier: string;
  displayName: string;
  /** Tavern-board flavor text (lore voice). */
  description: string;
  /** The zone whose tavern board offers this dispatch. */
  zoneIdentifier: string;
  /** Concluded battles (victory, defeat, or flee alike) before the member returns. */
  durationInBattles: number;
  rewardGold: number;
  /** Experience the dispatched member earns on return. */
  rewardExperience: number;
}

/** One member currently away on a dispatch quest — lives in GuildState. */
export interface ActiveDispatch {
  dispatchQuestIdentifier: string;
  memberIdentifier: string;
  remainingBattles: number;
}

/** What a resolved dispatch produced, for the battle-conclusion summary. */
export interface ResolvedDispatchReport {
  dispatchQuest: DispatchQuestDefinition;
  member: GuildMember;
  levelsGained: number;
}

export function dispatchQuestIdentifiersForZone(
  zone: ZoneDefinition,
  dispatchQuests: Record<string, DispatchQuestDefinition>,
): string[] {
  return Object.values(dispatchQuests)
    .filter((dispatchQuest) => dispatchQuest.zoneIdentifier === zone.identifier)
    .map((dispatchQuest) => dispatchQuest.identifier);
}

export function isMemberDispatched(guild: GuildState, memberIdentifier: string): boolean {
  return guild.activeDispatches.some((dispatch) => dispatch.memberIdentifier === memberIdentifier);
}

export function findActiveDispatchForQuest(
  guild: GuildState,
  dispatchQuestIdentifier: string,
): ActiveDispatch | undefined {
  return guild.activeDispatches.find(
    (dispatch) => dispatch.dispatchQuestIdentifier === dispatchQuestIdentifier,
  );
}

/**
 * Sends a member away on a dispatch quest. Returns false (and changes
 * nothing) when the member is unknown, already away, or the quest is
 * already underway with someone else.
 */
export function startDispatch(
  guild: GuildState,
  dispatchQuest: DispatchQuestDefinition,
  memberIdentifier: string,
): boolean {
  if (findRosterMember(guild, memberIdentifier) === undefined) {
    return false;
  }
  if (isMemberDispatched(guild, memberIdentifier)) {
    return false;
  }
  if (findActiveDispatchForQuest(guild, dispatchQuest.identifier) !== undefined) {
    return false;
  }
  guild.activeDispatches.push({
    dispatchQuestIdentifier: dispatchQuest.identifier,
    memberIdentifier,
    remainingBattles: dispatchQuest.durationInBattles,
  });
  return true;
}

/**
 * Advances every active dispatch by one battle and resolves those that
 * finish: the guild is paid, the member earns their experience, and the
 * dispatch leaves the active list. Call once per concluded battle.
 */
export function tickDispatchesAfterBattle(
  guild: GuildState,
  dispatchQuests: Record<string, DispatchQuestDefinition>,
): ResolvedDispatchReport[] {
  const resolvedReports: ResolvedDispatchReport[] = [];
  const stillActive: ActiveDispatch[] = [];
  for (const dispatch of guild.activeDispatches) {
    dispatch.remainingBattles -= 1;
    if (dispatch.remainingBattles > 0) {
      stillActive.push(dispatch);
      continue;
    }
    const dispatchQuest = dispatchQuests[dispatch.dispatchQuestIdentifier];
    const member = findRosterMember(guild, dispatch.memberIdentifier);
    if (dispatchQuest === undefined || member === undefined) {
      continue; // broken reference (removed content or member): drop the dispatch silently
    }
    guild.gold += dispatchQuest.rewardGold;
    const levelsGained = applyExperienceGain(member, dispatchQuest.rewardExperience);
    resolvedReports.push({ dispatchQuest, member, levelsGained });
  }
  guild.activeDispatches = stillActive;
  return resolvedReports;
}
