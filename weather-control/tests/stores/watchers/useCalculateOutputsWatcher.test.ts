import { useOperaStore } from '@stores/opera';
import { ModesLiterals } from '@stores/opera-content/cards-info';
import { useCalculateOutputsWatcher } from '@stores/watchers/useCalculateOutputsWatcher';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, beforeAll, afterEach, test, vi } from 'vitest';

describe('useCalculateOutputsWatcher', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
  });

  afterEach(() => {
    store.resetStore();
  });

  test('should call calculateMedianTemperature when roomServices changes', async () => {
    const calculateMedianTemperatureSpy = vi.spyOn(store.roomServices, 'calculateMedianTemperature');
    useCalculateOutputsWatcher(store.roomServices, store.currentUsage, store.allModes);

    store.roomServices.services[0].temperature = 35;
    await flushPromises();

    expect(calculateMedianTemperatureSpy).toHaveBeenCalled();
    calculateMedianTemperatureSpy.mockRestore();
  });

  test('should call updateHumidity when roomServices changes', async () => {
    const updateHumiditySpy = vi.spyOn(store.currentUsage, 'updateHumidity');
    useCalculateOutputsWatcher(store.roomServices, store.currentUsage, store.allModes);

    store.roomServices.services[0].temperature = 5;
    store.roomServices.services[1].temperature = 5;
    store.roomServices.services[2].temperature = 5;
    await flushPromises();

    expect(updateHumiditySpy).toHaveBeenCalled();
    updateHumiditySpy.mockRestore();
  });

  test('should call updateHumidity when cool air changes', async () => {
    const updateHumiditySpy = vi.spyOn(store.currentUsage, 'updateHumidity');
    useCalculateOutputsWatcher(store.roomServices, store.currentUsage, store.allModes);

    store.allModes.modes[store.allModes.findIndexByTitle(ModesLiterals.CoolAir)].modeActivation();
    await flushPromises();

    expect(updateHumiditySpy).toHaveBeenCalled();
    updateHumiditySpy.mockRestore();
  });
});
