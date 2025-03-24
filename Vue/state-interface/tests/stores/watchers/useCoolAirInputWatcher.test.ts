import { useOperaStore } from '@stores/opera';
import { ModesLiterals } from '@stores/opera-content/cards-info';
import { useCoolAirInputWatcher } from '@stores/watchers/useCoolAirInputWatcher';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

describe('useCoolAirInputWatcher', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
  });

  afterEach(() => {
    store.resetStore();
  });

  test('should call updateTemperatureWithCoolAir when cool air mode is activated', async () => {
    const spy = vi.spyOn(store.roomServices, 'updateTemperatureWithCoolAir');
    useCoolAirInputWatcher(store.roomServices, store.allModes);

    store.allModes.modes[store.allModes.findIndexByTitle(ModesLiterals.CoolAir)].modeActivation();
    await flushPromises();

    expect(spy).toHaveBeenCalledWith(true);
    spy.mockRestore();
  });

  test('should call updateTemperatureWithCoolAir when cool air mode is deactivated', async () => {
    const spy = vi.spyOn(store.roomServices, 'updateTemperatureWithCoolAir');
    useCoolAirInputWatcher(store.roomServices, store.allModes);

    store.allModes.modes[store.allModes.findIndexByTitle(ModesLiterals.CoolAir)].modeActivation(); // Activate cool air
    await flushPromises();
    store.allModes.modes[store.allModes.findIndexByTitle(ModesLiterals.CoolAir)].modeActivation(); // Deactivate cool air
    await flushPromises();

    expect(spy).toHaveBeenCalledWith(false);
    spy.mockRestore();
  });
});
