import { useOperaStore } from '@stores/opera';
import { useRoomServicesWatcher } from '@stores/watchers/useRoomServicesWatcher';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect } from 'vitest';

describe('useRoomServicesWatcher', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
  });

  test('should update currentUsage.generalTemperature when roomServices changes', async () => {
    useRoomServicesWatcher(store.roomServices, store.currentUsage);
    expect(store.currentUsage.generalTemperature).toBe(20);
    store.roomServices.services[0].temperature = 35;
    await flushPromises();
    expect(store.currentUsage.generalTemperature).toBe(store.roomServices.calculateMedianTemperature());
  });

  test('should update currentUsage.humidity when roomServices changes', async () => {
    useRoomServicesWatcher(store.roomServices, store.currentUsage);
    expect(store.currentUsage.humidity).toBe(29);
    store.roomServices.services[1].temperature = 5;
    await flushPromises();
    expect(store.currentUsage.humidity).toBe(30);
    expect(store.currentUsage.humidity).toBe(store.currentUsage.humidity);
  });
});
