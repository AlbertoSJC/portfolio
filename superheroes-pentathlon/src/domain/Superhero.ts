import { type SuperheroInformation } from '@models/typesFile';
import { SuperheroAttributes } from './SuperheroAttributes';

export class Superhero implements SuperheroInformation {
  id?: string;
  updatedAt?: string;
  createdAt?: string;
  name?: string;
  picture?: string;
  attributes: SuperheroAttributes;
  selected?: boolean;

  constructor(data: SuperheroInformation) {
    this.id = data.id;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
    this.name = data.name ?? '';
    this.picture = data.picture ?? '';
    this.attributes = new SuperheroAttributes(data.attributes);
    this.selected = data.selected;
  }
}
