import ServicesContainer from '@components/landing/services/ServicesContainer.vue';
import ServiceCard from '@components/landing/services/ServiceCard.vue';
import { useOperaStore } from '@stores/opera';
import { VueWrapper, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('ServicesContainer', () => {
  let store: ReturnType<typeof useOperaStore>;
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());

    wrapper = mount(ServicesContainer);
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly', () => {
    store = useOperaStore();
    const mainContainer = wrapper.find('.services-main-container');

    expect(mainContainer).toBeDefined();
    expect(wrapper.findComponent(ServiceCard).exists()).toBeTruthy();
    expect(wrapper.findAll('.service-card-main-container').length).toBe(store.services.length);
  });
});
