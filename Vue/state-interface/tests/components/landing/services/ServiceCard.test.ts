import ServiceCard from '@components/landing/services/ServiceCard.vue';
import { useOperaStore } from '@stores/opera';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

const icon = 'imageRoute';
const color = 'green';
const index = 0;
const name = 'name';

describe('ServiceCard', () => {
  let store: ReturnType<typeof useOperaStore>;
  let wrapper: VueWrapper;

  beforeAll(() => {
    setActivePinia(createPinia());
    store = useOperaStore();
    wrapper = mount(ServiceCard, { props: { icon, color, index, name, temperature: store.services[index].temperature } });
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly', () => {
    const temperatureName = wrapper.find('input');
    const serviceName = wrapper.find('.service-name');
    const imageElement = wrapper.find('.icon-element');
    const imageContainer = wrapper.find('.image-container');

    expect(temperatureName).toBeDefined();
    expect(temperatureName.element.value).toBe('19');
    expect(serviceName).toBeDefined();
    expect(serviceName.text()).toBe(name);
    expect(imageElement).toBeDefined();
    expect(imageElement.attributes('src')).toBe(icon);
    expect(imageContainer).toBeDefined();
    expect(imageContainer.classes()).toContain('green');
  });

  test('Should render base state correctly with active true', async () => {
    await wrapper.find('input').setValue(8);
    console.log(wrapper.find('input').element.value);
    expect(store.services[index].temperature).toBe(8);
    expect(wrapper.find('input').element.value).toBe('8');
  });
});
