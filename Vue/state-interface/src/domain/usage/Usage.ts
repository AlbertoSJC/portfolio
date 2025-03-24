import AllServices from '@domain/room-services/AllServices';
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

  constructor(usage: UsageData) {
    this.generalTemperature = usage.generalTemperature;
    this.humidity = usage.humidity;
    this.costs = new Costs(usage.costs) ?? Costs.createEmpty();
  }

  public static createEmpty(): Usage {
    return new Usage({
      generalTemperature: 0,
      humidity: 0,
      costs: Costs.createEmpty(),
    });
  }
}
