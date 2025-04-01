import Header from '@components/common/Header.vue';
import { useOperaStore } from '@stores/opera';
import { VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('Header', () => {
  let store: ReturnType<typeof useOperaStore>;
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());
    wrapper = mount(Header);
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly', async () => {
    const menuContainer = wrapper.find('.menu-container');
    const profileContainer = wrapper.find('.profile-container');

    expect(menuContainer).toBeDefined();
    expect(profileContainer).toBeDefined();
  });

  test('Should not render menu container if showGoalsPage is active', async () => {
    store = useOperaStore();

    store.toggleShowGoalsPage();

    await flushPromises();

    const menuContainer = wrapper.find('.menu-container');
    const profileContainer = wrapper.find('.profile-container');

    expect(menuContainer.exists()).toBe(false);
    expect(profileContainer).toBeDefined();
  });
});
