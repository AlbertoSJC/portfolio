import type {
  AdvancedClassIdentifier,
  BaseClassIdentifier,
  ElementalAffinities,
  RaceIdentifier,
  UnitStatistics,
} from './Unit';

/** Flat statistic adjustments a race applies on top of its class statistics. */
export interface RaceDefinition {
  identifier: RaceIdentifier;
  displayName: string;
  statisticBonuses: Partial<UnitStatistics>;
  canFly: boolean;
  allowedBaseClasses: BaseClassIdentifier[];
  allowedAdvancedClasses: AdvancedClassIdentifier[];
  elementalAffinities: ElementalAffinities;
}

export interface ClassSkillEntry {
  skillIdentifier: string;
  learnedAtLevel: number;
}

export interface BaseClassDefinition {
  identifier: BaseClassIdentifier;
  displayName: string;
  description: string;
  statisticsAtLevelOne: UnitStatistics;
  statisticGrowthPerLevel: Partial<UnitStatistics>;
  skills: ClassSkillEntry[];
}

/** Base class level requirements that must be met before this advanced class unlocks. */
export interface AdvancedClassPrerequisite {
  primaryBaseClass: BaseClassIdentifier;
  primaryBaseClassLevel: number;
  /** Only present on hybrid (two-base) advanced classes. */
  secondaryBaseClass?: BaseClassIdentifier;
  secondaryBaseClassLevel?: number;
}

export interface AdvancedClassDefinition {
  identifier: AdvancedClassIdentifier;
  displayName: string;
  description: string;
  prerequisite: AdvancedClassPrerequisite;
  statisticsAtLevelOne: UnitStatistics;
  statisticGrowthPerLevel: Partial<UnitStatistics>;
  skills: ClassSkillEntry[];
}

/**
 * A monster is defined with the battle-ready statistics of its base
 * `level`. Spawning it at another level (a zone's `monsterLevelRange`)
 * derives statistics from `statisticGrowthPerLevel`, the same way class
 * growth works — see `createUnitFromMonster`.
 */
export interface MonsterDefinition {
  identifier: string;
  displayName: string;
  /** The level `statistics` describes; spawns above/below scale from here. */
  level: number;
  statistics: UnitStatistics;
  statisticGrowthPerLevel: Partial<UnitStatistics>;
  canFly: boolean;
  skillIdentifiers: string[];
  elementalAffinities: ElementalAffinities;
}
