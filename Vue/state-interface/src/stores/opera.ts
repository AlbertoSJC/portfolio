import type { Service, ToggleItems } from '@components/types/types';
import Goals from '@domain/Goals';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MENU_ITEMS, MODES, SERVICES } from './opera-content/cards-info';

export const useOperaStore = defineStore('opera-store', () => {
  const servicesState = ref<Service[]>(structuredClone(SERVICES));
  const modesState = ref<ToggleItems[]>(structuredClone(MODES));
  const menuItems = ref<ToggleItems[]>(structuredClone(MENU_ITEMS));
  const goals = ref<Goals>(Goals.createEmpty());

  const showGoalsPage = ref<boolean>(false);

  const toggleShowGoalsPage = (newGoals?: Goals) => {
    goals.value = newGoals || Goals.createEmpty();
    showGoalsPage.value = !showGoalsPage.value;
  };

  return {
    servicesState,
    modesState,
    menuItems,
    goals,
    showGoalsPage,
    toggleShowGoalsPage,
  };
});
