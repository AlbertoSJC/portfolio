import ModesCard from '@components/landing/modes/ModesCard.vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

const image = 'imageRoute';
const title = 'title';
const active = true;

describe('ModesCard', () => {
  beforeAll(() => {
    setActivePinia(createPinia());
  });

  test('Should mount', () => {
    const wrapper = mount(ModesCard, { props: { image, title, active } });
    expect(wrapper).toBeDefined();
  });

  test('Should render base state correctly with active true', () => {
    const wrapper = mount(ModesCard, { props: { image, title, active } });

    const titleElement = wrapper.find('.mode-text');
    const activeText = wrapper.find('.mode-state');
    const imageElement = wrapper.find('.image-element');
    const imageBackgroundContainer = wrapper.find('.image-background-container');

    expect(titleElement).toBeDefined();
    expect(titleElement.text()).toBe(title);
    expect(activeText).toBeDefined();
    expect(activeText.text()).toBe('On');
    expect(imageElement).toBeDefined();
    expect(imageElement.attributes('src')).toBe(image);
    expect(imageBackgroundContainer).toBeDefined();
    expect(imageBackgroundContainer.classes()).toContain('active');
  });

  test('Should render state with active off', async () => {
    const wrapper = mount(ModesCard, { props: { image, title, active: false } });

    const activeText = wrapper.find('.mode-state');
    const imageBackgroundContainer = wrapper.find('.image-background-container');

    expect(activeText.text()).toBe('Off');
    expect(imageBackgroundContainer.classes()).not.toContain('active');
  });
});
