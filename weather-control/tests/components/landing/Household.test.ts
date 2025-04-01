import Household from '@components/landing/Household.vue';
import Menu from '@components/landing/menu/Menu.vue';
import ModesContainer from '@components/landing/modes/ModesContainer.vue';
import ServicesContainer from '@components/landing/services/ServicesContainer.vue';
import CurrentUsageContainer from '@components/landing/usage/CurrentUsageContainer.vue';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

describe('Household', () => {
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());
    wrapper = mount(Household);
  });

  test('Should render component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render internal components', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(ServicesContainer).exists()).toBeTruthy();
    expect(wrapper.findComponent(CurrentUsageContainer).exists()).toBeTruthy();
    expect(wrapper.findComponent(ModesContainer).exists()).toBeTruthy();
    expect(wrapper.findComponent(Menu).exists()).toBeTruthy();
  });
});
