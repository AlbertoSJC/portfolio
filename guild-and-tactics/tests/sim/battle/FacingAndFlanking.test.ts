import { describe, expect, it } from 'vitest';
import { determineRelativeAttackArc } from '@/sim/battle/FacingAndFlanking';
import { createTestUnit } from '@tests/mocks/unitMocks';

describe('determineRelativeAttackArc', () => {
  const defenderFacingNorth = createTestUnit({
    position: { column: 5, row: 5 },
    facing: 'north',
  });

  it('reports a back attack when the attacker stands behind the defender', () => {
    const attackerBehind = createTestUnit({ position: { column: 5, row: 7 } });
    expect(determineRelativeAttackArc(attackerBehind, defenderFacingNorth)).toBe('back');
  });

  it('reports a front attack when the attacker stands where the defender looks', () => {
    const attackerInFront = createTestUnit({ position: { column: 5, row: 3 } });
    expect(determineRelativeAttackArc(attackerInFront, defenderFacingNorth)).toBe('front');
  });

  it('reports a side attack when the attacker stands to the flank', () => {
    const attackerToTheEast = createTestUnit({ position: { column: 7, row: 5 } });
    expect(determineRelativeAttackArc(attackerToTheEast, defenderFacingNorth)).toBe('side');
  });
});
