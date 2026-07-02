import { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { BattleMap } from '../grid/BattleMap';
import type { CardinalDirection, GridPosition } from '../grid/GridPosition';
import { arePositionsEqual, directionFromTo, manhattanDistance } from '../grid/GridPosition';
import type { Unit } from '../units/Unit';
import { hasStatusEffect, isKnockedOut, tickDownStatModifiers, tickDownStatusEffects } from '../units/Unit';
import { POISON_DAMAGE_PER_TURN, REGEN_HEALING_PER_TURN } from './combatConstants';
import type { BattleEvent } from './BattleEvents';
import { findReachableTiles } from './MovementRange';
import type { SkillDefinition } from './SkillDefinition';
import {
  canUnitAffordSkill,
  executeSkill,
  isTargetTileWithinSkillRange,
} from './SkillExecution';
import { advanceToNextReadyUnit, forecastUpcomingTurnOrder } from './TurnOrderQueue';
import { ITEM_USE_RANGE, TURN_ORDER_FORECAST_LENGTH } from './combatConstants';
import type { ConsumableItemDefinition } from '../items/ConsumableItemDefinition';

export type BattleOutcome = 'ongoing' | 'victory' | 'defeat' | 'fled';

/**
 * The authoritative battle state machine. The renderer and HUD only read
 * from it; every change goes through a command method that validates the
 * move and returns the events it produced.
 */
export class Battle {
  readonly map: BattleMap;
  readonly units: Unit[];
  /** Levels of every enemy defeated so far — feeds kill experience after the battle. */
  readonly defeatedEnemyLevels: number[] = [];
  /** Uses per skill per unit — feeds equipment-skill mastery after the battle. */
  private readonly skillUseCountsByUnitIdentifier: Record<string, Record<string, number>> = {};
  /** Roaming encounters allow a mid-battle retreat; quest battles do not. */
  readonly isFleeingPermitted: boolean;
  private readonly skillTable: Record<string, SkillDefinition>;
  private readonly itemTable: Record<string, ConsumableItemDefinition>;
  private readonly itemPouch: Record<string, number>;
  private readonly randomNumberGenerator: SeededRandomNumberGenerator;
  private activeUnitIdentifier: string;
  private guildHasFled = false;

  constructor(
    map: BattleMap,
    units: Unit[],
    skillTable: Record<string, SkillDefinition>,
    randomSeed: number,
    itemTable: Record<string, ConsumableItemDefinition> = {},
    itemPouch: Record<string, number> = {},
    isFleeingPermitted: boolean = false,
  ) {
    this.map = map;
    this.units = units;
    this.skillTable = skillTable;
    this.itemTable = itemTable;
    this.itemPouch = { ...itemPouch };
    this.isFleeingPermitted = isFleeingPermitted;
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
    if (this.guildHasFled) {
      return 'fled';
    }
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
    const useCountsForUnit = (this.skillUseCountsByUnitIdentifier[activeUnit.identifier] ??= {});
    useCountsForUnit[skillIdentifier] = (useCountsForUnit[skillIdentifier] ?? 0) + 1;
    this.recordDefeatedEnemies(events);

    const outcome = this.getBattleOutcome();
    if (outcome !== 'ongoing') {
      events.push({ kind: 'battleEnded', outcome });
    }
    return events;
  }

  /**
   * The whole party retreats, ending the battle immediately. The guild keeps
   * kill experience but forfeits the reward, and the enemy group survives.
   */
  fleeWithActiveUnit(): BattleEvent[] {
    if (!this.isFleeingPermitted) {
      throw new Error('Fleeing is not permitted in this battle');
    }
    const activeUnit = this.getActiveUnit();
    if (activeUnit.team !== 'guild') {
      throw new Error('Only a guild unit can call the retreat');
    }
    this.guildHasFled = true;
    return [
      { kind: 'guildFled', unitIdentifier: activeUnit.identifier },
      { kind: 'battleEnded', outcome: 'fled' },
    ];
  }

  getItemPouchEntries(): { item: ConsumableItemDefinition; count: number }[] {
    return Object.entries(this.itemPouch)
      .filter(([, count]) => count > 0)
      .map(([itemIdentifier, count]) => ({
        item: this.getItemByIdentifier(itemIdentifier),
        count,
      }));
  }

  /** What is left after the battle, to hand back to the guild inventory. */
  getRemainingItemPouch(): Record<string, number> {
    return { ...this.itemPouch };
  }

  /** How many times the given unit used each skill this battle. */
  getSkillUseCountsForUnit(unitIdentifier: string): Record<string, number> {
    return { ...this.skillUseCountsByUnitIdentifier[unitIdentifier] };
  }

  getItemByIdentifier(itemIdentifier: string): ConsumableItemDefinition {
    const item = this.itemTable[itemIdentifier];
    if (item === undefined) {
      throw new Error(`Unknown item "${itemIdentifier}"`);
    }
    return item;
  }

  /** Using an item is the unit's action for the turn, like a skill. */
  useItemWithActiveUnit(itemIdentifier: string, targetTile: GridPosition): BattleEvent[] {
    const activeUnit = this.getActiveUnit();
    if (activeUnit.hasActedThisTurn) {
      throw new Error(`${activeUnit.displayName} has already acted this turn`);
    }
    const item = this.getItemByIdentifier(itemIdentifier);
    if ((this.itemPouch[itemIdentifier] ?? 0) <= 0) {
      throw new Error(`The pouch holds no ${item.displayName}`);
    }
    if (manhattanDistance(activeUnit.position, targetTile) > ITEM_USE_RANGE) {
      throw new Error(`Target tile is out of reach for ${item.displayName}`);
    }
    const targetUnit = this.getLivingUnitAtPosition(targetTile);
    if (targetUnit === undefined || targetUnit.team !== activeUnit.team) {
      throw new Error(`${item.displayName} must target a standing ally`);
    }
    this.itemPouch[itemIdentifier] = (this.itemPouch[itemIdentifier] ?? 0) - 1;
    activeUnit.hasActedThisTurn = true;

    const events: BattleEvent[] = [
      {
        kind: 'itemUsed',
        unitIdentifier: activeUnit.identifier,
        itemIdentifier,
        targetIdentifier: targetUnit.identifier,
      },
    ];
    if (item.effect.kind === 'restoreHitPoints') {
      const healingRestored = Math.min(
        item.effect.amount,
        targetUnit.baseStatistics.hitPointsMaximum - targetUnit.currentHitPoints,
      );
      targetUnit.currentHitPoints += healingRestored;
      events.push({
        kind: 'healingReceived',
        healerIdentifier: activeUnit.identifier,
        targetIdentifier: targetUnit.identifier,
        amount: healingRestored,
      });
    } else {
      const manaRestored = Math.min(
        item.effect.amount,
        targetUnit.baseStatistics.manaPointsMaximum - targetUnit.currentManaPoints,
      );
      targetUnit.currentManaPoints += manaRestored;
      events.push({
        kind: 'manaRestored',
        targetIdentifier: targetUnit.identifier,
        amount: manaRestored,
      });
    }
    return events;
  }

  private recordDefeatedEnemies(events: readonly BattleEvent[]): void {
    for (const event of events) {
      if (event.kind !== 'unitKnockedOut') {
        continue;
      }
      const knockedOutUnit = this.getUnitByIdentifier(event.unitIdentifier);
      if (knockedOutUnit !== undefined && knockedOutUnit.team === 'enemy') {
        this.defeatedEnemyLevels.push(knockedOutUnit.level);
      }
    }
  }

  /**
   * Processes start-of-turn status effects (regen healing, poison damage,
   * sleep auto-skip) for the current active unit. Returns events produced.
   * When sleep causes an auto-skip, the returned events include
   * turnEnded/turnStarted from the internal endActiveUnitTurn call — callers
   * should recurse into the next unit's turn after logging those events.
   */
  processStartOfTurnForActiveUnit(): BattleEvent[] {
    const activeUnit = this.getActiveUnit();
    const events: BattleEvent[] = [];

    if (hasStatusEffect(activeUnit, 'regen')) {
      const healingRestored = Math.min(
        REGEN_HEALING_PER_TURN,
        activeUnit.baseStatistics.hitPointsMaximum - activeUnit.currentHitPoints,
      );
      if (healingRestored > 0) {
        activeUnit.currentHitPoints += healingRestored;
        events.push({
          kind: 'regenHealingRestored',
          targetIdentifier: activeUnit.identifier,
          amount: healingRestored,
        });
      }
    }

    if (hasStatusEffect(activeUnit, 'poison')) {
      activeUnit.currentHitPoints = Math.max(
        0,
        activeUnit.currentHitPoints - POISON_DAMAGE_PER_TURN,
      );
      events.push({
        kind: 'poisonDamageDealt',
        targetIdentifier: activeUnit.identifier,
        amount: POISON_DAMAGE_PER_TURN,
      });
      if (isKnockedOut(activeUnit)) {
        events.push({ kind: 'unitKnockedOut', unitIdentifier: activeUnit.identifier });
        this.recordDefeatedEnemies(events);
        const outcome = this.getBattleOutcome();
        if (outcome !== 'ongoing') {
          events.push({ kind: 'battleEnded', outcome });
          return events;
        }
      }
    }

    if (hasStatusEffect(activeUnit, 'sleep')) {
      events.push({ kind: 'turnSkippedBySleep', unitIdentifier: activeUnit.identifier });
      events.push(...this.endActiveUnitTurn());
    }

    return events;
  }

  endActiveUnitTurn(finalFacing?: CardinalDirection): BattleEvent[] {
    const endingUnit = this.getActiveUnit();
    if (finalFacing !== undefined) {
      endingUnit.facing = finalFacing;
    }
    tickDownStatModifiers(endingUnit);
    tickDownStatusEffects(endingUnit);
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
