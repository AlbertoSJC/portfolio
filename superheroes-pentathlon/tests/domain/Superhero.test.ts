import { Superhero } from '@domain/Superhero';
import { SuperheroAttributes } from '@domain/SuperheroAttributes';
import { mockPartialSuperheroData, mockSuperheroData } from '@tests/mocks/superheroMocks';
import { describe, expect, test } from 'vitest';

describe('Superhero', () => {
  test('should create a Superhero instance with all properties', () => {
    const hero = new Superhero(mockSuperheroData);

    expect(hero.id).toBe(mockSuperheroData.id);
    expect(hero.name).toBe(mockSuperheroData.name);
    expect(hero.picture).toBe(mockSuperheroData.picture);
    expect(hero.createdAt).toBe(mockSuperheroData.createdAt);
    expect(hero.updatedAt).toBe(mockSuperheroData.updatedAt);
    expect(hero.attributes).toBeInstanceOf(SuperheroAttributes);
    expect(hero.attributes.agility).toBe(mockSuperheroData.attributes!.agility);
    expect(hero.attributes.strength).toBe(mockSuperheroData.attributes!.strength);
  });

  test('should default name and picture to empty string when not provided', () => {
    const hero = new Superhero(mockPartialSuperheroData);

    expect(hero.name).toBe('');
    expect(hero.picture).toBe('');
  });

  test('should default attributes to zero values when not provided', () => {
    const hero = new Superhero(mockPartialSuperheroData);

    expect(hero.attributes).toBeInstanceOf(SuperheroAttributes);
    expect(hero.attributes.agility).toBe(0);
    expect(hero.attributes.strength).toBe(0);
    expect(hero.attributes.weight).toBe(0);
    expect(hero.attributes.endurance).toBe(0);
    expect(hero.attributes.charisma).toBe(0);
  });

  test('should leave selected undefined when not provided', () => {
    const hero = new Superhero(mockPartialSuperheroData);

    expect(hero.selected).toBeUndefined();
  });

  test('should preserve the selected value when provided', () => {
    const hero = new Superhero({ ...mockSuperheroData, selected: true });

    expect(hero.selected).toBe(true);
  });
});
