import CurrentUsageContainer from '@components/landing/usage/CurrentUsageContainer.vue';
import MainUsageTooltip from '@components/landing/usage/MainUsageTooltip.vue';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useOperaStore } from '@stores/opera';

describe('CurrentUsageContainer', () => {
  let wrapper: VueWrapper;
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
    wrapper = mount(CurrentUsageContainer);
  });

  test('Should render component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render internal components', () => {
    expect(wrapper.find('.main-container').exists()).toBeTruthy();
    expect(wrapper.findComponent(MainUsageTooltip).exists()).toBeTruthy();
  });

  test('Should change to showWaterPage to off', async () => {
    const toggleWater = wrapper.find('#toggle-water-page');

    await toggleWater.trigger('click');

    expect(store.showWaterPage).toBe(true);
  });
});
