import AllServices from '@domain/room-services/AllServices';
import Usage from '@domain/usage/Usage';
import { watch } from 'vue';

export function useRoomServicesWatcher(roomServices: AllServices, currentUsage: Usage) {
  watch(
    roomServices,
    (service) => {
      currentUsage.generalTemperature = roomServices.calculateMedianTemperature();
      currentUsage.updateHumidity(true);
    },
    {
      deep: true,
    }
  );
}
