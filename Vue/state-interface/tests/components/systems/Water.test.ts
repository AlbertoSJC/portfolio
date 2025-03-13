import Water from '@components/systems/Water.vue';
import Button from '@components/common/Button.vue';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useOperaStore } from '@stores/opera';

describe('Water', () => {
  let wrapper: VueWrapper;
  let store: ReturnType<typeof useOperaStore>;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
    store.showGoalsPage = true;
    wrapper = mount(Water);
  });

  test('Should render component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('Should render internal components', () => {
    expect(wrapper.find('.text-content').exists()).toBeTruthy();
    expect(wrapper.find('.points-obtained-container').exists()).toBeTruthy();
    expect(wrapper.findComponent(Button).exists()).toBeTruthy();
  });

  test('Should change to showGoalsPage to off', async () => {
    const toggleWater = wrapper.find('#water-system-button');

    await toggleWater.trigger('click');

    expect(store.showGoalsPage).toBe(false);
  });
});
