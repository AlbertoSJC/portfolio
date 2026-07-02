import { BATTLE_PARTY_CAPACITY, type GuildState } from '../../../sim/guild/GuildState';
import {
  findActiveDispatchForQuest,
  type DispatchQuestDefinition,
} from '../../../sim/guild/DispatchQuest';
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

export interface DispatchCardViewModel extends QuestCardViewModel {
  isUnderway: boolean;
}

/** The tavern's dispatch board: one card per dispatch quest posted in this zone. */
export function buildDispatchCardViewModels(
  guild: GuildState,
  zoneIdentifier: string,
  dispatchQuests: Record<string, DispatchQuestDefinition>,
): DispatchCardViewModel[] {
  return Object.values(dispatchQuests)
    .filter((dispatchQuest) => dispatchQuest.zoneIdentifier === zoneIdentifier)
    .map((dispatchQuest) => {
      const activeDispatch = findActiveDispatchForQuest(guild, dispatchQuest.identifier);
      const awayMemberName =
        activeDispatch === undefined
          ? undefined
          : guild.roster.find((member) => member.identifier === activeDispatch.memberIdentifier)
              ?.displayName;
      return {
        questIdentifier: dispatchQuest.identifier,
        title: dispatchQuest.displayName,
        starsLabel: '',
        locationLine:
          activeDispatch === undefined || awayMemberName === undefined
            ? `Send one member · away ${dispatchQuest.durationInBattles} battles`
            : `Underway — ${awayMemberName} returns in ${activeDispatch.remainingBattles} ${activeDispatch.remainingBattles === 1 ? 'battle' : 'battles'}`,
        rewardLine: `Reward: ${dispatchQuest.rewardGold} gold · ${dispatchQuest.rewardExperience} XP`,
        isUnderway: activeDispatch !== undefined,
      };
    });
}

/** The dispatch detail reuses the quest-detail view: a member grid + one action button. */
export function buildDispatchDetailViewModel(
  dispatchQuest: DispatchQuestDefinition,
  selectedMemberName: string | undefined,
): QuestDetailViewModel {
  return {
    title: dispatchQuest.displayName,
    starsLabel: '',
    description: dispatchQuest.description,
    summaryLine: `Away for ${dispatchQuest.durationInBattles} battles · Reward: ${dispatchQuest.rewardGold} gold, ${dispatchQuest.rewardExperience} XP`,
    musterCounterLine: 'Choose one member to send',
    embarkButtonLabel: selectedMemberName === undefined ? 'Select a member' : `Send ${selectedMemberName}`,
    embarkDisabled: selectedMemberName === undefined,
  };
}

function mapDisplayName(quest: QuestDefinition, content: TavernContentTables): string {
  return (
    content.battleMapsByIdentifier[quest.battleMapIdentifier]?.map.displayName ??
    quest.battleMapIdentifier
  );
}
