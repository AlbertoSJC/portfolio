import { describe, test, expect } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import CompanySidebar from '@components/sidebar/CompanySidebar.vue';

describe('CompanySidebar', () => {
  test('Should mount', () => {
    const wrapper = shallowMount(CompanySidebar);
    expect(wrapper).toBeDefined();
  });

  test('Should render the component correctly', () => {
    const wrapper = shallowMount(CompanySidebar);
    const rootDiv = wrapper.find('div');
    expect(rootDiv.exists()).toBe(true);

    expect(rootDiv.classes()).toContain('h-full');
    expect(rootDiv.classes()).toContain('w-[20%]');
    expect(rootDiv.classes()).toContain('flex');
    expect(rootDiv.classes()).toContain('flex-row');
    expect(rootDiv.classes()).toContain('shadow-inset-lg');
  });

  test('Should render the component child classes correctly', () => {
    const wrapper = shallowMount(CompanySidebar);
    const childDivs = wrapper.findAll('.shadow-inset-lg > div');

    expect(childDivs.length).toBe(2);

    expect(childDivs[0].classes()).toContain('h-full');
    expect(childDivs[0].classes()).toContain('w-[20%]');
    expect(childDivs[0].classes()).toContain('bg-[#f1f5f9]');

    expect(childDivs[1].classes()).toContain('h-full');
    expect(childDivs[1].classes()).toContain('w-[80%]');
    expect(childDivs[1].classes()).toContain('bg-white');
  });

  test('toggles triggerSecondMenu when the second menu is clicked', async () => {
    const wrapper = mount(CompanySidebar);
    const secondMenu = wrapper.find('.second-menu-trigger');
    expect((wrapper.vm as any).triggerSecondMenu).toBe(false);

    await secondMenu.trigger('click');
    expect((wrapper.vm as any).triggerSecondMenu).toBe(true);

    await secondMenu.trigger('click');
    expect((wrapper.vm as any).triggerSecondMenu).toBe(false);
  });

  test('applies correct classes based on triggerFirstMenu and triggerSecondMenu states', async () => {
    const wrapper = mount(CompanySidebar);

    const firstMenu = wrapper.find('.first-menu-trigger');
    await firstMenu.trigger('click');
    expect(wrapper.find('div.max-h-[16px]').exists()).toBe(false);

    const secondMenu = wrapper.find('.second-menu-trigger');
    await secondMenu.trigger('click');
    expect(wrapper.find('div.max-h-[35px]').exists()).toBe(false);
  });
});
