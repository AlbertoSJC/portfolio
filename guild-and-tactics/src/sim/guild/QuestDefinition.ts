import type { GridPosition } from '../grid/GridPosition';

export interface QuestEnemySpawn {
  monsterIdentifier: string;
  position: GridPosition;
}

/** 1 = fresh guild work, 3 = bring your best six. */
export type QuestDifficultyRank = 1 | 2 | 3;

export interface QuestDefinition {
  identifier: string;
  displayName: string;
  /** Tavern-board flavor text (lore voice). */
  description: string;
  difficultyRank: QuestDifficultyRank;
  battleMapIdentifier: string;
  enemySpawns: QuestEnemySpawn[];
  rewardGold: number;
  rewardExperience: number;
}
