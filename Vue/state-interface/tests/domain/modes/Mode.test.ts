import Mode from '@domain/modes/Mode';
import type { ToggleItems } from '@components/types/types';

describe('Domain > Mode', () => {
  let mode: Mode;

  const modeData: ToggleItems = {
    image: '/src/images/modes/cool-air.svg',
    title: 'Cool Air',
    active: true,
  };

  beforeEach(() => {
    mode = new Mode(modeData);
  });

  test('Should initialize with given data', () => {
    expect(mode.image).toBe(modeData.image);
    expect(mode.title).toBe(modeData.title);
    expect(mode.active).toBe(modeData.active);
  });

  test('Should create an empty mode', () => {
    const emptyMode = Mode.createEmpty();
    expect(emptyMode.image).toBe('');
    expect(emptyMode.title).toBe('');
    expect(emptyMode.active).toBe(false);
  });

  test('Should toggle mode activation', () => {
    mode.modeActivation();
    expect(mode.active).toBe(false);
    mode.modeActivation();
    expect(mode.active).toBe(true);
  });
});
