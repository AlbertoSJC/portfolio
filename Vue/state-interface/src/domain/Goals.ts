import type { GoalsData } from '@components/types/types';

export default class Goals {
  energy: number;
  trees: number;
  credits: number;

  constructor(goal: GoalsData) {
    this.energy = goal.energy;
    this.trees = goal.trees;
    this.credits = goal.credits;
  }

  public static createEmpty(): Goals {
    return new Goals({
      energy: 0,
      trees: 0,
      credits: 0,
    });
  }
}
