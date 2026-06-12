import { describe, expect, it } from 'vitest';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { getPlayerTitle } from '@/utils/titles';
import { FinancialCategory } from '@/enums/finquestEnums';

function addCompleted(player: Player, category: FinancialCategory, count: number): void {
  for (let i = 0; i < count; i++) {
    const quest = new Quest({
      id: `${category}-${i}`,
      title: `Quest ${i}`,
      description: 'test',
      category,
      targetAmount: 100,
      dueDate: new Date(Date.now() + 86400000),
    });
    quest.completeQuest();
    player.addQuest(quest);
  }
}

describe('getPlayerTitle', () => {
  it('starts as Adventurer', () => {
    const player = new Player({ id: 'p1', username: 'Newbie' });
    expect(getPlayerTitle(player)).toBe('Adventurer');
  });

  it('becomes Frugal Apprentice at level 3 with a savings completion', () => {
    const player = new Player({ id: 'p1', username: 'Saver' });
    player.addExperience(2200);
    addCompleted(player, FinancialCategory.Savings, 1);

    expect(getPlayerTitle(player)).toBe('Frugal Apprentice');
  });

  it('prefers Debt Slayer over lower-priority titles', () => {
    const player = new Player({ id: 'p1', username: 'Slayer' });
    player.addExperience(6500);
    addCompleted(player, FinancialCategory.DebtPayoff, 2);
    addCompleted(player, FinancialCategory.Savings, 1);

    expect(getPlayerTitle(player)).toBe('Debt Slayer');
  });

  it('crowns Financial Legend at level 12 regardless of categories', () => {
    const player = new Player({ id: 'p1', username: 'Legend' });
    player.addExperience(11500);

    expect(getPlayerTitle(player)).toBe('Financial Legend');
  });
});
