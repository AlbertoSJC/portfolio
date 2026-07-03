import type { MonsterDefinition } from '../../sim/units/UnitDefinitions';
import { BEAST_MONSTERS } from './beasts';
import { FLORA_AND_STONE_MONSTERS } from './floraAndStone';
import { HUMANOID_MONSTERS } from './humanoids';
import { SPIRIT_MONSTERS } from './spirits';

/**
 * The full enemy roster, split by family (one file per family, LORE.md's
 * bestiary notes are the source of truth for who lives where and what
 * they're weak to). Add new monsters to the matching family file — or a
 * new family file — and they join the roster here.
 */
const MONSTER_ENTRIES = {
  ...BEAST_MONSTERS,
  ...HUMANOID_MONSTERS,
  ...SPIRIT_MONSTERS,
  ...FLORA_AND_STONE_MONSTERS,
} satisfies Record<string, MonsterDefinition>;

/** Every valid monster identifier — zones and quests reference monsters through this type. */
export type MonsterIdentifier = keyof typeof MONSTER_ENTRIES;

export const MONSTERS: Record<string, MonsterDefinition> = MONSTER_ENTRIES;
