import { useOperaStore } from '@stores/opera';
import { ModesLiterals } from '@stores/opera-content/cards-info';
import { useCalculateOutputsWatcher } from '@stores/watchers/useCalculateOutputsWatcher';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect } from 'vitest';

describe('useCalculateOutputsWatcher', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
  });

  afterEach(() => {
    store.$reset();
  });

  test('should update currentUsage.generalTemperature when roomServices changes', async () => {
    useCalculateOutputsWatcher(store.roomServices, store.currentUsage, store.allModes);
    expect(store.currentUsage.generalTemperature).toBe(20);
    store.roomServices.services[0].temperature = 35;
    await flushPromises();
    expect(store.currentUsage.generalTemperature).toBe(24);
    expect(store.currentUsage.generalTemperature).toBe(store.roomServices.calculateMedianTemperature());
  });

  test('should update currentUsage.humidity when roomServices changes', async () => {
    useCalculateOutputsWatcher(store.roomServices, store.currentUsage, store.allModes);
    expect(store.currentUsage.humidity).toBe(19);
    store.roomServices.services[0].temperature = 5;
    store.roomServices.services[1].temperature = 5;
    store.roomServices.services[2].temperature = 5;
    await flushPromises();
    expect(store.currentUsage.humidity).toBe(14);
    expect(store.currentUsage.humidity).toBe(store.currentUsage.humidity);
  });

  test('should update currentUsage.humidity when cool air changes', async () => {
    useCalculateOutputsWatcher(store.roomServices, store.currentUsage, store.allModes);
    expect(store.currentUsage.humidity).toBe(19);
    store.allModes.modes[store.allModes.findIndexByTitle(ModesLiterals.CoolAir)].modeActivation();
    await flushPromises();
    expect(store.currentUsage.humidity).toBe(40);
    expect(store.currentUsage.humidity).toBe(store.currentUsage.humidity);
  });
});
