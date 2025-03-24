import Mode from './Mode';

export default class Modes {
  modes: Mode[];

  constructor(modesData: Mode[]) {
    this.modes = modesData.map((mode) => new Mode(mode));
  }

  modesToggling(index: number) {
    this.modes[index].modeActivation();
  }

  public static createEmpty(): Modes {
    return new Modes([Mode.createEmpty()]);
  }
}
