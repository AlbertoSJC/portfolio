import { useOperaStore } from '@stores/opera';
import { MENU_ITEMS, MODES, SERVICES } from '@stores/opera-content/cards-info';
import { createPinia, setActivePinia } from 'pinia';

describe('Stores > Opera', () => {
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
  });

  test('Should initialize with default state', () => {
    expect(store.servicesState).toStrictEqual(SERVICES);
    expect(store.modes).toStrictEqual(MODES);
    expect(store.menuItems).toStrictEqual(MENU_ITEMS);
    expect(store.showGoalsPage).toBe(false);
  });
});
