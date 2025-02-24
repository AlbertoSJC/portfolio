import LandingView from '@components/views/LandingView.vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, test } from 'vitest';

describe('LandingView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  test('Should mount', () => {
    const wrapper = mount(LandingView);
    expect(wrapper).toBeDefined();
  });
});
