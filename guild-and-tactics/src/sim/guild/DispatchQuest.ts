import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import { applyExperienceGain } from '../progression/ExperienceAndLevels';
import { findRosterMember, type GuildMember, type GuildState } from './GuildState';
import type { QuestDifficultyRank } from './QuestDefinition';
import type { ZoneDefinition } from './ZoneDefinition';

/**
 * A dispatch quest (PRD §11 M4): the tavern posts errands that need a
 * guild member, not a battle party. One member is sent away and cannot be
 * mustered; time passes in battles fought by the rest of the guild
 * (`durationInBattles`), and when it runs out the member either returns
 * with the reward or empty-handed, per `calculateDispatchSuccessChance`.
 */
export interface DispatchQuestDefinition {
  identifier: string;
  displayName: string;
  /** Tavern-board flavor text (lore voice). */
  description: string;
  /** The zone whose tavern board offers this dispatch. */
  zoneIdentifier: string;
  /** Same scale as quest difficulty — feeds the expected-level baseline below. */
  difficultyRank: QuestDifficultyRank;
  /** Concluded battles (victory, defeat, or flee alike) before the member returns. */
  durationInBattles: number;
  rewardGold: number;
  /** Experience the dispatched member earns on success. */
  rewardExperience: number;
}

/** The member level a dispatch of this rank is written for. */
const EXPECTED_MEMBER_LEVEL_BY_DISPATCH_RANK: Record<QuestDifficultyRank, number> = {
  1: 3,
  2: 7,
  3: 12,
};

const BASE_DISPATCH_SUCCESS_CHANCE = 0.85;
/** Each level above (or below) the dispatch's expected level shifts success by this much. */
const DISPATCH_LEVEL_ADVANTAGE_BONUS_PER_LEVEL = 0.05;
/** Each battle of duration beyond the first shaves this much off success. */
const DISPATCH_DURATION_RISK_PENALTY_PER_BATTLE = 0.03;
const DISPATCH_MINIMUM_SUCCESS_CHANCE = 0.05;
const DISPATCH_MAXIMUM_SUCCESS_CHANCE = 0.99;

/**
 * Chance a dispatched member succeeds: better than the dispatch's expected
 * level pushes toward certain success, a longer dispatch adds risk.
 */
export function calculateDispatchSuccessChance(
  member: GuildMember,
  dispatchQuest: DispatchQuestDefinition,
): number {
  const expectedLevel = EXPECTED_MEMBER_LEVEL_BY_DISPATCH_RANK[dispatchQuest.difficultyRank];
  const chance =
    BASE_DISPATCH_SUCCESS_CHANCE +
    DISPATCH_LEVEL_ADVANTAGE_BONUS_PER_LEVEL * (member.level - expectedLevel) -
    DISPATCH_DURATION_RISK_PENALTY_PER_BATTLE * (dispatchQuest.durationInBattles - 1);
  return Math.min(DISPATCH_MAXIMUM_SUCCESS_CHANCE, Math.max(DISPATCH_MINIMUM_SUCCESS_CHANCE, chance));
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
  outcome: 'success' | 'failure';
  /** Always 0 on failure — no reward is paid. */
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
 * finish: a success roll (`calculateDispatchSuccessChance`) decides whether
 * the guild is paid and the member earns their experience, or they return
 * empty-handed. Either way the dispatch leaves the active list. Call once
 * per concluded battle.
 */
export function tickDispatchesAfterBattle(
  guild: GuildState,
  dispatchQuests: Record<string, DispatchQuestDefinition>,
  randomNumberGenerator: SeededRandomNumberGenerator,
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
    const succeeded = randomNumberGenerator.rollChance(
      calculateDispatchSuccessChance(member, dispatchQuest),
    );
    if (succeeded) {
      guild.gold += dispatchQuest.rewardGold;
      const levelsGained = applyExperienceGain(member, dispatchQuest.rewardExperience);
      resolvedReports.push({ dispatchQuest, member, outcome: 'success', levelsGained });
    } else {
      resolvedReports.push({ dispatchQuest, member, outcome: 'failure', levelsGained: 0 });
    }
  }
  guild.activeDispatches = stillActive;
  return resolvedReports;
}
