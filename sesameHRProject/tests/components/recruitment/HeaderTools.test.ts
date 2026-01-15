import ButtonElement from '@components/common/ButtonElement.vue';
import TextInput from '@components/common/TextInput.vue';
import HeaderTools from '@components/recruitment/HeaderTools.vue';
import CreateCandidateModal from '@components/recruitment/modals/create/CreateCandidateModal.vue';
import EditCandidateModal from '@components/recruitment/modals/edit/EditCandidateModal.vue';
import { AllVacancyStatus } from '@domain/AllVacancyStatus';
import { ModalIds, useModalsStore } from '@stores/modals';
import { useRecruitmentStore } from '@stores/recruitment';
import { mockVacancyStatuses } from '@tests/mocks/vacancyMocks';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('HeaderTools', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;
  let modalStore: ReturnType<typeof useModalsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
    modalStore = useModalsStore();

    recruitmentStore.vacancyStatusList = new AllVacancyStatus(mockVacancyStatuses);
  });

  test('Should mount', () => {
    const wrapper = mount(HeaderTools);
    expect(wrapper).toBeDefined();
  });

  test('Should render TextInput component with correct props', () => {
    const wrapper = mount(HeaderTools);
    const textInput = wrapper.findComponent(TextInput);

    expect(textInput.exists()).toBe(true);
    expect(textInput.props('placeholder')).toBe('Buscar');
    expect(textInput.props('icon')).toBe('src/images/icon-search.svg');
  });

  test('Should bind TextInput to recruitmentFilterInput in the store', async () => {
    const wrapper = mount(HeaderTools);
    const textInput = wrapper.findComponent(TextInput);

    await textInput.setValue('test input');
    expect(recruitmentStore.recruitmentFilterInput).toBe('test input');
  });

  test('Should render ButtonElement component with correct props', () => {
    const wrapper = mount(HeaderTools);
    const buttonElement = wrapper.findComponent(ButtonElement);

    expect(buttonElement.exists()).toBe(true);
    expect(buttonElement.props('text')).toBe('Añadir candidato');
    expect(buttonElement.props('classes')).toBe('text-sm');
  });

  test('Should call openModal when ButtonElement is clicked', async () => {
    const wrapper = mount(HeaderTools);
    const buttonElement = wrapper.findComponent(ButtonElement);

    const openModalSpy = vi.spyOn(modalStore, 'toggleModal');
    await buttonElement.trigger('click');

    expect(openModalSpy).toHaveBeenCalled();
    expect(modalStore.listModalIds[ModalIds.CreateCandidate]).toBe(true);
  });

  test('Should render CreateCandidateModal component', () => {
    const wrapper = mount(HeaderTools);
    const modal = wrapper.findComponent(CreateCandidateModal);

    expect(modal.exists()).toBe(true);
  });

  test('Should render EdiCandidateModal component', () => {
    const wrapper = mount(HeaderTools);
    const modal = wrapper.findComponent(EditCandidateModal);

    expect(modal.exists()).toBe(true);
  });
});
