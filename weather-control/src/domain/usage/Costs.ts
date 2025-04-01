import { CoinOptions } from '@components/landing/usage/info';

export interface CostsData {
  money: number;
  coin: CoinOptions;
  electricity: number;
}

export default class Costs {
  money: number;
  coin: CoinOptions;
  electricity: number;

  constructor(usage: CostsData) {
    this.money = usage.money;
    this.coin = usage.coin;
    this.electricity = usage.electricity;
  }

  public static createEmpty(): Costs {
    return new Costs({
      money: 0,
      electricity: 0,
      coin: CoinOptions.Dollar,
    });
  }
}
