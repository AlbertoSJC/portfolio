import MenuItem from '@components/landing/menu/MenuItem.vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

const image = 'imageRoute';
const title = 'title';
const active = true;

describe('Menu Item', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  test('Should mount', () => {
    const wrapper = mount(MenuItem, { props: { image, title, active } });
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly', () => {
    const wrapper = mount(MenuItem, { props: { image, title, active } });

    const titleElement = wrapper.find('.title');
    const imageElement = wrapper.find('.image-element');
    const mainContainer = wrapper.find('.content-container');

    expect(titleElement).toBeDefined();
    expect(titleElement.text()).toBe(title);
    expect(imageElement).toBeDefined();
    expect(imageElement.attributes('src')).toBe(image);
    expect(mainContainer).toBeDefined();
    expect(mainContainer.classes()).toContain('blue-background');
  });

  test('Should render state with active off', async () => {
    const wrapper = mount(MenuItem, { props: { image, title, active: false } });

    const titleElement = wrapper.find('.title');
    const imageElement = wrapper.find('.image-element');
    const mainContainer = wrapper.find('.content-container');

    expect(titleElement.exists()).toBe(false);
    expect(imageElement).toBeDefined();
    expect(mainContainer).toBeDefined();
    expect(mainContainer.classes()).not.toContain('blue-background');
  });
});
