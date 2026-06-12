import type { GuildMember } from '../guild/GuildState';

export const MAXIMUM_CHARACTER_LEVEL = 30;

/** Experience needed to climb from the given level to the next one. */
const EXPERIENCE_REQUIRED_AT_LEVEL_ONE = 100;
const EXPERIENCE_REQUIREMENT_GROWTH_PER_LEVEL = 50;

/** Experience every surviving party member earns per defeated enemy. */
const KILL_EXPERIENCE_BASE = 14;
const KILL_EXPERIENCE_PER_ENEMY_LEVEL = 6;

export function experienceRequiredToLevelUpFrom(currentLevel: number): number {
  return EXPERIENCE_REQUIRED_AT_LEVEL_ONE + EXPERIENCE_REQUIREMENT_GROWTH_PER_LEVEL * (currentLevel - 1);
}

export function experienceForDefeatingEnemy(enemyLevel: number): number {
  return KILL_EXPERIENCE_BASE + KILL_EXPERIENCE_PER_ENEMY_LEVEL * enemyLevel;
}

/**
 * Adds experience to a member and applies any level-ups it pays for.
 * Returns how many levels were gained (0 at the level cap).
 */
export function applyExperienceGain(member: GuildMember, experienceGained: number): number {
  if (member.level >= MAXIMUM_CHARACTER_LEVEL) {
    return 0;
  }
  member.experiencePoints += experienceGained;
  let levelsGained = 0;
  while (
    member.level < MAXIMUM_CHARACTER_LEVEL &&
    member.experiencePoints >= experienceRequiredToLevelUpFrom(member.level)
  ) {
    member.experiencePoints -= experienceRequiredToLevelUpFrom(member.level);
    member.level += 1;
    levelsGained += 1;
  }
  if (member.level >= MAXIMUM_CHARACTER_LEVEL) {
    member.experiencePoints = 0;
  }
  return levelsGained;
}
