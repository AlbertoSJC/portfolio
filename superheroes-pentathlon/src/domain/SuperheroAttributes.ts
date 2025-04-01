import { type SuperheroAttributesInformation } from '@models/typesFile';

export class SuperheroAttributes {
  agility: number;
  strength: number;
  weight: number;
  endurance: number;
  charisma: number;

  constructor(data?: SuperheroAttributesInformation) {
    this.agility = data?.agility ?? 0;
    this.strength = data?.strength ?? 0;
    this.weight = data?.weight ?? 0;
    this.endurance = data?.endurance ?? 0;
    this.charisma = data?.charisma ?? 0;
  }
}
