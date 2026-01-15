import { describe, test, expect } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import RecruitmentContainer from '@components/recruitment/RecruitmentContainer.vue';
import VacanciesContainer from '@components/recruitment/RecruitmentManagement.vue';

describe('RecruitmentContainer', () => {
  test('Should mount', () => {
    const wrapper = shallowMount(RecruitmentContainer);
    expect(wrapper).toBeDefined();
  });

  test('Should render the root div with correct classes', () => {
    const wrapper = shallowMount(RecruitmentContainer);
    const rootDiv = wrapper.find('div');
    expect(rootDiv.exists()).toBe(true);
    expect(rootDiv.classes()).toContain('w-[75%]');
    expect(rootDiv.classes()).toContain('h-full');
    expect(rootDiv.classes()).toContain('flex');
    expect(rootDiv.classes()).toContain('flex-col');
    expect(rootDiv.classes()).toContain('p-5');
    expect(rootDiv.classes()).toContain('gap-4');
  });

  test('Should render the header div with correct classes', () => {
    const wrapper = shallowMount(RecruitmentContainer);
    const headerDiv = wrapper.find('#recruitment-container > div');
    expect(headerDiv.exists()).toBe(true);
    expect(headerDiv.classes()).toContain('flex');
    expect(headerDiv.classes()).toContain('flex-row');
    expect(headerDiv.classes()).toContain('justify-between');
  });

  test('Should render the heading with correct text and classes', () => {
    const wrapper = shallowMount(RecruitmentContainer);
    const heading = wrapper.find('h1');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Reclutamiento');
    expect(heading.classes()).toContain('text-5xl');
    expect(heading.classes()).toContain('font-bold');
    expect(heading.classes()).toContain('text-secondary-blue');
  });

  test('Should render the image with correct attributes and classes', () => {
    const wrapper = shallowMount(RecruitmentContainer);
    const image = wrapper.find('img');

    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe('/src/images/profile-image.jpg');
    expect(image.classes()).toContain('rounded-[50%]');
    expect(image.classes()).toContain('max-h-[50px]');
    expect(image.classes()).toContain('max-w-[50px]');
    expect(image.classes()).toContain('min-h-[50px]');
    expect(image.classes()).toContain('min-w-[50px]');
  });

  test('Should render the VacanciesContainer component', () => {
    const wrapper = shallowMount(RecruitmentContainer);
    const vacanciesContainer = wrapper.findComponent(VacanciesContainer);
    expect(vacanciesContainer.exists()).toBe(true);
  });
});
