export type RoomServiceInfo = {
  icon: string;
  color: string;
  temperature: number;
  name: string;
};

export default class RoomService {
  icon: string;
  color: string;
  temperature: number;
  name: string;

  constructor(service: RoomServiceInfo) {
    this.icon = service.icon;
    this.color = service.color;
    this.temperature = service.temperature;
    this.name = service.name;
  }

  setTemperatureWithCoolAir(coolAir?: boolean) {
    this.temperature = coolAir ? this.temperature - 7 : this.temperature + 7;
    Math.round(this.temperature);
  }

  public static createEmpty(): RoomService {
    return new RoomService({
      icon: '',
      color: '',
      temperature: 0,
      name: '',
    });
  }
}
