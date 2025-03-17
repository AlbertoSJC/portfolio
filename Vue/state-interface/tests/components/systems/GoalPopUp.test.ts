import GoalPopUp from '@components/systems/GoalPopUp.vue';
import Button from '@components/common/Button.vue';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useOperaStore } from '@stores/opera';
import { goalsUsageInformation, UsageTypes } from '@components/landing/usage/info';

describe('GoalPopUp', () => {
  let wrapper: VueWrapper;
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
    store.showGoalsPage = true;
    wrapper = mount(GoalPopUp);
  });

  test('Should render component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render internal components', () => {
    expect(wrapper.find('.text-content').exists()).toBeTruthy();
    expect(wrapper.find('.points-obtained-container').exists()).toBeTruthy();
    expect(wrapper.findComponent(Button).exists()).toBeTruthy();
  });

  test('Should render store values in energy, trees and credits', () => {
    expect(wrapper.find('#energy-saved').text()).toBe(`${store.goals.energy}`);
    expect(wrapper.find('#trees-saved').text()).toBe(`${store.goals.trees}`);
    expect(wrapper.find('#credits-obtained').text()).toBe(`${store.goals.credits}`);
  });

  test('Should update energy, trees and credits when model updates', async () => {
    store.goals = goalsUsageInformation[UsageTypes.Temperature];
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#energy-saved').text()).toBe(`${goalsUsageInformation[UsageTypes.Temperature].energy}`);
    expect(wrapper.find('#trees-saved').text()).toBe(`${goalsUsageInformation[UsageTypes.Temperature].trees}`);
    expect(wrapper.find('#credits-obtained').text()).toBe(`${goalsUsageInformation[UsageTypes.Temperature].credits}`);
  });

  test('Should change to showGoalsPage to off', async () => {
    const toggleGoalBack = wrapper.find('#water-system-button');

    await toggleGoalBack.trigger('click');

    expect(store.showGoalsPage).toBe(false);
  });
});
