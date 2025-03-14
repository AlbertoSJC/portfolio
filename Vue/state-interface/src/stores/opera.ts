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
    if (newGoals) goals.value = newGoals;
    showGoalsPage.value = !showGoalsPage.value;
  };

  const $reset = () => {
    servicesState.value = structuredClone(SERVICES);
    modesState.value = structuredClone(MODES);
    menuItems.value = structuredClone(MENU_ITEMS);
    goals.value = Goals.createEmpty();
    showGoalsPage.value = false;
  };

  return {
    servicesState,
    modesState,
    menuItems,
    goals,
    showGoalsPage,
    toggleShowGoalsPage,
    $reset,
  };
});
