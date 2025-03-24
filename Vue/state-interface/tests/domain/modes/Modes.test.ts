import type Mode from '@domain/modes/Mode';
import Modes from '@domain/modes/Modes';
import { MODES } from '@stores/opera-content/cards-info';

const defaultModes = MODES as Mode[];

describe('Domain > Modes', () => {
  let modes: Modes;

  beforeEach(() => {
    modes = new Modes(defaultModes);
  });

  test('Should initialize with given data', () => {
    expect(modes.modes.length).toBe(3);
    expect(modes.modes[0].title).toBe('Cool Air');
    expect(modes.modes[1].title).toBe('Eco');
    expect(modes.modes[2].title).toBe('Silent');
  });

  test('Should create an empty modes', () => {
    const emptyModes = Modes.createEmpty();
    expect(emptyModes.modes.length).toBe(1);
    expect(emptyModes.modes[0].title).toBe('');
  });

  test('Should toggle mode activation', () => {
    modes.modesToggling(1);
    expect(modes.modes[1].active).toBe(true);
    modes.modesToggling(1);
    expect(modes.modes[1].active).toBe(false);
  });
});
