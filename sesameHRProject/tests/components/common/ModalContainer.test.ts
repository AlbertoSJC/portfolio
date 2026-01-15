import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ModalIds, useModalsStore } from '@stores/modals';
import ModalContainer from '@components/common/ModalContainer.vue';

describe('ModalContainer', () => {
  let modalsStore: ReturnType<typeof useModalsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    modalsStore = useModalsStore();
  });

  test('should not render the modal when the modalId is false', () => {
    const wrapper = mount(ModalContainer, {
      props: { modalId: ModalIds.CreateCandidate },
      slots: {
        default: '<div>Modal Content</div>',
      },
    });

    expect(wrapper.find('div').exists()).toBe(false);
  });

  test('should render the modal when the modalId is true', async () => {
    modalsStore = useModalsStore();

    const wrapper = mount(ModalContainer, {
      props: { modalId: ModalIds.CreateCandidate },
      slots: {
        default: '<div>Modal Content</div>',
      },
    });

    await modalsStore.toggleModal(ModalIds.CreateCandidate);

    expect(wrapper.find('.fixed').exists()).toBe(true);
    expect(wrapper.text()).toContain('Modal Content');
  });

  test('should close the modal when clicking on the background', async () => {
    const toggleModalSpy = vi.spyOn(modalsStore, 'toggleModal');

    modalsStore.listModalIds[ModalIds.CreateCandidate] = true;

    const wrapper = mount(ModalContainer, {
      props: { modalId: ModalIds.CreateCandidate },
      slots: {
        default: '<div>Modal Content</div>',
      },
    });

    await wrapper.find('.fixed').trigger('click.self');
    expect(toggleModalSpy).toHaveBeenCalledWith(ModalIds.CreateCandidate);
  });

  test('should not close the modal when clicking inside the modal content', async () => {
    const toggleModalSpy = vi.spyOn(modalsStore, 'toggleModal');

    modalsStore.listModalIds[ModalIds.CreateCandidate] = true;

    const wrapper = mount(ModalContainer, {
      props: { modalId: ModalIds.CreateCandidate },
      slots: {
        default: '<div class="modal-content">Modal Content</div>',
      },
    });

    await wrapper.find('.modal-content').trigger('click');
    expect(toggleModalSpy).not.toHaveBeenCalled();
  });

  test('should close the modal when clicking the close button', async () => {
    const toggleModalSpy = vi.spyOn(modalsStore, 'toggleModal');

    modalsStore.listModalIds[ModalIds.CreateCandidate] = true;

    const wrapper = mount(ModalContainer, {
      props: { modalId: ModalIds.CreateCandidate },
      slots: {
        default: '<div>Modal Content</div>',
      },
    });

    const closeButton = wrapper.find('.close-button-modal');
    await closeButton.trigger('click');
    expect(toggleModalSpy).toHaveBeenCalledWith(ModalIds.CreateCandidate);
  });
});
