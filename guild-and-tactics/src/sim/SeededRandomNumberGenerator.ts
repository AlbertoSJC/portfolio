/**
 * Deterministic pseudo-random number generator (mulberry32).
 * Every battle owns one instance seeded at creation, so a battle replays
 * identically from the same seed and command sequence.
 */
export class SeededRandomNumberGenerator {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Uniform float in [0, 1). */
  nextFraction(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let mixed = this.state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform integer in [minimumInclusive, maximumInclusive]. */
  nextIntegerBetween(minimumInclusive: number, maximumInclusive: number): number {
    const span = maximumInclusive - minimumInclusive + 1;
    return minimumInclusive + Math.floor(this.nextFraction() * span);
  }

  /** True with the given probability (0 = never, 1 = always). */
  rollChance(probability: number): boolean {
    return this.nextFraction() < probability;
  }
}
