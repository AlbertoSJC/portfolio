import { usageInformation, UsageTypes } from '@components/landing/usage/info';
import Goals from '@domain/Goals';
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
    expect(store.servicesState).toStrictEqual(SERVICES);
    expect(store.modesState).toStrictEqual(MODES);
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
    store.toggleShowGoalsPage(usageInformation[UsageTypes.Water]);
    expect(store.goals).toStrictEqual(usageInformation[UsageTypes.Water]);
  });
});
