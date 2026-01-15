import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EditCandidateModal from '@components/recruitment/modals/edit/EditCandidateModal.vue';
import ModalContainer from '@components/common/ModalContainer.vue';
import CandidateForm from '@components/recruitment/modals/CandidateForm.vue';
import HeaderEditCandidate from '@components/recruitment/modals/edit/HeaderEditCandidate.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useModalsStore, ModalIds } from '@stores/modals';

describe('EditCandidateModal.vue', () => {
  let modalsStore: ReturnType<typeof useModalsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    modalsStore = useModalsStore();
  });

  test('renders correctly', async () => {
    const wrapper = mount(EditCandidateModal);
    expect(wrapper.exists()).toBe(true);
    modalsStore.toggleModal(ModalIds.EditCandidate);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(ModalContainer).exists()).toBe(true);
    expect(wrapper.findComponent(HeaderEditCandidate).exists()).toBe(true);
    expect(wrapper.findComponent(CandidateForm).exists()).toBe(true);
  });

  test('passes the correct modalId to ModalContainer', () => {
    const wrapper = mount(EditCandidateModal);
    const modalContainer = wrapper.findComponent(ModalContainer);
    expect(modalContainer.props('modalId')).toBe(ModalIds.EditCandidate);
  });

  test('toggles visibility based on modalsStore state', async () => {
    const wrapper = mount(EditCandidateModal);
    const modalContainer = wrapper.findComponent(ModalContainer);

    expect(modalsStore.listModalIds[ModalIds.EditCandidate]).toBe(false);
    expect(modalContainer.isVisible()).toBe(false);

    modalsStore.toggleModal(ModalIds.EditCandidate);
    await wrapper.vm.$nextTick();

    expect(modalsStore.listModalIds[ModalIds.EditCandidate]).toBe(true);
    expect(modalContainer.isVisible()).toBe(true);
  });
});
