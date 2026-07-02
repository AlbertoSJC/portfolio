import type { SkillDefinition } from '../sim/battle/SkillDefinition';
import type { BattleSpoilsReport } from '../sim/guild/BattleSpoils';

/** The outcome overlay's summary, one line per fact worth announcing. */
export function buildBattleSpoilsSummaryLines(
  report: BattleSpoilsReport,
  skillTable: Record<string, SkillDefinition>,
): string[] {
  const summaryLines: string[] = [];
  if (report.outcome === 'victory') {
    summaryLines.push(`Reward: ${report.goldAwarded} gold`);
  } else if (report.outcome === 'fled') {
    summaryLines.push('The guild slips away — no reward, but experience is kept.');
  } else {
    summaryLines.push('The guild retreats — no reward, but experience is kept.');
  }
  summaryLines.push(
    `${report.defeatedEnemyCount} foes defeated · ${report.experiencePerMember} XP per member`,
  );
  for (const levelUp of report.levelUps) {
    summaryLines.push(`${levelUp.member.displayName} is now level ${levelUp.member.level}!`);
  }
  for (const mastered of report.masteredSkills) {
    const skillName = skillTable[mastered.skillIdentifier]?.displayName ?? mastered.skillIdentifier;
    summaryLines.push(`${mastered.member.displayName} has mastered ${skillName}!`);
  }
  for (const resolved of report.resolvedDispatches) {
    summaryLines.push(
      `${resolved.member.displayName} returns from ${resolved.dispatchQuest.displayName} — +${resolved.dispatchQuest.rewardGold} gold, +${resolved.dispatchQuest.rewardExperience} XP`,
    );
    if (resolved.levelsGained > 0) {
      summaryLines.push(`${resolved.member.displayName} is now level ${resolved.member.level}!`);
    }
  }
  return summaryLines;
}
