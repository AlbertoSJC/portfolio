import type { CardinalDirection, GridPosition } from '../grid/GridPosition';
import type { EquipmentDefinition } from '../items/EquipmentDefinition';
import { STATISTIC, type BattleTeam, type Unit, type UnitStatistics } from './Unit';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  MonsterDefinition,
  RaceDefinition,
} from './UnitDefinitions';

const BASIC_ATTACK_SKILL_IDENTIFIER = 'basic_attack';

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
    skillIdentifiers: [
      BASIC_ATTACK_SKILL_IDENTIFIER,
      ...recipe.baseClass.skills
        .filter((entry) => entry.learnedAtLevel <= recipe.level)
        .map((entry) => entry.skillIdentifier),
    ],
    elementalAffinities: { ...recipe.race.elementalAffinities },
    activeStatModifiers: [],
    activeStatusEffects: [],
    hasMovedThisTurn: false,
    hasActedThisTurn: false,
    turnCharge: 0,
  };
}

export function createUnitFromMonster(
  monster: MonsterDefinition,
  uniqueIdentifier: string,
  position: GridPosition,
  facing: CardinalDirection,
): Unit {
  return {
    identifier: uniqueIdentifier,
    displayName: monster.displayName,
    team: 'enemy',
    raceLabel: 'Creature of the Darkness',
    classLabel: monster.displayName,
    level: monster.level,
    baseStatistics: { ...monster.statistics },
    currentHitPoints: monster.statistics.hitPointsMaximum,
    currentManaPoints: monster.statistics.manaPointsMaximum,
    position: { ...position },
    facing,
    canFly: monster.canFly,
    skillIdentifiers: [BASIC_ATTACK_SKILL_IDENTIFIER, ...monster.skillIdentifiers],
    elementalAffinities: { ...monster.elementalAffinities },
    activeStatModifiers: [],
    activeStatusEffects: [],
    hasMovedThisTurn: false,
    hasActedThisTurn: false,
    turnCharge: 0,
  };
}
