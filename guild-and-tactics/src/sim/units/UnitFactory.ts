import type { CardinalDirection, GridPosition } from '../grid/GridPosition';
import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import { STATISTIC, type BattleTeam, type Unit, type UnitStatistics } from './Unit';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  MonsterDefinition,
  RaceDefinition,
} from './UnitDefinitions';

/** Every unit knows this skill (granted below) — the sim layer's one universal skill identifier. */
export const BASIC_ATTACK_SKILL_IDENTIFIER = 'basic_attack';

function deduplicate(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export interface CharacterRecipe {
  identifier: string;
  displayName: string;
  team: BattleTeam;
  race: RaceDefinition;
  baseClass: BaseClassDefinition | AdvancedClassDefinition;
  level: number;
  position: GridPosition;
  facing: CardinalDirection;
  /** Worn gear; its statistic bonuses fold into the derived statistics. */
  equipment?: EquipmentDefinition[];
  /** Skills carried from a previously mastered base class (the secondary skill set). */
  secondarySkillIdentifiers?: string[];
  /** Equipment-granted skills mastered permanently through use (SkillMastery.ts). */
  masteredSkillIdentifiers?: string[];
  /** Skills usable only while the granting gear stays equipped (SkillMastery.ts). */
  equipmentGrantedSkillIdentifiers?: string[];
}

function deriveStatisticsForLevel(
  baseClass: BaseClassDefinition | AdvancedClassDefinition,
  race: RaceDefinition,
  level: number,
  equipment: readonly EquipmentDefinition[],
): UnitStatistics {
  const levelsGained = level - 1;
  const derived = { ...baseClass.statisticsAtLevelOne };
  for (const statisticName of Object.keys(derived) as (keyof UnitStatistics)[]) {
    const growthPerLevel = baseClass.statisticGrowthPerLevel[statisticName] ?? 0;
    const raceBonus = race.statisticBonuses[statisticName] ?? 0;
    const equipmentBonus = equipment.reduce(
      (bonusSum, equipmentPiece) => bonusSum + (equipmentPiece.statisticBonuses[statisticName] ?? 0),
      0,
    );
    const rawValue =
      derived[statisticName] + growthPerLevel * levelsGained + raceBonus + equipmentBonus;
    // Evasion is a probability and stays fractional; every other statistic is a whole number.
    derived[statisticName] = statisticName === STATISTIC.Evasion ? rawValue : Math.floor(rawValue);
  }
  return derived;
}

export function createUnitFromCharacter(recipe: CharacterRecipe): Unit {
  const classId = recipe.baseClass.identifier as string;
  const isAllowedByRace =
    (recipe.race.allowedBaseClasses as string[]).includes(classId) ||
    (recipe.race.allowedAdvancedClasses as string[]).includes(classId);
  if (!isAllowedByRace) {
    throw new Error(
      `Race "${recipe.race.displayName}" cannot take the ${recipe.baseClass.displayName} class`,
    );
  }
  const statistics = deriveStatisticsForLevel(
    recipe.baseClass,
    recipe.race,
    recipe.level,
    recipe.equipment ?? [],
  );
  // A skill already known through class, secondary set, or mastery never
  // counts as gear-granted — the unit keeps it if the item comes off.
  const skillIdentifiersKnownWithoutGear = deduplicate([
    BASIC_ATTACK_SKILL_IDENTIFIER,
    ...recipe.baseClass.skills
      .filter((entry) => entry.learnedAtLevel <= recipe.level)
      .map((entry) => entry.skillIdentifier),
    ...(recipe.secondarySkillIdentifiers ?? []),
    ...(recipe.masteredSkillIdentifiers ?? []),
  ]);
  const gearOnlySkillIdentifiers = deduplicate(
    recipe.equipmentGrantedSkillIdentifiers ?? [],
  ).filter((skillIdentifier) => !skillIdentifiersKnownWithoutGear.includes(skillIdentifier));
  return {
    identifier: recipe.identifier,
    displayName: recipe.displayName,
    team: recipe.team,
    raceLabel: recipe.race.displayName,
    classLabel: recipe.baseClass.displayName,
    level: recipe.level,
    baseStatistics: statistics,
    currentHitPoints: statistics.hitPointsMaximum,
    currentManaPoints: statistics.manaPointsMaximum,
    position: { ...recipe.position },
    facing: recipe.facing,
    canFly: recipe.race.canFly,
    skillIdentifiers: [...skillIdentifiersKnownWithoutGear, ...gearOnlySkillIdentifiers],
    equipmentGrantedSkillIdentifiers: gearOnlySkillIdentifiers,
    elementalAffinities: { ...recipe.race.elementalAffinities },
    activeStatModifiers: [],
    activeStatusEffects: [],
    hasMovedThisTurn: false,
    hasActedThisTurn: false,
    turnCharge: 0,
  };
}

/**
 * Statistics for a monster spawned above or below its base level: base
 * statistics plus growth per level of difference (negative for weaker,
 * younger spawns). Hit points never scale below 1, everything else never
 * below 0; evasion stays fractional like character derivation.
 */
function deriveMonsterStatisticsForLevel(
  monster: MonsterDefinition,
  spawnLevel: number,
): UnitStatistics {
  const levelDifference = spawnLevel - monster.level;
  const derived = { ...monster.statistics };
  for (const statisticName of Object.keys(derived) as (keyof UnitStatistics)[]) {
    const growthPerLevel = monster.statisticGrowthPerLevel[statisticName] ?? 0;
    const rawValue = derived[statisticName] + growthPerLevel * levelDifference;
    const wholeValue = statisticName === STATISTIC.Evasion ? rawValue : Math.floor(rawValue);
    const minimumValue = statisticName === STATISTIC.HitPointsMaximum ? 1 : 0;
    derived[statisticName] = Math.max(minimumValue, wholeValue);
  }
  return derived;
}

export function createUnitFromMonster(
  monster: MonsterDefinition,
  uniqueIdentifier: string,
  position: GridPosition,
  facing: CardinalDirection,
  spawnLevel: number = monster.level,
): Unit {
  const statistics = deriveMonsterStatisticsForLevel(monster, spawnLevel);
  return {
    identifier: uniqueIdentifier,
    displayName: monster.displayName,
    team: 'enemy',
    raceLabel: 'Creature of the Darkness',
    classLabel: monster.displayName,
    level: spawnLevel,
    baseStatistics: statistics,
    currentHitPoints: statistics.hitPointsMaximum,
    currentManaPoints: statistics.manaPointsMaximum,
    position: { ...position },
    facing,
    canFly: monster.canFly,
    skillIdentifiers: [BASIC_ATTACK_SKILL_IDENTIFIER, ...monster.skillIdentifiers],
    equipmentGrantedSkillIdentifiers: [],
    elementalAffinities: { ...monster.elementalAffinities },
    activeStatModifiers: [],
    activeStatusEffects: [],
    hasMovedThisTurn: false,
    hasActedThisTurn: false,
    turnCharge: 0,
  };
}
