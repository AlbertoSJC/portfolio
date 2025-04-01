import Goals, { type GoalsData } from '@domain/Goals';

describe('Domain > Goals', () => {
  let goals: Goals;

  const goalsData: GoalsData = {
    energy: 100,
    trees: 50,
    credits: 200,
  };

  beforeEach(() => {
    goals = new Goals(goalsData);
  });

  test('Should initialize with given data', () => {
    expect(goals.energy).toBe(goalsData.energy);
    expect(goals.trees).toBe(goalsData.trees);
    expect(goals.credits).toBe(goalsData.credits);
  });

  test('Should create an empty goals', () => {
    const emptyGoals = Goals.createEmpty();
    expect(emptyGoals.energy).toBe(0);
    expect(emptyGoals.trees).toBe(0);
    expect(emptyGoals.credits).toBe(0);
  });

  test('Should update goals properties', () => {
    goals.energy = 150;
    goals.trees = 75;
    goals.credits = 250;

    expect(goals.energy).toBe(150);
    expect(goals.trees).toBe(75);
    expect(goals.credits).toBe(250);
  });
});
