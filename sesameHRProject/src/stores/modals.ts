import { defineStore } from 'pinia';
import { ref } from 'vue';

export enum ModalIds {
  CreateCandidate = 'create-candidate',
  EditCandidate = 'edit-candidate',
}

export const useModalsStore = defineStore('modals', () => {
  const listModalIds = ref<Record<ModalIds, boolean>>({
    [ModalIds.CreateCandidate]: false,
    [ModalIds.EditCandidate]: false,
  });

  const toggleModal = (id: ModalIds) => {
    Object.keys(listModalIds.value).forEach((key) => {
      listModalIds.value[key as ModalIds] = key === id ? !listModalIds.value[key as ModalIds] : false;
    });
  };

  return {
    listModalIds,
    toggleModal,
  };
});
