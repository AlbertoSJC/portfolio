import { type SuperheroInformation } from '@models/typesFile';
import { Superhero } from './Superhero';

export class SuperheroesList {
  superheroes: Superhero[];

  constructor(data?: SuperheroInformation[]) {
    this.superheroes = data ? data.map((item) => new Superhero(item)) : [];
  }

  getSuperheroById(id: string): Superhero | void {
    return this.superheroes?.find((superhero) => superhero.id === id);
  }

  getSuperheroIndex(superhero: Superhero): number {
    return this.superheroes?.findIndex((listHero) => listHero.id === superhero.id) ?? -1;
  }

  toggleSuperheroSelect(superhero: Superhero) {
    const index = this.getSuperheroIndex(superhero);
    if (!isNaN(index)) this.superheroes[index].selected = !this.superheroes[index].selected;
  }

  addSuperhero(superhero: SuperheroInformation) {
    this.superheroes?.push(new Superhero(superhero));
  }

  updateSuperhero(superhero: Superhero) {
    const index = this.getSuperheroIndex(superhero);
    if (!isNaN(index)) this.superheroes[index] = superhero;
  }

  removeSuperhero(superhero: Superhero) {
    const index = this.getSuperheroIndex(superhero);
    if (!isNaN(index)) this.superheroes?.splice(index, 1);
  }
}
