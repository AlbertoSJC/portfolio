import { goalsUsageInformation, UsageTypes } from '@components/landing/usage/info';
import Goals from '@domain/Goals';
import Mode from '@domain/modes/Mode';
import RoomService from '@domain/room-services/RoomService';
import { useOperaStore } from '@stores/opera';
import { MENU_ITEMS, MODES, ModesLiterals, SERVICES } from '@stores/opera-content/cards-info';
import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

describe('Stores > Opera', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
  });

  test('Should initialize with default state', () => {
    store = useOperaStore();
    expect(store.roomServices.services).toStrictEqual(SERVICES.map((service) => new RoomService(service)));
    expect(store.allModes.modes).toStrictEqual(MODES.map((mode) => new Mode(mode)));
    expect(store.currentUsage.generalTemperature).toBe(store.roomServices.calculateMedianTemperature());
    expect(store.menuItems).toStrictEqual(MENU_ITEMS);
    expect(store.showGoalsPage).toBeFalsy();
    expect(store.goals).toStrictEqual(Goals.createEmpty());
  });

  test('Should change showGoalsPage to true', () => {
    store = useOperaStore();
    store.toggleShowGoalsPage();
    expect(store.showGoalsPage).toBeTruthy();
  });

  test('Should update goals with given value when toggling goals', () => {
    store = useOperaStore();
    store.toggleShowGoalsPage(goalsUsageInformation[UsageTypes.Water]);
    expect(store.goals).toStrictEqual(goalsUsageInformation[UsageTypes.Water]);
  });

  test('should update generalTemperature and humidity when roomServices changes', async () => {
    expect(store.currentUsage.generalTemperature).toBe(20);
    expect(store.currentUsage.humidity).toBe(19);
    store.roomServices.services[0].temperature = 90;
    await flushPromises();
    expect(store.currentUsage.humidity).toBe(4);
    expect(store.currentUsage.generalTemperature).toBe(38);
    expect(store.currentUsage.generalTemperature).toBe(store.roomServices.calculateMedianTemperature());
  });

  test('should update currentUsage.humidity when cool air changes', async () => {
    expect(store.currentUsage.humidity).toBe(4);
    store.allModes.modes[store.allModes.findIndexByTitle(ModesLiterals.CoolAir)].modeActivation();
    await flushPromises();
    expect(store.currentUsage.humidity).toBe(34);
    expect(store.currentUsage.humidity).toBe(store.currentUsage.humidity);
  });

  test('Should reset to default state', async () => {
    store.roomServices.services[0].temperature = 30;
    store.currentUsage.generalTemperature = 30;
    store.allModes.modes[0].active = false;
    store.menuItems[0].active = false;
    store.goals = new Goals({ energy: 200, trees: 100, credits: 400 });
    store.showGoalsPage = true;

    await store.resetStore();

    expect(store.roomServices.services).toStrictEqual(SERVICES.map((service) => new RoomService(service)));
    expect(store.allModes.modes).toStrictEqual(MODES.map((mode) => new Mode(mode)));
    expect(store.currentUsage.generalTemperature).toBe(store.roomServices.calculateMedianTemperature());
    expect(store.menuItems).toStrictEqual(MENU_ITEMS);
    expect(store.showGoalsPage).toBeFalsy();
    expect(store.goals).toStrictEqual(Goals.createEmpty());
  });
});
