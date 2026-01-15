import { describe, test, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import DecorativeSidebar from '@components/sidebar/DecorativeSidebar.vue';

describe('DecorativeSidebar', () => {
  test('Should mount', () => {
    const wrapper = shallowMount(DecorativeSidebar);
    expect(wrapper).toBeDefined();
  });

  test('Should render the component correctly', () => {
    const wrapper = shallowMount(DecorativeSidebar);

    const div = wrapper.find('div');
    expect(div.exists()).toBe(true);
    expect(div.classes()).toContain('w-[5%]');
    expect(div.classes()).toContain('bg-[#f1f5f9]');
    expect(div.classes()).toContain('border-2');
    expect(div.classes()).toContain('border-[#e6ebf2]');
  });
});
