import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CandidatesTab from '@components/recruitment/candidates/CandidatesTab.vue';
import CandidatesListCard from '@components/recruitment/candidates/CandidatesListCard.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useRecruitmentStore } from '@stores/recruitment';
import { Candidate } from '@domain/Candidate';

describe('CandidatesTab.vue', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
  });

  test('renders the correct number of CandidatesListCard components', () => {
    recruitmentStore.candidateList.candidates = [
      new Candidate({ id: '1', firstName: 'John', lastName: 'Doe', statusId: '1', email: 'email@email.com' }),
      new Candidate({ id: '2', firstName: 'Jane', lastName: 'Smith', statusId: '2', email: 'email@email.com' }),
    ];

    const wrapper = mount(CandidatesTab);

    const listCards = wrapper.findAllComponents(CandidatesListCard);
    expect(listCards.length).toBe(2);
  });

  test('passes the correct props to CandidatesListCard components', () => {
    recruitmentStore.candidateList.candidates = [new Candidate({ id: '1', firstName: 'John', lastName: 'Doe', statusId: '1', email: 'email@email.com' })];

    const wrapper = mount(CandidatesTab);

    const listCard = wrapper.findComponent(CandidatesListCard);
    expect(listCard.props('candidate')).toEqual(recruitmentStore.candidateList.candidates[0]);
    expect(listCard.props('index')).toBe(0);
  });

  test('filters candidates based on recruitmentFilterInput', () => {
    recruitmentStore.candidateList.candidates = [
      new Candidate({ id: '1', firstName: 'John', lastName: 'Doe', statusId: '1', email: 'email@email.com' }),
      new Candidate({ id: '2', firstName: 'Jane', lastName: 'Smith', statusId: '2', email: 'email@email.com' }),
    ];

    recruitmentStore.recruitmentFilterInput = 'Jane';

    const wrapper = mount(CandidatesTab);

    const listCards = wrapper.findAllComponents(CandidatesListCard);
    expect(listCards.length).toBe(1);
    expect(listCards[0]?.props('candidate')?.firstName).toBe('Jane');
  });

  test('renders no CandidatesListCard components when there are no candidates', () => {
    recruitmentStore.candidateList.candidates = [];

    const wrapper = mount(CandidatesTab);

    const listCards = wrapper.findAllComponents(CandidatesListCard);
    expect(listCards.length).toBe(0);
  });
});
