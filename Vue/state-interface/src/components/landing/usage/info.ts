import type { GoalsData } from '@domain/Goals';

export enum UsageTypes {
  Temperature = 'temperature',
  Water = 'water',
}

export enum CoinOptions {
  Euro = '€',
  Dollar = '$',
}

export const goalsUsageInformation: Record<UsageTypes, GoalsData> = {
  [UsageTypes.Temperature]: { trees: 8, energy: 10, credits: 250 },
  [UsageTypes.Water]: { trees: 12, energy: 25, credits: 90 },
};
