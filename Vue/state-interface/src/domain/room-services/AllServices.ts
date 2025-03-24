import RoomService from './RoomService';

export type AllServicesInfo = {
  services: RoomService[];
};

export default class AllServices {
  services: RoomService[];

  constructor(data: AllServicesInfo) {
    this.services = data.services.map((service) => new RoomService(service));
  }

  public static createEmpty(): AllServices {
    return new AllServices({
      services: [RoomService.createEmpty()],
    });
  }

  public static calculateMedianTemperature(data: AllServices): number {
    const finalTemperature =
      data.services.reduce((total, service) => {
        let finalTemperature = total;
        if (service.temperature) finalTemperature = total + service.temperature;
        return finalTemperature;
      }, 0) / data.services.length;
    return Math.round(finalTemperature);
  }
}
