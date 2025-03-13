import Household from '@components/landing/Household.vue';
import OperaContainer from '@components/landing/OperaContainer.vue';
import Water from '@components/systems/Water.vue';
import { useOperaStore } from '@stores/opera';
import { VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('Opera Container', () => {
  let store: ReturnType<typeof useOperaStore>;
  let wrapper: VueWrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
    wrapper = mount(OperaContainer);
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should mount initial components', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.findComponent(Household).exists()).toBeTruthy();
    expect(wrapper.findComponent(Water).exists()).toBeFalsy();
  });

  test('Should mount components once showGoalsPage is true', async () => {
    expect(wrapper).toBeDefined();

    store.toggleShowGoalsPage();

    await flushPromises();

    expect(wrapper.findComponent(Household).exists()).toBeFalsy();
    expect(wrapper.findComponent(Water).exists()).toBeTruthy();
  });
});
