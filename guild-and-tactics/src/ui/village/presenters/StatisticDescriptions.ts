import type { UnitStatistics } from '../../../sim/units/Unit';

export const STATISTIC_SHORT_LABELS: Record<keyof UnitStatistics, string> = {
  hitPointsMaximum: 'HP',
  manaPointsMaximum: 'MP',
  attack: 'ATK',
  defense: 'DEF',
  magicPower: 'MAG',
  magicResistance: 'RES',
  speed: 'SPD',
  movementRange: 'MOVE',
  jumpHeight: 'JUMP',
  evasion: 'EVA',
};

export function describeStatisticBonuses(bonuses: Partial<UnitStatistics>): string {
  const bonusDescriptions: string[] = [];
  for (const [statisticName, amount] of Object.entries(bonuses) as [keyof UnitStatistics, number][]) {
    if (amount === 0) {
      continue;
    }
    const displayAmount =
      statisticName === 'evasion' ? `${Math.round(amount * 100)}%` : `${Math.abs(amount)}`;
    bonusDescriptions.push(
      `${amount > 0 ? '+' : '−'}${displayAmount} ${STATISTIC_SHORT_LABELS[statisticName]}`,
    );
  }
  return bonusDescriptions.join(', ');
}
