import ModalContainer from '@components/common/ModalContainer.vue';
import CandidateForm from '@components/recruitment/modals/CandidateForm.vue';
import HeaderCreateCandidate from '@components/recruitment/modals/create/HeaderCreateCandidate.vue';
import CreateCandidateModal from '@components/recruitment/modals/create/CreateCandidateModal.vue';
import { ModalIds, useModalsStore } from '@stores/modals';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

describe('CreateCandidateModal', () => {
  let modalStore: ReturnType<typeof useModalsStore>;
  beforeEach(() => {
    setActivePinia(createPinia());
    modalStore = useModalsStore();
    modalStore.listModalIds[ModalIds.CreateCandidate] = true;
  });

  test('Should mount correctly', () => {
    const wrapper = mount(CreateCandidateModal);
    expect(wrapper).toBeDefined();
  });

  test('Should render ModalContainer component', () => {
    const wrapper = mount(CreateCandidateModal);
    const modalContainer = wrapper.findComponent(ModalContainer);
    expect(modalContainer.exists()).toBe(true);
  });

  test('Should render HeaderCreateCandidate component', () => {
    const wrapper = mount(CreateCandidateModal);
    const headerCreateCandidate = wrapper.findComponent(HeaderCreateCandidate);
    expect(headerCreateCandidate.exists()).toBe(true);
  });

  test('Should render CandidateForm component', async () => {
    const wrapper = mount(CreateCandidateModal);

    const candidateForm = wrapper.findComponent(CandidateForm);

    expect(candidateForm.exists()).toBe(true);
  });
});
