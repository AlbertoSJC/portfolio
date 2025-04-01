import Costs from '@domain/usage/Costs';
import { CoinOptions } from '@components/landing/usage/info';
import type { CostsData } from '@domain/usage/Costs';

const costsData: CostsData = {
  money: 100,
  coin: CoinOptions.Euro,
  electricity: 200,
};

describe('Domain > Costs', () => {
  let costs: Costs;
  beforeEach(() => {
    costs = new Costs(costsData);
  });

  test('Should initialize with given data', () => {
    expect(costs.money).toBe(costsData.money);
    expect(costs.coin).toBe(costsData.coin);
    expect(costs.electricity).toBe(costsData.electricity);
  });

  test('Should create an empty costs', () => {
    const emptyCosts = Costs.createEmpty();
    expect(emptyCosts.money).toBe(0);
    expect(emptyCosts.coin).toBe(CoinOptions.Dollar);
    expect(emptyCosts.electricity).toBe(0);
  });

  test('Should update costs properties', () => {
    costs.money = 150;
    costs.coin = CoinOptions.Euro;
    costs.electricity = 250;

    expect(costs.money).toBe(150);
    expect(costs.coin).toBe(CoinOptions.Euro);
    expect(costs.electricity).toBe(250);
  });
});
