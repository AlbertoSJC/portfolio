import { SuperheroAttributes } from '@domain/SuperheroAttributes';
import { describe, expect, test } from 'vitest';

describe('SuperheroAttributes', () => {
  test('should create an instance with all provided attributes', () => {
    const attrs = new SuperheroAttributes({ agility: 8, strength: 7, weight: 5, endurance: 6, charisma: 4 });

    expect(attrs.agility).toBe(8);
    expect(attrs.strength).toBe(7);
    expect(attrs.weight).toBe(5);
    expect(attrs.endurance).toBe(6);
    expect(attrs.charisma).toBe(4);
  });

  test('should default all attributes to 0 when no data is provided', () => {
    const attrs = new SuperheroAttributes();

    expect(attrs.agility).toBe(0);
    expect(attrs.strength).toBe(0);
    expect(attrs.weight).toBe(0);
    expect(attrs.endurance).toBe(0);
    expect(attrs.charisma).toBe(0);
  });

  test('should default missing attributes to 0 when data is partial', () => {
    const attrs = new SuperheroAttributes({ agility: 5 } as any);

    expect(attrs.agility).toBe(5);
    expect(attrs.strength).toBe(0);
    expect(attrs.weight).toBe(0);
    expect(attrs.endurance).toBe(0);
    expect(attrs.charisma).toBe(0);
  });
});
