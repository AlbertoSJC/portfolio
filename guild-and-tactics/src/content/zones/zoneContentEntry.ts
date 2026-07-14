import type { ZoneDefinition, ZoneRoamingGroupDefinition } from '@/sim/guild/ZoneDefinition';
import type { BattleMapIdentifier } from '../maps/battleMapRegistry';
import type { MonsterIdentifier } from '../monsters';

/** A roaming group as authored in content: its monster pool is compile-checked against the roster. */
export interface ZoneRoamingGroupContentEntry extends ZoneRoamingGroupDefinition {
  monsterIdentifiers: MonsterIdentifier[];
}

/**
 * A zone as authored in content: identical to the sim's `ZoneDefinition`,
 * but cross-file references (battle map, monster pools) are compile-checked
 * — a typo'd identifier fails `tsc`, not a playthrough. Location and road
 * references stay zone-internal strings; the content-validity tests cover
 * those (including patrol catchability, which no type can express).
 */
export interface ZoneContentEntry extends ZoneDefinition {
  battleMapIdentifier: BattleMapIdentifier;
  roamingGroups: ZoneRoamingGroupContentEntry[];
}
