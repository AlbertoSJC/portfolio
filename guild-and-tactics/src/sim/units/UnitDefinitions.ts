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

export interface BaseClassDefinition {
  identifier: BaseClassIdentifier;
  displayName: string;
  statisticsAtLevelOne: UnitStatistics;
  statisticGrowthPerLevel: Partial<UnitStatistics>;
  skillIdentifiers: string[];
}

/** A monster is defined directly with its battle-ready statistics. */
export interface MonsterDefinition {
  identifier: string;
  displayName: string;
  level: number;
  statistics: UnitStatistics;
  canFly: boolean;
  skillIdentifiers: string[];
  elementalAffinities: ElementalAffinities;
}
