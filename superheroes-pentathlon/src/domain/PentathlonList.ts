import type { SuperheroInformation } from '@models/typesFile';
import { PentathlonSuperhero, type PentathlonSuperheroInformation } from './PentathlonSuperhero';

export class PentathlonList {
  superheroes: PentathlonSuperhero[];

  constructor(data?: PentathlonSuperheroInformation[]) {
    this.superheroes = data ? data.map((item) => new PentathlonSuperhero(item)) : [];
  }

  getSuperheroIndex(superhero: PentathlonSuperheroInformation): number {
    return this.superheroes?.findIndex((listHero) => listHero.id === superhero.id) ?? -1;
  }

  addSuperhero(superhero: SuperheroInformation) {
    if (!this.superheroes) this.superheroes = [new PentathlonSuperhero(superhero)];
    this.superheroes.push(new PentathlonSuperhero({ ...superhero, selected: false }));
  }

  removeSuperhero(superhero: PentathlonSuperheroInformation) {
    const index = this.getSuperheroIndex(superhero);
    if (!isNaN(index)) this.superheroes?.splice(index, 1);
  }

  reorderCompetitorsOfTrial() {
    this.superheroes.sort((a, b) => b.currentTrialOutput - a.currentTrialOutput);
  }

  reorderByTotalPoints() {
    this.superheroes.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  assignPoints() {
    this.superheroes.forEach((hero, index) => {
      const pointsToAdd = index === 0 ? 5 : index === 1 ? 3 : index === 2 ? 2 : 1;
      hero.totalPoints += pointsToAdd;
      hero.lastTrialPoints = pointsToAdd;
      if (pointsToAdd === 5) hero.numberOfTrialsWon += 1;
    });
  }

  skyscraperClimbing() {
    this.superheroes.forEach((hero) => {
      hero.resetHeroPoints();
      hero.calculateSkyscraperClimbing();
    });

    this.reorderCompetitorsOfTrial();
    this.assignPoints();
  }

  jokeTelling() {
    const totalCharisma = this.superheroes.reduce((sum, superhero) => sum + superhero.attributes.charisma, 0);
    this.superheroes.forEach((hero) => {
      hero.calculateJokeTelling(totalCharisma - hero.attributes.charisma);
    });

    this.reorderCompetitorsOfTrial();
    this.assignPoints();
  }

  villainShooting() {
    const lastIndex = this.superheroes.length - 1;
    this.superheroes.forEach((hero, index) => {
      hero.calculateShotTheVillain(index === lastIndex);
    });

    this.reorderCompetitorsOfTrial();
    this.assignPoints();
  }

  twoHundredKm() {
    this.superheroes.forEach((hero) => {
      hero.calculateTwoHundredKm();
    });

    this.reorderCompetitorsOfTrial();
    this.assignPoints();
  }

  hundredKittenRescue() {
    this.superheroes.forEach((hero) => {
      hero.calculateHundredKittenRescue();
    });

    this.reorderCompetitorsOfTrial();
    this.assignPoints();
  }

  executePentathlon() {
    this.skyscraperClimbing();
    this.jokeTelling();
    this.villainShooting();
    this.twoHundredKm();
    this.hundredKittenRescue();
    this.reorderByTotalPoints();
  }
}
