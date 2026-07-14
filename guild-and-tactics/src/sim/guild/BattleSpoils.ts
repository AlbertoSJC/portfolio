import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import {
  applyExperienceGain,
  experienceForDefeatingEnemy,
} from '../progression/ExperienceAndLevels';
import {
  tickDispatchesAfterBattle,
  type DispatchQuestDefinition,
  type ResolvedDispatchReport,
} from './DispatchQuest';
import { findRosterMember, type GuildMember, type GuildState } from './GuildState';
import { recordEquipmentSkillUses } from './SkillMastery';

/**
 * Everything a concluded battle feeds back into the guild, as plain data —
 * the controller reads these off the Battle and hands them over, so the
 * rules below stay pure sim and fully unit-testable.
 */
export interface BattleSpoilsInput {
  outcome: 'victory' | 'defeat' | 'fled';
  /** Paid to the guild only on victory (PRD §5 retreat rule). */
  goldRewardOnVictory: number;
  /** Quest completion experience — also victory-only; kill XP is always kept. */
  bonusExperienceOnVictory: number;
  defeatedEnemyLevels: readonly number[];
  deployedMemberIdentifiers: readonly string[];
  /** Per deployed member: how many times they used each skill this battle. */
  skillUseCountsByMemberIdentifier: Record<string, Record<string, number>>;
  /** Unspent consumables to hand back to the guild inventory. */
  remainingItemPouch: Record<string, number>;
}

export interface MemberLevelUpReport {
  member: GuildMember;
  levelsGained: number;
}

export interface MasteredSkillReport {
  member: GuildMember;
  skillIdentifier: string;
}

/** What the battle paid out, for the outcome-overlay summary. */
export interface BattleSpoilsReport {
  outcome: BattleSpoilsInput['outcome'];
  goldAwarded: number;
  defeatedEnemyCount: number;
  experiencePerMember: number;
  levelUps: MemberLevelUpReport[];
  masteredSkills: MasteredSkillReport[];
  resolvedDispatches: ResolvedDispatchReport[];
}

/**
 * Applies a concluded battle's spoils to the guild (PRD §5): the item
 * pouch comes home, kill experience is kept whatever the outcome, gold and
 * bonus experience pay out only on victory, equipment-skill mastery
 * credits every deployed member's uses, and one battle of time passes for
 * members away on dispatch. Returns the report the summary is built from.
 */
export function applyBattleSpoils(
  guild: GuildState,
  spoils: BattleSpoilsInput,
  equipmentTable: Record<string, EquipmentDefinition>,
  dispatchQuestTable: Record<string, DispatchQuestDefinition>,
  randomNumberGenerator: SeededRandomNumberGenerator,
): BattleSpoilsReport {
  guild.consumableInventory = { ...spoils.remainingItemPouch };

  const killExperience = spoils.defeatedEnemyLevels.reduce(
    (experienceSum, enemyLevel) => experienceSum + experienceForDefeatingEnemy(enemyLevel),
    0,
  );
  const experiencePerMember =
    killExperience + (spoils.outcome === 'victory' ? spoils.bonusExperienceOnVictory : 0);
  const goldAwarded = spoils.outcome === 'victory' ? spoils.goldRewardOnVictory : 0;
  guild.gold += goldAwarded;

  const levelUps: MemberLevelUpReport[] = [];
  const masteredSkills: MasteredSkillReport[] = [];
  for (const memberIdentifier of spoils.deployedMemberIdentifiers) {
    const member = findRosterMember(guild, memberIdentifier);
    if (member === undefined) {
      continue;
    }
    const levelsGained = applyExperienceGain(member, experiencePerMember);
    if (levelsGained > 0) {
      levelUps.push({ member, levelsGained });
    }
    // Like kill XP, mastery progress from skill uses is kept whatever the outcome.
    const newlyMasteredSkillIdentifiers = recordEquipmentSkillUses(
      member,
      spoils.skillUseCountsByMemberIdentifier[memberIdentifier] ?? {},
      equipmentTable,
    );
    for (const skillIdentifier of newlyMasteredSkillIdentifiers) {
      masteredSkills.push({ member, skillIdentifier });
    }
  }

  // Every concluded battle passes time for members away on dispatch,
  // whatever the outcome — they are elsewhere, earning their keep.
  const resolvedDispatches = tickDispatchesAfterBattle(
    guild,
    dispatchQuestTable,
    randomNumberGenerator,
  );

  return {
    outcome: spoils.outcome,
    goldAwarded,
    defeatedEnemyCount: spoils.defeatedEnemyLevels.length,
    experiencePerMember,
    levelUps,
    masteredSkills,
    resolvedDispatches,
  };
}
