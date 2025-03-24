import ModesContainer from '@components/landing/modes/ModesContainer.vue';
import ModesCard from '@components/landing/modes/ModesCard.vue';
import { useOperaStore } from '@stores/opera';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('ModesContainer', () => {
  let store: ReturnType<typeof useOperaStore>;
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());
    wrapper = mount(ModesContainer);
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly', () => {
    store = useOperaStore();
    const mainContainer = wrapper.find('.main-container');

    expect(mainContainer).toBeDefined();
    expect(wrapper.findComponent(ModesCard).exists()).toBeTruthy();
    expect(wrapper.findAll('.card-main-container').length).toBe(store.allModes.modes.length);
  });

  test('Should toggle mode activation on click', async () => {
    const modeIndex = 1;
    const modeCard = wrapper.findAllComponents(ModesCard).at(modeIndex) as VueWrapper;

    expect(store.allModes.modes[modeIndex].active).toBe(false);

    await modeCard.trigger('click');

    expect(store.allModes.modes[modeIndex].active).toBe(true);

    await modeCard.trigger('click');

    expect(store.allModes.modes[modeIndex].active).toBe(false);
  });
});
