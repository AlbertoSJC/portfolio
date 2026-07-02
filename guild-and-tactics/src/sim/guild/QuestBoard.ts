import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { GuildState } from './GuildState';
import type { QuestDefinition, QuestDifficultyRank } from './QuestDefinition';
import type { ZoneDefinition } from './ZoneDefinition';
import { meetsReputationRequirement, type ReputationTier } from './ReputationTier';

/** How many quests a tavern board offers at a time. */
export const QUEST_BOARD_SIZE = 4;

/**
 * Harder quest ranks require guild reputation — the tavern boards simply
 * don't post them until the guild has earned its name (mirrors the store's
 * `minimumReputationTier` gating).
 */
export const REQUIRED_REPUTATION_TIER_BY_QUEST_RANK: Record<QuestDifficultyRank, ReputationTier> = {
  1: 'bronze',
  2: 'silver',
  3: 'gold',
};

/**
 * Quests eligible for a zone's tavern — declared on the quest itself, and
 * filtered to the ranks the guild's current reputation tier unlocks.
 */
export function questIdentifiersForZone(
  zone: ZoneDefinition,
  quests: Record<string, QuestDefinition>,
  currentTier: ReputationTier,
): string[] {
  return Object.values(quests)
    .filter(
      (quest) =>
        quest.zoneIdentifier === zone.identifier &&
        meetsReputationRequirement(currentTier, REQUIRED_REPUTATION_TIER_BY_QUEST_RANK[quest.difficultyRank]),
    )
    .map((quest) => quest.identifier);
}

function questsOnBoard(guild: GuildState, zoneIdentifier: string): string[] {
  return guild.questIdentifiersOnBoard[zoneIdentifier] ?? [];
}

/**
 * Fills one zone's empty board slots with random quests from that zone's
 * pool. Quests are repeatable (the guild loop has no main story), but a
 * quest already on the board is never offered twice at once. Board entries
 * no longer in the offerable pool are dropped first, so the board is
 * self-healing (removed content, or saves from before rank gating existed).
 */
export function refillQuestBoard(
  guild: GuildState,
  zoneIdentifier: string,
  zoneQuestIdentifiers: readonly string[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): void {
  const boardIdentifiers = questsOnBoard(guild, zoneIdentifier).filter((questIdentifier) =>
    zoneQuestIdentifiers.includes(questIdentifier),
  );
  const offerableIdentifiers = zoneQuestIdentifiers.filter(
    (questIdentifier) => !boardIdentifiers.includes(questIdentifier),
  );
  while (boardIdentifiers.length < QUEST_BOARD_SIZE && offerableIdentifiers.length > 0) {
    const drawnIndex = randomNumberGenerator.nextIntegerBetween(0, offerableIdentifiers.length - 1);
    const [drawnIdentifier] = offerableIdentifiers.splice(drawnIndex, 1);
    if (drawnIdentifier !== undefined) {
      boardIdentifiers.push(drawnIdentifier);
    }
  }
  guild.questIdentifiersOnBoard[zoneIdentifier] = boardIdentifiers;
}

/** Removes a finished quest from its zone's board and draws a replacement. */
export function completeQuestOnBoard(
  guild: GuildState,
  zoneIdentifier: string,
  completedQuestIdentifier: string,
  zoneQuestIdentifiers: readonly string[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): void {
  guild.questIdentifiersOnBoard[zoneIdentifier] = questsOnBoard(guild, zoneIdentifier).filter(
    (questIdentifier) => questIdentifier !== completedQuestIdentifier,
  );
  guild.completedQuestCount += 1;
  refillQuestBoard(guild, zoneIdentifier, zoneQuestIdentifiers, randomNumberGenerator);
}
