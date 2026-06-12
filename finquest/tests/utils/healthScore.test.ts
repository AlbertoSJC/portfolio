import { describe, expect, it } from 'vitest';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { calculateFinancialHealthScore, getScoreTier } from '@/utils/healthScore';
import { FinancialCategory } from '@/enums/finquestEnums';

function quest(id: string, category: FinancialCategory, options: { progress?: number; overdue?: boolean; completed?: boolean } = {}): Quest {
  const q = new Quest({
    id,
    title: `Quest ${id}`,
    description: 'test',
    category,
    targetAmount: 100,
    dueDate: new Date(Date.now() + (options.overdue ? -1 : 1) * 86400000),
  });
  if (options.completed) q.completeQuest();
  else if (options.progress) q.currentAmount = options.progress;
  return q;
}

describe('calculateFinancialHealthScore', () => {
  it('returns zero for a player with no quests', () => {
    const player = new Player({ id: 'p1', username: 'Empty' });
    const { total, breakdown } = calculateFinancialHealthScore(player);

    expect(total).toBe(0);
    expect(breakdown).toEqual({ completionRate: 0, savingsProgress: 0, categoryDiversity: 0, timeliness: 0 });
  });

  it('awards full marks for a perfect portfolio', () => {
    const player = new Player({ id: 'p1', username: 'Perfect' });
    player.addQuest(quest('s1', FinancialCategory.Savings, { completed: true }));
    player.addQuest(quest('i1', FinancialCategory.Investing, { completed: true }));
    player.addQuest(quest('d1', FinancialCategory.DebtPayoff, { completed: true }));
    player.addQuest(quest('b1', FinancialCategory.Budgeting, { completed: true }));
    player.addQuest(quest('l1', FinancialCategory.Learning, { completed: true }));
    player.quests.forEach((q) => {
      q.currentAmount = q.targetAmount;
    });

    const { total } = calculateFinancialHealthScore(player);
    expect(total).toBe(100);
  });

  it('penalizes overdue active quests via timeliness', () => {
    const player = new Player({ id: 'p1', username: 'Late' });
    player.addQuest(quest('q1', FinancialCategory.Savings, { overdue: true }));
    player.addQuest(quest('q2', FinancialCategory.Savings));

    const { breakdown } = calculateFinancialHealthScore(player);
    expect(breakdown.timeliness).toBe(13);
  });

  it('measures savings progress only on savings and debt quests', () => {
    const player = new Player({ id: 'p1', username: 'Saver' });
    player.addQuest(quest('s1', FinancialCategory.Savings, { progress: 50 }));
    player.addQuest(quest('l1', FinancialCategory.Learning, { progress: 100 }));

    const { breakdown } = calculateFinancialHealthScore(player);
    expect(breakdown.savingsProgress).toBe(13);
  });
});

describe('getScoreTier', () => {
  it('maps totals to tiers', () => {
    expect(getScoreTier(10).label).toBe('Needs Attention');
    expect(getScoreTier(45).label).toBe('Building');
    expect(getScoreTier(75).label).toBe('Healthy');
    expect(getScoreTier(95).label).toBe('Excellent');
  });
});
