import LandingView from '@components/views/LandingView.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('LandingView', () => {
  let wrapper: VueWrapper;
  beforeEach(() => {
    setActivePinia(createPinia());
    wrapper = mount(LandingView);
  });
  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should find comic-background class', () => {
    expect(wrapper.find('.comic-background').exists()).toBeTruthy();
  });
});
