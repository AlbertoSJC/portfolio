import type { ToggleItems } from '@components/types/types';
import Goals from '@domain/Goals';
import Mode from '@domain/modes/Mode';
import Modes from '@domain/modes/Modes';
import AllServices from '@domain/room-services/AllServices';
import RoomService from '@domain/room-services/RoomService';
import Costs from '@domain/usage/Costs';
import Usage from '@domain/usage/Usage';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { MENU_ITEMS, MODES, ModesLiterals, SERVICES } from './opera-content/cards-info';
import { useCalculateOutputsWatcher } from './watchers/useCalculateOutputsWatcher';
import { useCoolAirInputWatcher } from './watchers/useCoolAirInputWatcher';

export const useOperaStore = defineStore('opera-store', () => {
  const roomServices = ref<AllServices>(new AllServices({ services: SERVICES.map((service) => new RoomService(service)) }));
  const allModes = ref<Modes>(new Modes(structuredClone(MODES) as Mode[]));
  const currentUsage = ref<Usage>(
    new Usage(
      { generalTemperature: roomServices.value.calculateMedianTemperature(), humidity: 19, costs: Costs.createEmpty() },
      allModes.value.modes[allModes.value.findIndexByTitle(ModesLiterals.CoolAir)].active
    )
  );
  const menuItems = ref<ToggleItems[]>(structuredClone(MENU_ITEMS));
  const goals = ref<Goals>(Goals.createEmpty());
  const showGoalsPage = ref<boolean>(false);

  const toggleShowGoalsPage = (newGoals?: Goals) => {
    if (newGoals) goals.value = newGoals;
    showGoalsPage.value = !showGoalsPage.value;
  };

  const resetStore = () => {
    roomServices.value = new AllServices({ services: SERVICES.map((service) => new RoomService(service)) });
    currentUsage.value = new Usage({ generalTemperature: roomServices.value.calculateMedianTemperature(), humidity: 19, costs: Costs.createEmpty() });
    allModes.value = new Modes(MODES.map((mode) => new Mode(mode)));
    menuItems.value = structuredClone(MENU_ITEMS);
    goals.value = Goals.createEmpty();
    showGoalsPage.value = false;
  };

  useCalculateOutputsWatcher(roomServices.value, currentUsage.value, allModes.value);
  useCoolAirInputWatcher(roomServices.value, allModes.value);

  return {
    roomServices,
    currentUsage,
    allModes,
    menuItems,
    goals,
    showGoalsPage,
    toggleShowGoalsPage,
    resetStore,
  };
});
