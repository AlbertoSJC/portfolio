import type { CardinalDirection, GridPosition } from '../grid/GridPosition';
import type { BattleTeam, Unit, UnitStatistics } from './Unit';
import type { BaseClassDefinition, MonsterDefinition, RaceDefinition } from './UnitDefinitions';

const BASIC_ATTACK_SKILL_IDENTIFIER = 'basic_attack';

export interface CharacterRecipe {
  identifier: string;
  displayName: string;
  team: BattleTeam;
  race: RaceDefinition;
  baseClass: BaseClassDefinition;
  level: number;
  position: GridPosition;
  facing: CardinalDirection;
}

function deriveStatisticsForLevel(
  baseClass: BaseClassDefinition,
  race: RaceDefinition,
  level: number,
): UnitStatistics {
  const levelsGained = level - 1;
  const derived = { ...baseClass.statisticsAtLevelOne };
  for (const statisticName of Object.keys(derived) as (keyof UnitStatistics)[]) {
    const growthPerLevel = baseClass.statisticGrowthPerLevel[statisticName] ?? 0;
    const raceBonus = race.statisticBonuses[statisticName] ?? 0;
    const rawValue = derived[statisticName] + growthPerLevel * levelsGained + raceBonus;
    // Evasion is a probability and stays fractional; every other statistic is a whole number.
    derived[statisticName] = statisticName === 'evasion' ? rawValue : Math.floor(rawValue);
  }
  return derived;
}

export function createUnitFromCharacter(recipe: CharacterRecipe): Unit {
  if (!recipe.race.allowedBaseClasses.includes(recipe.baseClass.identifier)) {
    throw new Error(
      `Race "${recipe.race.displayName}" cannot take the ${recipe.baseClass.displayName} class`,
    );
  }
  const statistics = deriveStatisticsForLevel(recipe.baseClass, recipe.race, recipe.level);
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
    skillIdentifiers: [BASIC_ATTACK_SKILL_IDENTIFIER, ...recipe.baseClass.skillIdentifiers],
    elementalAffinities: { ...recipe.race.elementalAffinities },
    activeStatModifiers: [],
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
    hasMovedThisTurn: false,
    hasActedThisTurn: false,
    turnCharge: 0,
  };
}
