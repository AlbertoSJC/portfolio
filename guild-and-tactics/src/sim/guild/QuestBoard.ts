import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { GuildState } from './GuildState';
import type { QuestDefinition } from './QuestDefinition';
import type { ZoneDefinition } from './ZoneDefinition';

/** How many quests a tavern board offers at a time. */
export const QUEST_BOARD_SIZE = 4;

/** Quests eligible for a zone's tavern — matched by their shared battle map. */
export function questIdentifiersForZone(
  zone: ZoneDefinition,
  quests: Record<string, QuestDefinition>,
): string[] {
  return Object.values(quests)
    .filter((quest) => quest.battleMapIdentifier === zone.battleMapIdentifier)
    .map((quest) => quest.identifier);
}

function questsOnBoard(guild: GuildState, zoneIdentifier: string): string[] {
  return guild.questIdentifiersOnBoard[zoneIdentifier] ?? [];
}

/**
 * Fills one zone's empty board slots with random quests from that zone's
 * pool. Quests are repeatable (the guild loop has no main story), but a
 * quest already on the board is never offered twice at once.
 */
export function refillQuestBoard(
  guild: GuildState,
  zoneIdentifier: string,
  zoneQuestIdentifiers: readonly string[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): void {
  const boardIdentifiers = [...questsOnBoard(guild, zoneIdentifier)];
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
