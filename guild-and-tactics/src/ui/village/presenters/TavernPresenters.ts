import { BATTLE_PARTY_CAPACITY, type GuildState } from '../../../sim/guild/GuildState';
import type { QuestDefinition } from '../../../sim/guild/QuestDefinition';
import type { BattleMap } from '../../../sim/grid/BattleMap';

export interface TavernContentTables {
  quests: Record<string, QuestDefinition>;
  battleMapsByIdentifier: Record<string, { map: BattleMap }>;
}

const DIFFICULTY_RANK_LABELS: Record<number, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
};

export interface QuestCardViewModel {
  questIdentifier: string;
  title: string;
  starsLabel: string;
  locationLine: string;
  rewardLine: string;
}

export function buildQuestCardViewModels(
  guild: GuildState,
  zoneIdentifier: string,
  content: TavernContentTables,
): QuestCardViewModel[] {
  const questCards: QuestCardViewModel[] = [];
  for (const questIdentifier of guild.questIdentifiersOnBoard[zoneIdentifier] ?? []) {
    const quest = content.quests[questIdentifier];
    if (quest === undefined) {
      continue;
    }
    questCards.push({
      questIdentifier,
      title: quest.displayName,
      starsLabel: DIFFICULTY_RANK_LABELS[quest.difficultyRank] ?? '',
      locationLine: `${mapDisplayName(quest, content)} · ${quest.enemySpawns.length} foes`,
      rewardLine: `Reward: ${quest.rewardGold} gold · ${quest.rewardExperience} XP`,
    });
  }
  return questCards;
}

export interface QuestDetailViewModel {
  title: string;
  starsLabel: string;
  description: string;
  summaryLine: string;
  musterCounterLine: string;
  embarkButtonLabel: string;
  embarkDisabled: boolean;
}

export function buildQuestDetailViewModel(
  quest: QuestDefinition,
  selectedMemberCount: number,
  content: TavernContentTables,
): QuestDetailViewModel {
  return {
    title: quest.displayName,
    starsLabel: DIFFICULTY_RANK_LABELS[quest.difficultyRank] ?? '',
    description: quest.description,
    summaryLine: `${mapDisplayName(quest, content)} · ${quest.enemySpawns.length} foes · Reward: ${quest.rewardGold} gold, ${quest.rewardExperience} XP`,
    musterCounterLine: `Muster the party — ${selectedMemberCount} / ${BATTLE_PARTY_CAPACITY} selected`,
    embarkButtonLabel:
      selectedMemberCount === 0 ? 'Select at least one member' : `Embark with ${selectedMemberCount}`,
    embarkDisabled: selectedMemberCount === 0,
  };
}

function mapDisplayName(quest: QuestDefinition, content: TavernContentTables): string {
  return (
    content.battleMapsByIdentifier[quest.battleMapIdentifier]?.map.displayName ??
    quest.battleMapIdentifier
  );
}
