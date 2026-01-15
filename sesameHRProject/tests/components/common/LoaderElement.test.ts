import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoaderElement from '@components/common/LoaderElement.vue';

describe('LoaderElement', () => {
  test('should render the loader with default text', () => {
    const wrapper = mount(LoaderElement);

    const loader = wrapper.find('.lds-hourglass');
    expect(loader.exists()).toBe(true);

    const text = wrapper.find('span');
    expect(text.exists()).toBe(true);
    expect(text.text()).toBe('Loading');
  });

  test('should render the loader with custom text', () => {
    const customText = 'Cargando datos...';
    const wrapper = mount(LoaderElement, {
      props: {
        text: customText,
      },
    });

    const loader = wrapper.find('.lds-hourglass');
    expect(loader.exists()).toBe(true);

    const text = wrapper.find('span');
    expect(text.exists()).toBe(true);
    expect(text.text()).toBe(customText);
  });

  test('should have the correct structure and styles', () => {
    const wrapper = mount(LoaderElement);

    const container = wrapper.find('div');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('w-full');
    expect(container.classes()).toContain('h-full');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('flex-col');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('justify-center');
  });
});
