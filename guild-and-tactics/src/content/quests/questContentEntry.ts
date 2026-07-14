import type { QuestDefinition, QuestEnemySpawn } from '@/sim/guild/QuestDefinition';
import type { BattleMapIdentifier } from '../maps/battleMapRegistry';
import type { MonsterIdentifier } from '../monsters';
import type { ZoneIdentifier } from '../zones';

/** An enemy spawn as authored in content: its monster reference is compile-checked against the roster. */
export interface QuestEnemySpawnContentEntry extends QuestEnemySpawn {
  monsterIdentifier: MonsterIdentifier;
}

/**
 * A quest as authored in content: identical to the sim's `QuestDefinition`,
 * but every cross-file reference (zone, battle map, spawned monsters) is
 * compile-checked — a typo'd identifier fails `tsc`, not a tavern board.
 * Spawn-tile standability stays with the content-validity tests.
 */
export interface QuestContentEntry extends QuestDefinition {
  zoneIdentifier: ZoneIdentifier;
  battleMapIdentifier: BattleMapIdentifier;
  enemySpawns: QuestEnemySpawnContentEntry[];
}
