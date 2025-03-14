import type { GoalsData } from '@components/types/types';

export enum UsageTypes {
  Temperature = 'temperature',
  Water = 'water',
}

export const usageInformation: Record<UsageTypes, GoalsData> = {
  [UsageTypes.Temperature]: { trees: 8, energy: 10, credits: 250 },
  [UsageTypes.Water]: { trees: 12, energy: 25, credits: 90 },
};
