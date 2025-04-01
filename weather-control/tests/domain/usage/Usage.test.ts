import { CoinOptions } from '@components/landing/usage/info';
import type { UsageData } from '@domain/usage/Usage';
import Usage from '@domain/usage/Usage';

const usageData: UsageData = {
  generalTemperature: 22,
  humidity: 50,
  costs: {
    money: 100,
    coin: CoinOptions.Euro,
    electricity: 200,
  },
};

describe('Domain > Usage', () => {
  let usage: Usage;

  beforeEach(() => {
    usage = new Usage(usageData);
  });

  test('Should initialize with given data', () => {
    expect(usage.generalTemperature).toBe(usageData.generalTemperature);
    expect(usage.humidity).toBe(usageData.humidity);
    expect(usage.costs.money).toBe(usageData.costs.money);
    expect(usage.costs.coin).toBe(usageData.costs.coin);
    expect(usage.costs.electricity).toBe(usageData.costs.electricity);
  });

  test('Should create an empty usage', () => {
    const emptyUsage = Usage.createEmpty();
    expect(emptyUsage.generalTemperature).toBe(0);
    expect(emptyUsage.humidity).toBe(0);
    expect(emptyUsage.costs.money).toBe(0);
    expect(emptyUsage.costs.coin).toBe(CoinOptions.Dollar);
    expect(emptyUsage.costs.electricity).toBe(0);
  });

  test('Should update usage properties', () => {
    usage.generalTemperature = 25;
    usage.humidity = 60;
    usage.costs.money = 150;
    usage.costs.coin = CoinOptions.Euro;
    usage.costs.electricity = 250;

    expect(usage.generalTemperature).toBe(25);
    expect(usage.humidity).toBe(60);
    expect(usage.costs.money).toBe(150);
    expect(usage.costs.coin).toBe(CoinOptions.Euro);
    expect(usage.costs.electricity).toBe(250);
  });
});
