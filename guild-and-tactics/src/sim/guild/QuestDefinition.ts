import type { GridPosition } from '../grid/GridPosition';

export interface QuestEnemySpawn {
  monsterIdentifier: string;
  position: GridPosition;
  /**
   * Level the monster spawns at; omitted means its base level. Quests are
   * authored at base levels; roaming encounters roll this from the zone's
   * `monsterLevelRange` (see EncounterGeneration.ts).
   */
  spawnLevel?: number;
}

/** 1 = fresh guild work, 3 = bring your best six. */
export type QuestDifficultyRank = 1 | 2 | 3;

export interface QuestDefinition {
  identifier: string;
  displayName: string;
  /** Tavern-board flavor text (lore voice). */
  description: string;
  difficultyRank: QuestDifficultyRank;
  /** The zone whose tavern board offers this quest. */
  zoneIdentifier: string;
  /** The tactical map the fight plays on — independent of the zone, so zones can share maps. */
  battleMapIdentifier: string;
  enemySpawns: QuestEnemySpawn[];
  rewardGold: number;
  rewardExperience: number;
}
