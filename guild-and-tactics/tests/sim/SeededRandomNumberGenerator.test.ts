import { describe, expect, it } from 'vitest';
import { SeededRandomNumberGenerator } from '../../src/sim/SeededRandomNumberGenerator';

describe('SeededRandomNumberGenerator', () => {
  it('produces the identical sequence for the same seed', () => {
    const firstGenerator = new SeededRandomNumberGenerator(12345);
    const secondGenerator = new SeededRandomNumberGenerator(12345);
    for (let drawIndex = 0; drawIndex < 50; drawIndex += 1) {
      expect(firstGenerator.nextFraction()).toBe(secondGenerator.nextFraction());
    }
  });

  it('produces different sequences for different seeds', () => {
    const firstGenerator = new SeededRandomNumberGenerator(1);
    const secondGenerator = new SeededRandomNumberGenerator(2);
    const firstDraws = Array.from({ length: 10 }, () => firstGenerator.nextFraction());
    const secondDraws = Array.from({ length: 10 }, () => secondGenerator.nextFraction());
    expect(firstDraws).not.toEqual(secondDraws);
  });

  it('keeps fractions within [0, 1)', () => {
    const generator = new SeededRandomNumberGenerator(99);
    for (let drawIndex = 0; drawIndex < 1000; drawIndex += 1) {
      const fraction = generator.nextFraction();
      expect(fraction).toBeGreaterThanOrEqual(0);
      expect(fraction).toBeLessThan(1);
    }
  });

  it('keeps integers within the inclusive bounds', () => {
    const generator = new SeededRandomNumberGenerator(7);
    for (let drawIndex = 0; drawIndex < 1000; drawIndex += 1) {
      const integer = generator.nextIntegerBetween(3, 6);
      expect(integer).toBeGreaterThanOrEqual(3);
      expect(integer).toBeLessThanOrEqual(6);
    }
  });
});
