import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HeaderTabs from '@components/recruitment/HeaderTabs.vue';
import { useRecruitmentStore } from '@stores/recruitment';
import { createPinia, setActivePinia } from 'pinia';
import type { RecruitmentTabs } from '@typesOrigin/recruitment';

describe('HeaderTabs', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('Should mount correctly', () => {
    const wrapper = mount(HeaderTabs);

    expect(wrapper).toBeDefined();
  });

  test('Should render tabs correctly', () => {
    const recruitmentStore = useRecruitmentStore();
    const wrapper = mount(HeaderTabs);

    const tabs = wrapper.findAll('span');
    expect(tabs.length).toBe(Object.keys(recruitmentStore.vacancyTabs).length);

    tabs.forEach((tab, index) => {
      const tabKey = Object.keys(recruitmentStore.vacancyTabs)[index];
      const isActive = recruitmentStore.vacancyTabs[tabKey as RecruitmentTabs];
      expect(tab.text()).toBe(tabKey);
      expect(tab.classes()).toContain(isActive ? 'text-secondary-color' : 'text-gray-500');
    });
  });

  test('Should update active tab on click', async () => {
    const recruitmentStore = useRecruitmentStore();
    const wrapper = mount(HeaderTabs);

    const tabs = wrapper.findAll('span');
    const secondTab = tabs[1];
    await secondTab.trigger('click');

    const tabKey = Object.keys(recruitmentStore.vacancyTabs)[1] as RecruitmentTabs;

    expect(recruitmentStore.vacancyTabs[tabKey]).toBe(true);

    Object.keys(recruitmentStore.vacancyTabs).forEach((key, index) => {
      if (index !== 1) {
        expect(recruitmentStore.vacancyTabs[key as RecruitmentTabs]).toBe(false);
      }
    });
  });
});
