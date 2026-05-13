import RecruitmentContainer from '@components/recruitment/RecruitmentContainer.vue';
import CompanySidebar from '@components/sidebar/CompanySidebar.vue';
import DecorativeSidebar from '@components/sidebar/DecorativeSidebar.vue';
import RecruitmentView from '@components/views/RecruitmentView.vue';
import { shallowMount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test } from 'vitest';

describe('RecruitmentView', () => {
  let wrapper: VueWrapper;
  beforeEach(() => {
    wrapper = shallowMount(RecruitmentView);
    setActivePinia(createPinia());
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should mount all components', () => {
    expect(wrapper.findComponent(CompanySidebar)).toBeDefined();
    expect(wrapper.findComponent(RecruitmentContainer)).toBeDefined();
    expect(wrapper.findComponent(DecorativeSidebar)).toBeDefined();
  });
});
