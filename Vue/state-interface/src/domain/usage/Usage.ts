import Costs from './Costs';

export interface UsageData {
  generalTemperature: number;
  humidity: number;
  costs: Costs;
}

export default class Usage {
  generalTemperature: number;
  humidity: number;
  costs: Costs;

  constructor(usage: UsageData, coolAir?: boolean) {
    this.generalTemperature = usage.generalTemperature;
    this.humidity = this.updateHumidity(coolAir) ?? usage.humidity;
    this.costs = new Costs(usage.costs) ?? Costs.createEmpty();
  }

  calculateHumidity(coolAir?: boolean): number {
    const maxTemperature = 40;
    const minTemperature = 0;
    const normalizedTemperature = (this.generalTemperature - minTemperature) / (maxTemperature - minTemperature);

    const factor = 2 * (1 - normalizedTemperature);

    let humidity = factor * this.generalTemperature;

    if (coolAir) humidity += 10;

    return Math.max(0, Math.min(100, Math.round(humidity)));
  }

  updateHumidity(coolAir?: boolean): void {
    this.humidity = this.calculateHumidity(coolAir);
  }

  public static createEmpty(): Usage {
    return new Usage({
      generalTemperature: 0,
      humidity: 0,
      costs: Costs.createEmpty(),
    });
  }
}
