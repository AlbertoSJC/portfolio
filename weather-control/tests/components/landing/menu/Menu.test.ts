import Menu from '@components/landing/menu/Menu.vue';
import MenuItem from '@components/landing/menu/MenuItem.vue';
import { useOperaStore } from '@stores/opera';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('Menu', () => {
  let store: ReturnType<typeof useOperaStore>;
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());
    wrapper = mount(Menu);
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly', () => {
    store = useOperaStore();
    const mainContainer = wrapper.find('.main-container');

    expect(mainContainer).toBeDefined();
    expect(wrapper.findComponent(MenuItem).exists()).toBeTruthy();
    expect(wrapper.findAll('.menu-item-main-container').length).toBe(store.menuItems.length);
  });
});
