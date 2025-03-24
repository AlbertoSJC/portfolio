import type Modes from '@domain/modes/Modes';
import AllServices from '@domain/room-services/AllServices';
import Usage from '@domain/usage/Usage';
import { ModesLiterals } from '@stores/opera-content/cards-info';
import { watch } from 'vue';

export function useCalculateOutputsWatcher(roomServices: AllServices, currentUsage: Usage, currentModes: Modes) {
  watch(
    [roomServices, currentModes],
    () => {
      const isCoolAirActive = currentModes && currentModes.modes ? currentModes.modes[currentModes.findIndexByTitle(ModesLiterals.CoolAir)].active : false;
      currentUsage.generalTemperature = roomServices.calculateMedianTemperature();
      currentUsage.updateHumidity(isCoolAirActive);
    },
    {
      deep: true,
    }
  );
}
