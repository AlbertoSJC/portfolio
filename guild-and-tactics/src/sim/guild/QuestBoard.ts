import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { GuildState } from './GuildState';

/** How many quests the tavern board offers at a time. */
export const QUEST_BOARD_SIZE = 4;

/**
 * Fills empty board slots with random quests from the pool. Quests are
 * repeatable (the guild loop has no main story), but a quest already on
 * the board is never offered twice at once.
 */
export function refillQuestBoard(
  guild: GuildState,
  allQuestIdentifiers: readonly string[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): void {
  const offerableIdentifiers = allQuestIdentifiers.filter(
    (questIdentifier) => !guild.questIdentifiersOnBoard.includes(questIdentifier),
  );
  while (guild.questIdentifiersOnBoard.length < QUEST_BOARD_SIZE && offerableIdentifiers.length > 0) {
    const drawnIndex = randomNumberGenerator.nextIntegerBetween(0, offerableIdentifiers.length - 1);
    const [drawnIdentifier] = offerableIdentifiers.splice(drawnIndex, 1);
    if (drawnIdentifier !== undefined) {
      guild.questIdentifiersOnBoard.push(drawnIdentifier);
    }
  }
}

/** Removes a finished quest from the board and draws a replacement. */
export function completeQuestOnBoard(
  guild: GuildState,
  completedQuestIdentifier: string,
  allQuestIdentifiers: readonly string[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): void {
  guild.questIdentifiersOnBoard = guild.questIdentifiersOnBoard.filter(
    (questIdentifier) => questIdentifier !== completedQuestIdentifier,
  );
  guild.completedQuestCount += 1;
  refillQuestBoard(guild, allQuestIdentifiers, randomNumberGenerator);
}
