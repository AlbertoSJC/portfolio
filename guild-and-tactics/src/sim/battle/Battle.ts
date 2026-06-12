import { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { BattleMap } from '../grid/BattleMap';
import type { CardinalDirection, GridPosition } from '../grid/GridPosition';
import { arePositionsEqual, directionFromTo, manhattanDistance } from '../grid/GridPosition';
import type { Unit } from '../units/Unit';
import { isKnockedOut, tickDownStatModifiers } from '../units/Unit';
import type { BattleEvent } from './BattleEvents';
import { findReachableTiles } from './MovementRange';
import type { SkillDefinition } from './SkillDefinition';
import {
  canUnitAffordSkill,
  executeSkill,
  isTargetTileWithinSkillRange,
} from './SkillExecution';
import { advanceToNextReadyUnit, forecastUpcomingTurnOrder } from './TurnOrderQueue';
import { TURN_ORDER_FORECAST_LENGTH } from './combatConstants';

export type BattleOutcome = 'ongoing' | 'victory' | 'defeat';

/**
 * The authoritative battle state machine. The renderer and HUD only read
 * from it; every change goes through a command method that validates the
 * move and returns the events it produced.
 */
export class Battle {
  readonly map: BattleMap;
  readonly units: Unit[];
  private readonly skillTable: Record<string, SkillDefinition>;
  private readonly randomNumberGenerator: SeededRandomNumberGenerator;
  private activeUnitIdentifier: string;

  constructor(
    map: BattleMap,
    units: Unit[],
    skillTable: Record<string, SkillDefinition>,
    randomSeed: number,
  ) {
    this.map = map;
    this.units = units;
    this.skillTable = skillTable;
    this.randomNumberGenerator = new SeededRandomNumberGenerator(randomSeed);
    const firstUnit = advanceToNextReadyUnit(this.units);
    firstUnit.hasMovedThisTurn = false;
    firstUnit.hasActedThisTurn = false;
    this.activeUnitIdentifier = firstUnit.identifier;
  }

  getActiveUnit(): Unit {
    const activeUnit = this.units.find((unit) => unit.identifier === this.activeUnitIdentifier);
    if (activeUnit === undefined) {
      throw new Error(`Active unit "${this.activeUnitIdentifier}" not found`);
    }
    return activeUnit;
  }

  getUnitByIdentifier(identifier: string): Unit | undefined {
    return this.units.find((unit) => unit.identifier === identifier);
  }

  getLivingUnitAtPosition(position: GridPosition): Unit | undefined {
    return this.units.find(
      (unit) => !isKnockedOut(unit) && arePositionsEqual(unit.position, position),
    );
  }

  getSkillByIdentifier(skillIdentifier: string): SkillDefinition {
    const skill = this.skillTable[skillIdentifier];
    if (skill === undefined) {
      throw new Error(`Unknown skill "${skillIdentifier}"`);
    }
    return skill;
  }

  getSkillsOfActiveUnit(): SkillDefinition[] {
    return this.getActiveUnit().skillIdentifiers.map((identifier) =>
      this.getSkillByIdentifier(identifier),
    );
  }

  getReachableTilesForActiveUnit(): GridPosition[] {
    const activeUnit = this.getActiveUnit();
    if (activeUnit.hasMovedThisTurn) {
      return [];
    }
    return findReachableTiles(activeUnit, this.map, this.units);
  }

  getBattleOutcome(): BattleOutcome {
    const guildHasLivingUnits = this.units.some(
      (unit) => unit.team === 'guild' && !isKnockedOut(unit),
    );
    const enemyHasLivingUnits = this.units.some(
      (unit) => unit.team === 'enemy' && !isKnockedOut(unit),
    );
    if (!enemyHasLivingUnits) {
      return 'victory';
    }
    if (!guildHasLivingUnits) {
      return 'defeat';
    }
    return 'ongoing';
  }

  /** The acting unit first, then the predicted upcoming turns. */
  getTurnOrderForecast(): Unit[] {
    return [this.getActiveUnit(), ...forecastUpcomingTurnOrder(this.units)].slice(
      0,
      TURN_ORDER_FORECAST_LENGTH,
    );
  }

  moveActiveUnit(destination: GridPosition): BattleEvent[] {
    const activeUnit = this.getActiveUnit();
    if (activeUnit.hasMovedThisTurn) {
      throw new Error(`${activeUnit.displayName} has already moved this turn`);
    }
    const reachableTiles = findReachableTiles(activeUnit, this.map, this.units);
    const destinationIsReachable = reachableTiles.some((tile) =>
      arePositionsEqual(tile, destination),
    );
    if (!destinationIsReachable) {
      throw new Error(
        `Tile ${destination.column},${destination.row} is not reachable for ${activeUnit.displayName}`,
      );
    }
    const movementStart = { ...activeUnit.position };
    activeUnit.facing = directionFromTo(movementStart, destination);
    activeUnit.position = { ...destination };
    activeUnit.hasMovedThisTurn = true;
    return [
      {
        kind: 'unitMoved',
        unitIdentifier: activeUnit.identifier,
        from: movementStart,
        to: destination,
      },
    ];
  }

  useSkillWithActiveUnit(skillIdentifier: string, targetTile: GridPosition): BattleEvent[] {
    const activeUnit = this.getActiveUnit();
    if (activeUnit.hasActedThisTurn) {
      throw new Error(`${activeUnit.displayName} has already acted this turn`);
    }
    const skill = this.getSkillByIdentifier(skillIdentifier);
    if (!activeUnit.skillIdentifiers.includes(skillIdentifier)) {
      throw new Error(`${activeUnit.displayName} does not know "${skill.displayName}"`);
    }
    if (!canUnitAffordSkill(activeUnit, skill)) {
      throw new Error(`${activeUnit.displayName} lacks the mana for "${skill.displayName}"`);
    }
    if (!isTargetTileWithinSkillRange(activeUnit, skill, targetTile)) {
      throw new Error(`Target tile is out of range for "${skill.displayName}"`);
    }
    // Face the target before striking (self-targeted skills keep the current facing).
    if (!arePositionsEqual(targetTile, activeUnit.position)) {
      activeUnit.facing = directionFromTo(activeUnit.position, targetTile);
    }
    const events = executeSkill(
      activeUnit,
      skill,
      targetTile,
      this.units,
      this.randomNumberGenerator,
    );
    activeUnit.hasActedThisTurn = true;

    const outcome = this.getBattleOutcome();
    if (outcome !== 'ongoing') {
      events.push({ kind: 'battleEnded', outcome });
    }
    return events;
  }

  endActiveUnitTurn(finalFacing?: CardinalDirection): BattleEvent[] {
    const endingUnit = this.getActiveUnit();
    if (finalFacing !== undefined) {
      endingUnit.facing = finalFacing;
    }
    tickDownStatModifiers(endingUnit);
    const events: BattleEvent[] = [
      { kind: 'turnEnded', unitIdentifier: endingUnit.identifier },
    ];

    if (this.getBattleOutcome() !== 'ongoing') {
      return events;
    }

    const nextUnit = advanceToNextReadyUnit(this.units);
    nextUnit.hasMovedThisTurn = false;
    nextUnit.hasActedThisTurn = false;
    this.activeUnitIdentifier = nextUnit.identifier;
    events.push({ kind: 'turnStarted', unitIdentifier: nextUnit.identifier });
    return events;
  }

  /** Convenience for AI and tests: nearest living opponent of the given unit. */
  findNearestLivingOpponent(fromUnit: Unit): Unit | undefined {
    const livingOpponents = this.units.filter(
      (unit) => unit.team !== fromUnit.team && !isKnockedOut(unit),
    );
    let nearestOpponent: Unit | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const opponent of livingOpponents) {
      const distance = manhattanDistance(fromUnit.position, opponent.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestOpponent = opponent;
      }
    }
    return nearestOpponent;
  }
}
