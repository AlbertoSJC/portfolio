import type { CardinalDirection, GridPosition } from '../grid/GridPosition';

export type BattleTeam = 'guild' | 'enemy';

export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'sacred' | 'dark' | 'lightning';

export type RaceIdentifier = 'human' | 'werecat' | 'werelizard' | 'undead' | 'feryan';

export type BaseClassIdentifier = 'warrior' | 'thief' | 'mage' | 'priest';

export interface UnitStatistics {
  hitPointsMaximum: number;
  manaPointsMaximum: number;
  attack: number;
  defense: number;
  magicPower: number;
  magicResistance: number;
  speed: number;
  movementRange: number;
  jumpHeight: number;
  /** Probability (0..1) subtracted from an attacker's chance to hit. */
  evasion: number;
}

export type ModifiableStatistic = 'attack' | 'defense' | 'magicPower' | 'magicResistance' | 'speed';

export interface ActiveStatModifier {
  statistic: ModifiableStatistic;
  amount: number;
  remainingTurns: number;
  sourceSkillName: string;
}

/**
 * Damage taken of an element is multiplied by the unit's affinity for it.
 * 1 = neutral, above 1 = weakness, below 1 = resistance,
 * negative = the damage heals instead (Undead and Dark).
 */
export type ElementalAffinities = Partial<Record<Element, number>>;

export interface Unit {
  identifier: string;
  displayName: string;
  team: BattleTeam;
  /** Player characters have a race; monsters carry their monster kind here as a label. */
  raceLabel: string;
  classLabel: string;
  level: number;
  baseStatistics: UnitStatistics;
  currentHitPoints: number;
  currentManaPoints: number;
  position: GridPosition;
  facing: CardinalDirection;
  canFly: boolean;
  skillIdentifiers: string[];
  elementalAffinities: ElementalAffinities;
  activeStatModifiers: ActiveStatModifier[];
  hasMovedThisTurn: boolean;
  hasActedThisTurn: boolean;
  /** Turn-order charge; the unit acts when it reaches TURN_READY_CHARGE_THRESHOLD. */
  turnCharge: number;
}

export function isKnockedOut(unit: Unit): boolean {
  return unit.currentHitPoints <= 0;
}

/** Base statistic plus every active modifier that targets it. */
export function effectiveStatistic(unit: Unit, statistic: ModifiableStatistic): number {
  const modifierTotal = unit.activeStatModifiers
    .filter((modifier) => modifier.statistic === statistic)
    .reduce((sum, modifier) => sum + modifier.amount, 0);
  return Math.max(0, unit.baseStatistics[statistic] + modifierTotal);
}

export function elementalAffinityFor(unit: Unit, element: Element | undefined): number {
  if (element === undefined) {
    return 1;
  }
  return unit.elementalAffinities[element] ?? 1;
}

/** Called when a unit's turn ends: counts down buff durations and drops expired ones. */
export function tickDownStatModifiers(unit: Unit): void {
  for (const modifier of unit.activeStatModifiers) {
    modifier.remainingTurns -= 1;
  }
  unit.activeStatModifiers = unit.activeStatModifiers.filter(
    (modifier) => modifier.remainingTurns > 0,
  );
}
