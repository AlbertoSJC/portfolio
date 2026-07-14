import type { QuestDefinition } from '@/sim/guild/QuestDefinition';
import { BREIRWOOD_QUESTS } from './breirwoodQuests';
import { CROSSPATHS_FIELD_QUESTS } from './crosspathsFieldQuests';
import { MARSH_TRAIL_QUESTS } from './marshTrailQuests';
import { NORTH_ROAD_QUESTS } from './northRoadQuests';
import { QUARRY_PATH_QUESTS } from './quarryPathQuests';
import { SLUMBER_MEADOW_QUESTS } from './slumberMeadowQuests';
import { THORNS_PLAIN_QUESTS } from './thornsPlainQuests';

/**
 * The tavern quest pool (M2+), one file per zone's board. Quests are
 * repeatable guild work in the LORE.md voice. Every zone must keep at
 * least one rank-1 posting (test-enforced) — ranks are reputation-gated,
 * and a zone without bronze work shows fresh guilds an empty board.
 */
const QUEST_ENTRIES = {
  ...NORTH_ROAD_QUESTS,
  ...MARSH_TRAIL_QUESTS,
  ...QUARRY_PATH_QUESTS,
  ...SLUMBER_MEADOW_QUESTS,
  ...CROSSPATHS_FIELD_QUESTS,
  ...THORNS_PLAIN_QUESTS,
  ...BREIRWOOD_QUESTS,
} satisfies Record<string, QuestDefinition>;

/** Every valid quest identifier, derived from the pool above. */
export type QuestIdentifier = keyof typeof QUEST_ENTRIES;

export const QUESTS: Record<string, QuestDefinition> = QUEST_ENTRIES;
