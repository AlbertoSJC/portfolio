import { Superhero } from '@domain/Superhero';
import { SuperheroesList } from '@domain/SuperheroesList';
import { mockSuperheroData } from '@tests/mocks/superheroMocks';
import { beforeEach, describe, expect, test } from 'vitest';

const mockData = [
  { ...mockSuperheroData, id: '1', name: 'Iron Fist' },
  { ...mockSuperheroData, id: '2', name: 'Black Widow' },
];

describe('SuperheroesList', () => {
  let list: SuperheroesList;

  beforeEach(() => {
    list = new SuperheroesList();
  });

  test('should initialize with an empty array when no data is provided', () => {
    expect(list.superheroes).toEqual([]);
  });

  test('should initialize with superheroes when data is provided', () => {
    list = new SuperheroesList(mockData);

    expect(list.superheroes).toHaveLength(2);
    expect(list.superheroes[0].id).toBe('1');
    expect(list.superheroes[1].id).toBe('2');
  });

  test('should map raw data to Superhero instances', () => {
    list = new SuperheroesList(mockData);

    expect(list.superheroes[0]).toBeInstanceOf(Superhero);
  });

  test('should find a superhero by id', () => {
    list = new SuperheroesList(mockData);

    const hero = list.getSuperheroById('1');
    expect(hero).toBeDefined();
    expect(hero?.name).toBe('Iron Fist');
  });

  test('should return undefined when superhero is not found by id', () => {
    list = new SuperheroesList(mockData);

    const hero = list.getSuperheroById('999');
    expect(hero).toBeUndefined();
  });

  test('should get the index of a superhero', () => {
    list = new SuperheroesList(mockData);
    const hero = new Superhero(mockData[0]);

    const index = list.getSuperheroIndex(hero);
    expect(index).toBe(0);
  });

  test('should return -1 when superhero index is not found', () => {
    list = new SuperheroesList(mockData);
    const unknownHero = new Superhero({ ...mockSuperheroData, id: '999' });

    const index = list.getSuperheroIndex(unknownHero);
    expect(index).toBe(-1);
  });

  test('should add a superhero to the list', () => {
    const hero = { ...mockSuperheroData, id: '3', name: 'Thor' };
    list.addSuperhero(hero);

    expect(list.superheroes).toHaveLength(1);
    expect(list.superheroes[0].id).toBe('3');
  });

  test('should toggle the selected state of a superhero', () => {
    list = new SuperheroesList(mockData);

    list.toggleSuperheroSelect(list.superheroes[0]);
    expect(list.superheroes[0].selected).toBe(true);

    list.toggleSuperheroSelect(list.superheroes[0]);
    expect(list.superheroes[0].selected).toBe(false);
  });

  test('should update an existing superhero', () => {
    list = new SuperheroesList(mockData);
    const updatedHero = new Superhero({ ...mockData[0], name: 'Updated Iron Fist' });

    list.updateSuperhero(updatedHero);
    expect(list.superheroes[0].name).toBe('Updated Iron Fist');
  });

  test('should remove a superhero from the list', () => {
    list = new SuperheroesList(mockData);
    const heroToRemove = new Superhero(mockData[0]);

    list.removeSuperhero(heroToRemove);
    expect(list.superheroes).toHaveLength(1);
    expect(list.superheroes[0].id).toBe('2');
  });
});
