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
    store = useOperaStore();
    const toggleWater = wrapper.find('#toggle-water-page');

    await toggleWater.trigger('click');

    expect(store.showGoalsPage).toBe(true);
  });

  test('Should show median default temperature correctly', async () => {
    store = useOperaStore();
    const medianTemperature = wrapper.find('#median-temperature');

    expect(medianTemperature.text()).toBe('20.25°C');
  });

  test('Should show median default temperature correctly if a room temperature gets updated', async () => {
    store = useOperaStore();

    store.roomServices.services[0].temperature = 30;

    await wrapper.vm.$nextTick();

    const medianTemperature = wrapper.find('#median-temperature');

    expect(medianTemperature.text()).toBe('23°C');
  });
});
