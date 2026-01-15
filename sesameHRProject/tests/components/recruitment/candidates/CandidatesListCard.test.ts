import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CandidatesListCard from '@components/recruitment/candidates/CandidatesListCard.vue';
import CandidateInformationCard from '@components/recruitment/candidates/CandidateInformationCard.vue';
import ButtonElement from '@components/common/ButtonElement.vue';
import { useRecruitmentStore } from '@stores/recruitment';
import { useModalsStore, ModalIds } from '@stores/modals';
import { Candidate } from '@domain/Candidate';

describe('CandidatesListCard.vue', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;
  let modalsStore: ReturnType<typeof useModalsStore>;

  const mockCandidate = new Candidate({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123456789',
    linkedInURL: 'https://linkedin.com/in/johndoe',
    createdAt: '2025-03-01',
    updatedAt: '2025-03-15',
    vacancyId: 'vacancy-123',
    statusId: 'status-456',
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
    modalsStore = useModalsStore();
  });

  test('renders candidate information correctly', () => {
    const wrapper = mount(CandidatesListCard, {
      props: {
        candidate: mockCandidate,
        index: 0,
      },
    });

    const nameSpan = wrapper.find('.text-secondary-blue.font-bold');
    expect(nameSpan.text()).toBe('John Doe');
    expect(nameSpan.attributes('title')).toBe('John Doe');
  });

  test('applies correct background color based on index', () => {
    const wrapperEven = mount(CandidatesListCard, {
      props: {
        candidate: mockCandidate,
        index: 0,
      },
    });

    const wrapperOdd = mount(CandidatesListCard, {
      props: {
        candidate: mockCandidate,
        index: 1,
      },
    });

    expect(wrapperEven.classes()).toContain('bg-white');
    expect(wrapperOdd.classes()).toContain('bg-secondary-white');
  });

  test('renders CandidateInformationCard component when candidate is provided', () => {
    const wrapper = mount(CandidatesListCard, {
      props: {
        candidate: mockCandidate,
        index: 0,
      },
    });

    const informationCard = wrapper.findComponent(CandidateInformationCard);
    expect(informationCard.exists()).toBe(true);
    expect(informationCard.props('candidate')).toEqual(mockCandidate);
  });

  test('does not render CandidateInformationCard when candidate is null', () => {
    const wrapper = mount(CandidatesListCard, {
      props: {
        candidate: null,
        index: 0,
      },
    });

    const informationCard = wrapper.findComponent(CandidateInformationCard);
    expect(informationCard.exists()).toBe(false);
  });

  test('renders the edit button and triggers editCandidate method on click', async () => {
    const wrapper = mount(CandidatesListCard, {
      props: {
        candidate: mockCandidate,
        index: 0,
      },
    });

    const editButton = wrapper.findComponent(ButtonElement);
    expect(editButton.exists()).toBe(true);
    expect(editButton.props('text')).toBe('Editar');

    await editButton.trigger('click');

    expect(recruitmentStore.candidateToUpload).toEqual(mockCandidate);
    expect(modalsStore.listModalIds[ModalIds.EditCandidate]).toBe(true);
  });

  test('renders the correct status icon', () => {
    const wrapper = mount(CandidatesListCard, {
      props: {
        candidate: mockCandidate,
        index: 0,
      },
    });

    const statusIcon = wrapper.find('img[src="src/images/status/default.svg"]');
    expect(statusIcon.exists()).toBe(true);
  });
});
