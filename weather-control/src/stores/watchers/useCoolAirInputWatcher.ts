import type Modes from '@domain/modes/Modes';
import AllServices from '@domain/room-services/AllServices';
import { ModesLiterals } from '@stores/opera-content/cards-info';
import { watch } from 'vue';

export function useCoolAirInputWatcher(roomServices: AllServices, currentModes: Modes) {
  watch(
    () => currentModes.modes[currentModes.findIndexByTitle(ModesLiterals.CoolAir)].active,
    () => {
      roomServices.updateTemperatureWithCoolAir(currentModes.modes[currentModes.findIndexByTitle(ModesLiterals.CoolAir)].active);
    }
  );
}
