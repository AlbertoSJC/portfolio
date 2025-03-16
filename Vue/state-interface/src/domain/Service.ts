import type { ServiceInfo } from '@components/types/types';

export default class Service {
  icon: string;
  color: string;
  temperature: number;
  name: string;

  constructor(service: ServiceInfo) {
    this.icon = service.icon;
    this.color = service.color;
    this.temperature = service.temperature;
    this.name = service.name;
  }

  public static createEmpty(): Service {
    return new Service({
      icon: '',
      color: '',
      temperature: 0,
      name: '',
    });
  }
}
