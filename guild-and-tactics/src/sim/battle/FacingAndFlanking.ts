import type { Unit } from '../units/Unit';
import { directionFromTo, oppositeDirection } from '../grid/GridPosition';

/** Where an attack lands relative to the defender's facing. */
export type RelativeAttackArc = 'front' | 'side' | 'back';

export function determineRelativeAttackArc(attacker: Unit, defender: Unit): RelativeAttackArc {
  const attackArrivesHeading = directionFromTo(attacker.position, defender.position);
  if (attackArrivesHeading === defender.facing) {
    // The attack travels the same way the defender looks: it lands in their back.
    return 'back';
  }
  if (attackArrivesHeading === oppositeDirection(defender.facing)) {
    return 'front';
  }
  return 'side';
}
