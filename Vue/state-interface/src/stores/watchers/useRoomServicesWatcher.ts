import AllServices from '@domain/room-services/AllServices';
import type Usage from '@domain/usage/Usage';
import { watch } from 'vue';

export function useRoomServicesWatcher(roomServices: AllServices, currentUsage: Usage) {
  watch(
    roomServices,
    (service) => {
      currentUsage.generalTemperature = AllServices.calculateMedianTemperature(service);
    },
    {
      deep: true,
    }
  );
}
