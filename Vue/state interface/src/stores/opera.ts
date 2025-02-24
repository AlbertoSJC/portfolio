import type { Service, ToggleItems } from '@components/types/types';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MENU_ITEMS, MODES, SERVICES } from './opera-content/cards-info';

export const useOperaStore = defineStore('opera-store', () => {
  const servicesState = ref<Service[]>(structuredClone(SERVICES));
  const modesState = ref<ToggleItems[]>(structuredClone(MODES));
  const menuItemsState = ref<ToggleItems[]>(structuredClone(MENU_ITEMS));

  const showWaterPage = ref<boolean>(false);

  const toggleShowWaterPage = () => {
    window.scrollTo(0, 0);
    showWaterPage.value = !showWaterPage.value;
  };

  return {
    servicesState,
    modesState,
    menuItemsState,
    showWaterPage,
    toggleShowWaterPage,
  };
});
