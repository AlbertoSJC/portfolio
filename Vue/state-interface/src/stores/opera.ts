import type { ToggleItems } from '@components/types/types';
import Goals from '@domain/Goals';
import AllServices from '@domain/room-services/AllServices';
import Usage from '@domain/usage/Usage';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { MENU_ITEMS, MODES, SERVICES } from './opera-content/cards-info';
import { useRoomServicesWatcher } from './watchers/useRoomServicesWatcher';
import Costs from '@domain/usage/Costs';

export const useOperaStore = defineStore('opera-store', () => {
  const defaultServices = new AllServices({ services: structuredClone(SERVICES) });
  const roomServices = ref<AllServices>(defaultServices);
  const modes = ref<ToggleItems[]>(structuredClone(MODES));
  const currentUsage = ref<Usage>(new Usage({ generalTemperature: roomServices.value.calculateMedianTemperature(), humidity: 19, costs: Costs.createEmpty() }));
  const menuItems = ref<ToggleItems[]>(structuredClone(MENU_ITEMS));
  const goals = ref<Goals>(Goals.createEmpty());
  const showGoalsPage = ref<boolean>(false);

  const toggleShowGoalsPage = (newGoals?: Goals) => {
    if (newGoals) goals.value = newGoals;
    showGoalsPage.value = !showGoalsPage.value;
  };

  const $reset = () => {
    roomServices.value = defaultServices;
    modes.value = structuredClone(MODES);
    menuItems.value = structuredClone(MENU_ITEMS);
    goals.value = Goals.createEmpty();
    showGoalsPage.value = false;
  };

  useRoomServicesWatcher(roomServices.value, currentUsage.value);

  return {
    defaultServices,
    roomServices,
    currentUsage,
    modes,
    menuItems,
    goals,
    showGoalsPage,
    toggleShowGoalsPage,
    $reset,
  };
});
