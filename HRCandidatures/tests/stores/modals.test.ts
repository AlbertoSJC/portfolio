import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useModalsStore, ModalIds } from '@stores/modals';

describe('useModalsStore', () => {
  let store: ReturnType<typeof useModalsStore>;
  beforeEach(() => {
    setActivePinia(createPinia());
    store = useModalsStore();
  });

  test('Should initialize with default state', () => {
    expect(store.listModalIds).toEqual({
      [ModalIds.CreateCandidate]: false,
      [ModalIds.EditCandidate]: false,
    });
  });

  test('Should toggle the specified modal and set others to false', () => {
    store.toggleModal(ModalIds.CreateCandidate);

    expect(store.listModalIds).toEqual({
      [ModalIds.CreateCandidate]: true,
      [ModalIds.EditCandidate]: false,
    });

    store.toggleModal(ModalIds.CreateCandidate);

    expect(store.listModalIds).toEqual({
      [ModalIds.CreateCandidate]: false,
      [ModalIds.EditCandidate]: false,
    });
  });

  test('Should set all other modals to false when toggling a modal', () => {
    store.toggleModal(ModalIds.CreateCandidate);

    expect(store.listModalIds[ModalIds.CreateCandidate]).toBe(true);

    store.toggleModal(ModalIds.EditCandidate);

    expect(store.listModalIds).toEqual({
      [ModalIds.CreateCandidate]: false,
      [ModalIds.EditCandidate]: true,
    });
  });
});
