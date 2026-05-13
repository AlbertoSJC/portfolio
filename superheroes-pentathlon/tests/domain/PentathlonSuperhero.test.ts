import { PentathlonSuperhero } from '@domain/PentathlonSuperhero';
import { mockSuperheroData } from '@tests/mocks/superheroMocks';
import { beforeEach, describe, expect, test } from 'vitest';

// mockSuperheroData attributes: agility=8, strength=7, weight=5, endurance=6, charisma=4

describe('PentathlonSuperhero', () => {
  let hero: PentathlonSuperhero;

  beforeEach(() => {
    hero = new PentathlonSuperhero(mockSuperheroData);
  });

  test('should initialize with default pentathlon properties', () => {
    expect(hero.totalPoints).toBe(0);
    expect(hero.lastTrialPoints).toBe(0);
    expect(hero.numberOfTrialsWon).toBe(0);
    expect(hero.currentTrialOutput).toBe(0);
  });

  test('should initialize with provided pentathlon properties', () => {
    const hero = new PentathlonSuperhero({ ...mockSuperheroData, totalPoints: 10, lastTrialPoints: 5, numberOfTrialsWon: 2, currentTrialOutput: 30 });

    expect(hero.totalPoints).toBe(10);
    expect(hero.lastTrialPoints).toBe(5);
    expect(hero.numberOfTrialsWon).toBe(2);
    expect(hero.currentTrialOutput).toBe(30);
  });

  test('should reset all hero points to 0', () => {
    hero.totalPoints = 15;
    hero.lastTrialPoints = 5;
    hero.numberOfTrialsWon = 3;
    hero.currentTrialOutput = 42;

    hero.resetHeroPoints();

    expect(hero.totalPoints).toBe(0);
    expect(hero.lastTrialPoints).toBe(0);
    expect(hero.numberOfTrialsWon).toBe(0);
    expect(hero.currentTrialOutput).toBe(0);
  });

  test('should calculate skyscraper climbing output correctly', () => {
    hero.calculateSkyscraperClimbing();

    // strength(7) * 4 - weight(5) * 2 = 28 - 10 = 18
    expect(hero.currentTrialOutput).toBe(18);
  });

  test('should calculate joke telling output correctly', () => {
    hero.calculateJokeTelling(10);

    // charisma(4)^2 - othersCharisma(10) = 16 - 10 = 6
    expect(hero.currentTrialOutput).toBe(6);
  });

  test('should calculate shot the villain output without last classification bonus', () => {
    hero.calculateShotTheVillain(false);

    // agility(8) + strength(7) + 0 = 15
    expect(hero.currentTrialOutput).toBe(15);
  });

  test('should calculate shot the villain output with last classification bonus', () => {
    hero.calculateShotTheVillain(true);

    // agility(8) + strength(7) + 5 = 20
    expect(hero.currentTrialOutput).toBe(20);
  });

  test('should calculate two hundred km output without last trial bonus', () => {
    hero.lastTrialPoints = 0;
    hero.calculateTwoHundredKm();

    // agility(8)*4 + endurance(6)*2 + (-1) = 32 + 12 - 1 = 43
    expect(hero.currentTrialOutput).toBe(43);
  });

  test('should calculate two hundred km output with last trial bonus when lastTrialPoints is 5', () => {
    hero.lastTrialPoints = 5;
    hero.calculateTwoHundredKm();

    // agility(8)*4 + endurance(6)*2 + 10 = 32 + 12 + 10 = 54
    expect(hero.currentTrialOutput).toBe(54);
  });

  test('should calculate hundred kitten rescue output without trials won bonus', () => {
    hero.numberOfTrialsWon = 0;
    hero.calculateHundredKittenRescue();

    // agility(8)*2 + 0 = 16
    expect(hero.currentTrialOutput).toBe(16);
  });

  test('should calculate hundred kitten rescue output with bonus when numberOfTrialsWon is 2 or more', () => {
    hero.numberOfTrialsWon = 2;
    hero.calculateHundredKittenRescue();

    // agility(8)*2 + 5 = 21
    expect(hero.currentTrialOutput).toBe(21);
  });
});
