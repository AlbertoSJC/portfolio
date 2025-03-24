import CurrentUsageContainer from '@components/landing/usage/CurrentUsageContainer.vue';
import MainUsageTooltip from '@components/landing/usage/MainUsageTooltip.vue';
import { useOperaStore } from '@stores/opera';
import { VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

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
    expect(wrapper.find('.usage-main-container').exists()).toBeTruthy();
    expect(wrapper.findComponent(MainUsageTooltip).exists()).toBeTruthy();
  });

  test('Should change to showGoalsPage to off', async () => {
    const toggleWater = wrapper.find('#toggle-water-page');

    await toggleWater.trigger('click');

    expect(store.showGoalsPage).toBe(true);
  });

  test('Should show median default temperature correctly', async () => {
    const medianTemperature = wrapper.find('#median-temperature');

    expect(medianTemperature.text()).toBe('20°C');
  });

  test('Should show median default temperature correctly if a room temperature gets updated', async () => {
    store.roomServices.services[0].temperature = 30;

    await wrapper.vm.$nextTick();

    const medianTemperature = wrapper.find('#median-temperature');

    expect(medianTemperature.text()).toBe('23°C');
  });
});
