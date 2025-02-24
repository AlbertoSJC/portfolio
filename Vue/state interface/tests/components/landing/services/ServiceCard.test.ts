import ServiceCard from '@components/landing/services/ServiceCard.vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

const icon = 'imageRoute';
const color = 'green';
const temperature = 'title';
const name = 'name';

describe('ServiceCard', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  test('Should mount', () => {
    const wrapper = mount(ServiceCard, { props: { icon, color, temperature, name } });
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly with active true', () => {
    const wrapper = mount(ServiceCard, { props: { icon, color, temperature, name } });

    const temperatureName = wrapper.find('.temperature-text');
    const serviceName = wrapper.find('.service-name');
    const imageElement = wrapper.find('.icon-element');
    const imageContainer = wrapper.find('.image-container');

    expect(temperatureName).toBeDefined();
    expect(temperatureName.text()).toBe(temperature);
    expect(serviceName).toBeDefined();
    expect(serviceName.text()).toBe(name);
    expect(imageElement).toBeDefined();
    expect(imageElement.attributes('src')).toBe(icon);
    expect(imageContainer).toBeDefined();
    expect(imageContainer.classes()).toContain('green');
  });
});
