import CandidateOptionsTab from '@components/recruitment/candidates/CandidateOptionsTab.vue';
import { AllVacancyStatus } from '@domain/AllVacancyStatus';
import { Candidate } from '@domain/Candidate';
import { ModalIds, useModalsStore } from '@stores/modals';
import { useRecruitmentStore } from '@stores/recruitment';
import { mockVacancyStatuses } from '@tests/mocks/vacancyMocks';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockCandidate = new Candidate({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  statusId: 'status-1',
  vacancyId: 'vacancy-1',
  email: 'john.doe@example.com',
});

describe('CandidateOptionsTab.vue', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;
  let modalsStore: ReturnType<typeof useModalsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
    modalsStore = useModalsStore();
    recruitmentStore.vacancyStatusList = new AllVacancyStatus(mockVacancyStatuses);
  });

  test('renders correctly', () => {
    const wrapper = mount(CandidateOptionsTab, {
      props: { candidate: mockCandidate },
    });
    expect(wrapper.exists()).toBe(true);
  });

  test('toggles submenu visibility on click', async () => {
    const wrapper = mount(CandidateOptionsTab, {
      props: { candidate: mockCandidate },
    });

    const submenuIcon = wrapper.find('img');

    await submenuIcon.trigger('click');

    expect((wrapper.vm as any).showSubmenu).toBe(true);

    await submenuIcon.trigger('click');

    expect((wrapper.vm as any).showSubmenu).toBe(false);
  });

  test('opens edit candidate modal', async () => {
    const wrapper = mount(CandidateOptionsTab, {
      props: { candidate: mockCandidate },
    });

    const submenuIcon = wrapper.find('img');
    await submenuIcon.trigger('click');

    const editButton = wrapper.find('span.edit-candidate-tab-button');
    await editButton.trigger('click');

    expect(modalsStore.listModalIds[ModalIds.EditCandidate]).toBe(true);
    expect(recruitmentStore.candidateToUpload).toEqual(mockCandidate);
  });

  test('toggles status submenu visibility', async () => {
    const wrapper = mount(CandidateOptionsTab, {
      props: { candidate: mockCandidate },
    });

    const submenuIcon = wrapper.find('img');
    await submenuIcon.trigger('click');

    const statusButton = wrapper.findAll('span').filter((node) => node.text() === 'Cambiar Status')[0];
    await statusButton.trigger('click');

    expect((wrapper.vm as any).showStatus).toBe(true);

    await statusButton.trigger('click');

    expect((wrapper.vm as any).showStatus).toBe(false);
  });

  test('changes candidate status', async () => {
    vi.spyOn(recruitmentStore, 'editCandidate').mockResolvedValue();

    const wrapper = mount(CandidateOptionsTab, {
      props: { candidate: mockCandidate },
    });

    const submenuIcon = wrapper.find('img');
    await submenuIcon.trigger('click');

    const statusTrigger = wrapper.find('.show-status-trigger');
    await statusTrigger.trigger('click');

    const statusOption = wrapper.findAll('span.status-element-text');

    await statusOption[1].trigger('click');
    expect(recruitmentStore.candidateToUpload.statusId).toBe('2');
    expect(recruitmentStore.editCandidate).toHaveBeenCalled();
  });
});
