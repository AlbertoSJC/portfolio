import { describe, expect, it } from 'vitest';
import {
  calculateDamageBeforeDice,
  calculateHitChance,
} from '../../../src/sim/battle/DamageCalculation';
import {
  BACK_ATTACK_HIT_CHANCE_BONUS,
  BASE_HIT_CHANCE,
  BLIND_HIT_CHANCE_PENALTY,
  SIDE_ATTACK_HIT_CHANCE_BONUS,
} from '../../../src/sim/battle/combatConstants';
import type { DamageSkillEffect } from '../../../src/sim/battle/SkillDefinition';
import { createTestUnit } from '../../mocks/unitMocks';

const PLAIN_PHYSICAL_EFFECT: DamageSkillEffect = {
  kind: 'damage',
  damageSource: 'physical',
  powerMultiplier: 1.0,
};

describe('calculateDamageBeforeDice', () => {
  it('subtracts half the defense from physical damage', () => {
    const attacker = createTestUnit({ baseStatistics: { attack: 10 } });
    const defender = createTestUnit({ baseStatistics: { defense: 6 } });
    // 10 × 1.0 − 6 × 0.5 = 7
    expect(calculateDamageBeforeDice(attacker, defender, PLAIN_PHYSICAL_EFFECT, 'front')).toBe(7);
  });

  it('subtracts half the magic resistance from magical damage', () => {
    const attacker = createTestUnit({ baseStatistics: { magicPower: 8 } });
    const defender = createTestUnit({ baseStatistics: { magicResistance: 4 } });
    const magicalEffect: DamageSkillEffect = {
      kind: 'damage',
      damageSource: 'magical',
      powerMultiplier: 1.5,
    };
    // 8 × 1.5 − 4 × 0.5 = 10
    expect(calculateDamageBeforeDice(attacker, defender, magicalEffect, 'front')).toBe(10);
  });

  it('adds the flanking power bonus only outside the front arc', () => {
    const attacker = createTestUnit({ baseStatistics: { attack: 10 } });
    const defender = createTestUnit({ baseStatistics: { defense: 6 } });
    const flankingEffect: DamageSkillEffect = {
      kind: 'damage',
      damageSource: 'physical',
      powerMultiplier: 1.0,
      flankingPowerBonus: 0.6,
    };
    // Front: 10 × 1.0 − 3 = 7 — Back: 10 × 1.6 − 3 = 13
    expect(calculateDamageBeforeDice(attacker, defender, flankingEffect, 'front')).toBe(7);
    expect(calculateDamageBeforeDice(attacker, defender, flankingEffect, 'back')).toBe(13);
  });

  it('multiplies damage by an elemental weakness', () => {
    const attacker = createTestUnit({ baseStatistics: { attack: 10 } });
    const defender = createTestUnit({
      baseStatistics: { defense: 6 },
      elementalAffinities: { fire: 2 },
    });
    const fireEffect: DamageSkillEffect = {
      kind: 'damage',
      damageSource: 'physical',
      powerMultiplier: 1.0,
      element: 'fire',
    };
    expect(calculateDamageBeforeDice(attacker, defender, fireEffect, 'front')).toBe(14);
  });

  it('returns negative damage when the defender absorbs the element', () => {
    const attacker = createTestUnit({ baseStatistics: { magicPower: 8 } });
    const undeadDefender = createTestUnit({
      baseStatistics: { magicResistance: 4 },
      elementalAffinities: { dark: -1 },
    });
    const darkEffect: DamageSkillEffect = {
      kind: 'damage',
      damageSource: 'magical',
      powerMultiplier: 1.0,
      element: 'dark',
    };
    expect(calculateDamageBeforeDice(attacker, undeadDefender, darkEffect, 'front')).toBeLessThan(0);
  });

  it('never deals less than the minimum damage on a connecting hit', () => {
    const weakAttacker = createTestUnit({ baseStatistics: { attack: 1 } });
    const armoredDefender = createTestUnit({ baseStatistics: { defense: 100 } });
    expect(
      calculateDamageBeforeDice(weakAttacker, armoredDefender, PLAIN_PHYSICAL_EFFECT, 'front'),
    ).toBe(1);
  });
});

describe('calculateHitChance', () => {
  it('uses the base chance minus evasion from the front', () => {
    const attacker = createTestUnit();
    const defender = createTestUnit({ baseStatistics: { evasion: 0.1 } });
    expect(calculateHitChance(attacker, defender, 'front')).toBeCloseTo(BASE_HIT_CHANCE - 0.1);
  });

  it('grants the side and back bonuses', () => {
    const attacker = createTestUnit();
    const defender = createTestUnit({ baseStatistics: { evasion: 0 } });
    expect(calculateHitChance(attacker, defender, 'side')).toBeCloseTo(
      BASE_HIT_CHANCE + SIDE_ATTACK_HIT_CHANCE_BONUS,
    );
    expect(calculateHitChance(attacker, defender, 'back')).toBeCloseTo(
      Math.min(1, BASE_HIT_CHANCE + BACK_ATTACK_HIT_CHANCE_BONUS),
    );
  });

  it('applies the blind penalty when the attacker is blinded', () => {
    const blindedAttacker = createTestUnit({
      activeStatusEffects: [{ kind: 'blind', remainingTurns: 2, sourceSkillName: 'Smoke Dart' }],
    });
    const defender = createTestUnit({ baseStatistics: { evasion: 0 } });
    expect(calculateHitChance(blindedAttacker, defender, 'front')).toBeCloseTo(
      BASE_HIT_CHANCE - BLIND_HIT_CHANCE_PENALTY,
    );
  });
});
