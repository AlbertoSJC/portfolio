import { describe, expect, it } from 'vitest';
import { tickDownStatusEffects, tickDownStatModifiers } from '../../../src/sim/units/Unit';
import { createTestUnit } from '../../mocks/unitMocks';

describe('tickDownStatusEffects', () => {
  it('decrements remainingTurns on each active effect', () => {
    const unit = createTestUnit({
      activeStatusEffects: [
        { kind: 'poison', remainingTurns: 3, sourceSkillName: 'Venom Strike' },
        { kind: 'blind', remainingTurns: 2, sourceSkillName: 'Smoke Dart' },
      ],
    });
    tickDownStatusEffects(unit);
    expect(unit.activeStatusEffects[0]?.remainingTurns).toBe(2);
    expect(unit.activeStatusEffects[1]?.remainingTurns).toBe(1);
  });

  it('removes effects whose remainingTurns reaches zero', () => {
    const unit = createTestUnit({
      activeStatusEffects: [
        { kind: 'sleep', remainingTurns: 1, sourceSkillName: 'Sleep Dust' },
        { kind: 'poison', remainingTurns: 2, sourceSkillName: 'Venom Strike' },
      ],
    });
    tickDownStatusEffects(unit);
    expect(unit.activeStatusEffects).toHaveLength(1);
    expect(unit.activeStatusEffects[0]?.kind).toBe('poison');
  });

  it('leaves an empty array when no effects are active', () => {
    const unit = createTestUnit();
    tickDownStatusEffects(unit);
    expect(unit.activeStatusEffects).toHaveLength(0);
  });
});

describe('tickDownStatModifiers', () => {
  it('removes expired stat modifiers', () => {
    const unit = createTestUnit({
      activeStatModifiers: [
        { statistic: 'attack', amount: 4, remainingTurns: 1, sourceSkillName: 'War Cry' },
      ],
    });
    tickDownStatModifiers(unit);
    expect(unit.activeStatModifiers).toHaveLength(0);
  });
});
