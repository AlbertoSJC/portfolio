import MainUsageTooltip from '@components/landing/usage/MainUsageTooltip.vue';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

describe('MainUsageTooltip', () => {
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());
    wrapper = mount(MainUsageTooltip);
  });

  test('Should render component', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
