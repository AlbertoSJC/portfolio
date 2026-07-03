import type { MonsterDefinition } from '../../sim/units/UnitDefinitions';
import type { SkillIdentifier } from '../skills';

/**
 * A monster as authored in content: identical to the sim's
 * `MonsterDefinition`, but its skill references are compile-checked
 * against the skill pool — a typo'd identifier fails `tsc`, not a battle.
 */
export interface MonsterContentEntry extends MonsterDefinition {
  skillIdentifiers: SkillIdentifier[];
}
