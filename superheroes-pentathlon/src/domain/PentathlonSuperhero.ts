import { type SuperheroInformation } from '@models/typesFile';
import { Superhero } from './Superhero';

export interface PentathlonSuperheroInformation extends SuperheroInformation {
  totalPoints?: number;
  lastTrialPoints?: number;
  numberOfTrialsWon?: number;
  currentTrialOutput?: number;
}

export class PentathlonSuperhero extends Superhero implements PentathlonSuperheroInformation {
  totalPoints: number;
  lastTrialPoints: number;
  numberOfTrialsWon: number;
  currentTrialOutput: number;

  constructor(data: PentathlonSuperheroInformation) {
    super(data);
    this.totalPoints = data.totalPoints ?? 0;
    this.lastTrialPoints = data.lastTrialPoints ?? 0;
    this.numberOfTrialsWon = data.numberOfTrialsWon ?? 0;
    this.currentTrialOutput = data.currentTrialOutput ?? 0;
  }

  resetHeroPoints() {
    this.currentTrialOutput = 0;
    this.totalPoints = 0;
    this.lastTrialPoints = 0;
    this.numberOfTrialsWon = 0;
  }

  calculateSkyscraperClimbing() {
    this.currentTrialOutput = this.attributes.strength * 4 - this.attributes.weight * 2;
  }

  calculateJokeTelling(othersCharisma: number) {
    this.currentTrialOutput = this.attributes.charisma * this.attributes.charisma - othersCharisma;
  }

  calculateShotTheVillain(lastClasification: boolean) {
    this.currentTrialOutput = this.attributes.agility + this.attributes.strength + (lastClasification ? 5 : 0);
  }

  calculateTwoHundredKm() {
    this.currentTrialOutput = this.attributes.agility * 4 + this.attributes.endurance * 2 + (this.lastTrialPoints === 5 ? 10 : -1);
  }

  calculateHundredKittenRescue() {
    this.currentTrialOutput = this.attributes.agility * 2 + (this.numberOfTrialsWon >= 2 ? 5 : 0);
  }
}
