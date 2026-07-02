import type { Unit } from '../units/Unit';
import { effectiveSpeed, isKnockedOut } from '../units/Unit';
import { TURN_ORDER_FORECAST_LENGTH, TURN_READY_CHARGE_THRESHOLD } from './combatConstants';

/**
 * FFTA-style charge-time turn order: every tick each living unit gains
 * charge equal to its speed; a unit acts when its charge reaches the
 * threshold, then pays the threshold back.
 */

/** Advances charge until some unit is ready, then returns the fastest ready unit. */
export function advanceToNextReadyUnit(units: readonly Unit[]): Unit {
  const livingUnits = units.filter((unit) => !isKnockedOut(unit));
  if (livingUnits.length === 0) {
    throw new Error('Cannot advance turn order: no living units');
  }
  for (;;) {
    const readyUnits = livingUnits
      .filter((unit) => unit.turnCharge >= TURN_READY_CHARGE_THRESHOLD)
      .sort(compareReadyUnits);
    const nextReadyUnit = readyUnits[0];
    if (nextReadyUnit !== undefined) {
      nextReadyUnit.turnCharge -= TURN_READY_CHARGE_THRESHOLD;
      return nextReadyUnit;
    }
    for (const unit of livingUnits) {
      unit.turnCharge += effectiveSpeed(unit);
    }
  }
}

/** Higher charge acts first; speed breaks ties, then identifier for stability. */
function compareReadyUnits(first: Unit, second: Unit): number {
  if (second.turnCharge !== first.turnCharge) {
    return second.turnCharge - first.turnCharge;
  }
  if (effectiveSpeed(second) !== effectiveSpeed(first)) {
    return effectiveSpeed(second) - effectiveSpeed(first);
  }
  return first.identifier.localeCompare(second.identifier);
}

/** Non-destructively predicts the next several units to act, for the HUD strip. */
export function forecastUpcomingTurnOrder(units: readonly Unit[]): Unit[] {
  const livingUnits = units.filter((unit) => !isKnockedOut(unit));
  if (livingUnits.length === 0) {
    return [];
  }
  const simulatedCharges = new Map(livingUnits.map((unit) => [unit.identifier, unit.turnCharge]));
  const forecast: Unit[] = [];

  while (forecast.length < TURN_ORDER_FORECAST_LENGTH) {
    const readyUnits = livingUnits
      .filter((unit) => (simulatedCharges.get(unit.identifier) ?? 0) >= TURN_READY_CHARGE_THRESHOLD)
      .sort((first, second) => {
        const firstCharge = simulatedCharges.get(first.identifier) ?? 0;
        const secondCharge = simulatedCharges.get(second.identifier) ?? 0;
        if (secondCharge !== firstCharge) {
          return secondCharge - firstCharge;
        }
        if (effectiveSpeed(second) !== effectiveSpeed(first)) {
          return effectiveSpeed(second) - effectiveSpeed(first);
        }
        return first.identifier.localeCompare(second.identifier);
      });
    const nextReadyUnit = readyUnits[0];
    if (nextReadyUnit !== undefined) {
      forecast.push(nextReadyUnit);
      simulatedCharges.set(
        nextReadyUnit.identifier,
        (simulatedCharges.get(nextReadyUnit.identifier) ?? 0) - TURN_READY_CHARGE_THRESHOLD,
      );
      continue;
    }
    for (const unit of livingUnits) {
      simulatedCharges.set(
        unit.identifier,
        (simulatedCharges.get(unit.identifier) ?? 0) + effectiveSpeed(unit),
      );
    }
  }
  return forecast;
}
