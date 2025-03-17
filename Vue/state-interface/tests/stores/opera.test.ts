import { goalsUsageInformation, UsageTypes } from '@components/landing/usage/info';
import Goals from '@domain/Goals';
import Service from '@domain/Service';
import { useOperaStore } from '@stores/opera';
import { MENU_ITEMS, MODES, SERVICES } from '@stores/opera-content/cards-info';
import { createPinia, setActivePinia } from 'pinia';

describe('Stores > Opera', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
  });

  test('Should initialize with default state', () => {
    store = useOperaStore();
    expect(store.services).toStrictEqual(SERVICES.map((service) => new Service(service)));
    expect(store.modes).toStrictEqual(MODES);
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
});
