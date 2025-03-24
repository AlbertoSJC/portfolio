import type { ToggleItems } from '@components/types/types';
import Goals from '@domain/Goals';
import type Mode from '@domain/modes/Mode';
import Modes from '@domain/modes/Modes';
import AllServices from '@domain/room-services/AllServices';
import Costs from '@domain/usage/Costs';
import Usage from '@domain/usage/Usage';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MENU_ITEMS, MODES, SERVICES } from './opera-content/cards-info';
import { useRoomServicesWatcher } from './watchers/useRoomServicesWatcher';

export const useOperaStore = defineStore('opera-store', () => {
  const roomServices = ref<AllServices>(new AllServices({ services: structuredClone(SERVICES) }));
  const allModes = ref<Modes>(new Modes(structuredClone(MODES) as Mode[]));
  const currentUsage = ref<Usage>(new Usage({ generalTemperature: roomServices.value.calculateMedianTemperature(), humidity: 19, costs: Costs.createEmpty() }));
  const menuItems = ref<ToggleItems[]>(structuredClone(MENU_ITEMS));
  const goals = ref<Goals>(Goals.createEmpty());
  const showGoalsPage = ref<boolean>(false);

  const toggleShowGoalsPage = (newGoals?: Goals) => {
    if (newGoals) goals.value = newGoals;
    showGoalsPage.value = !showGoalsPage.value;
  };

  const $reset = () => {
    roomServices.value = new AllServices({ services: structuredClone(SERVICES) });
    currentUsage.value = new Usage({ generalTemperature: roomServices.value.calculateMedianTemperature(), humidity: 19, costs: Costs.createEmpty() });
    allModes.value = new Modes(structuredClone(MODES) as Mode[]);
    menuItems.value = structuredClone(MENU_ITEMS);
    goals.value = Goals.createEmpty();
    showGoalsPage.value = false;
  };

  useRoomServicesWatcher(roomServices.value, currentUsage.value);

  return {
    roomServices,
    currentUsage,
    allModes,
    menuItems,
    goals,
    showGoalsPage,
    toggleShowGoalsPage,
    $reset,
  };
});
