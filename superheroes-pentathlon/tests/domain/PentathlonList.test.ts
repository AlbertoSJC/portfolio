import { PentathlonList } from '@domain/PentathlonList';
import { PentathlonSuperhero } from '@domain/PentathlonSuperhero';
import { describe, beforeEach, expect, test } from 'vitest';

const heroA = { id: '1', name: 'Alpha', attributes: { agility: 8, strength: 9, weight: 4, endurance: 7, charisma: 6 } };
const heroB = { id: '2', name: 'Beta', attributes: { agility: 5, strength: 5, weight: 6, endurance: 5, charisma: 9 } };
const heroC = { id: '3', name: 'Gamma', attributes: { agility: 3, strength: 4, weight: 8, endurance: 3, charisma: 3 } };
const heroD = { id: '4', name: 'Delta', attributes: { agility: 7, strength: 6, weight: 5, endurance: 6, charisma: 7 } };

describe('PentathlonList', () => {
  let list: PentathlonList;

  beforeEach(() => {
    list = new PentathlonList();
  });

  test('should initialize with an empty array when no data is provided', () => {
    expect(list.superheroes).toEqual([]);
  });

  test('should initialize with PentathlonSuperhero instances when data is provided', () => {
    list = new PentathlonList([heroA, heroB]);

    expect(list.superheroes).toHaveLength(2);
    expect(list.superheroes[0]).toBeInstanceOf(PentathlonSuperhero);
  });

  test('should get the index of a superhero', () => {
    list = new PentathlonList([heroA, heroB]);

    expect(list.getSuperheroIndex(heroA)).toBe(0);
    expect(list.getSuperheroIndex(heroB)).toBe(1);
  });

  test('should return -1 when superhero is not found', () => {
    list = new PentathlonList([heroA]);

    expect(list.getSuperheroIndex({ id: '999' })).toBe(-1);
  });

  test('should add a superhero to the list', () => {
    list.addSuperhero(heroA);

    expect(list.superheroes).toHaveLength(1);
    expect(list.superheroes[0].id).toBe('1');
  });

  test('should remove a superhero from the list', () => {
    list = new PentathlonList([heroA, heroB]);
    list.removeSuperhero(heroA);

    expect(list.superheroes).toHaveLength(1);
    expect(list.superheroes[0].id).toBe('2');
  });

  test('should reorder competitors by currentTrialOutput descending', () => {
    list = new PentathlonList([heroA, heroB]);
    list.superheroes[0].currentTrialOutput = 10;
    list.superheroes[1].currentTrialOutput = 30;

    list.reorderCompetitorsOfTrial();

    expect(list.superheroes[0].currentTrialOutput).toBe(30);
    expect(list.superheroes[1].currentTrialOutput).toBe(10);
  });

  test('should reorder by totalPoints descending', () => {
    list = new PentathlonList([heroA, heroB]);
    list.superheroes[0].totalPoints = 5;
    list.superheroes[1].totalPoints = 10;

    list.reorderByTotalPoints();

    expect(list.superheroes[0].totalPoints).toBe(10);
    expect(list.superheroes[1].totalPoints).toBe(5);
  });

  test('should assign 5 points to 1st, 3 to 2nd, 2 to 3rd, 1 to 4th', () => {
    list = new PentathlonList([heroA, heroB, heroC, heroD]);

    list.assignPoints();

    expect(list.superheroes[0].totalPoints).toBe(5);
    expect(list.superheroes[0].lastTrialPoints).toBe(5);
    expect(list.superheroes[0].numberOfTrialsWon).toBe(1);

    expect(list.superheroes[1].totalPoints).toBe(3);
    expect(list.superheroes[1].lastTrialPoints).toBe(3);
    expect(list.superheroes[1].numberOfTrialsWon).toBe(0);

    expect(list.superheroes[2].totalPoints).toBe(2);
    expect(list.superheroes[3].totalPoints).toBe(1);
  });

  test('should run skyscraperClimbing and assign points correctly', () => {
    // heroA: strength(9)*4 - weight(4)*2 = 36-8 = 28
    // heroB: strength(5)*4 - weight(6)*2 = 20-12 = 8
    // heroA wins
    list = new PentathlonList([heroA, heroB]);

    list.skyscraperClimbing();

    expect(list.superheroes[0].id).toBe('1'); // Alpha won
    expect(list.superheroes[0].totalPoints).toBe(5);
    expect(list.superheroes[1].totalPoints).toBe(3);
  });

  test('should run executePentathlon and produce a ranked result', () => {
    list = new PentathlonList([heroA, heroB, heroC, heroD]);

    list.executePentathlon();

    expect(list.superheroes).toHaveLength(4);
    // After executePentathlon, heroes are sorted by totalPoints descending
    expect(list.superheroes[0].totalPoints).toBeGreaterThanOrEqual(list.superheroes[1].totalPoints);
    expect(list.superheroes[1].totalPoints).toBeGreaterThanOrEqual(list.superheroes[2].totalPoints);
    expect(list.superheroes[2].totalPoints).toBeGreaterThanOrEqual(list.superheroes[3].totalPoints);
  });

  test('should give all heroes positive total points after executePentathlon', () => {
    list = new PentathlonList([heroA, heroB, heroC, heroD]);

    list.executePentathlon();

    list.superheroes.forEach((hero) => {
      expect(hero.totalPoints).toBeGreaterThan(0);
    });
  });
});
