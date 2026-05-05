import { Quest } from '@/domain/Quest';
import { FinancialCategory, QuestPriority, QuestStatus } from '@/enums/finquestEnums';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Quest', () => {
  let quest: Quest;

  beforeEach(() => {
    quest = new Quest({
      id: '1',
      title: 'Save $500',
      description: 'Build emergency fund',
      category: FinancialCategory.Savings,
      targetAmount: 500,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.High,
    });
  });

  it('should create a quest with correct initial values', () => {
    expect(quest.id).toBe('1');
    expect(quest.title).toBe('Save $500');
    expect(quest.status).toBe(QuestStatus.Active);
    expect(quest.currentAmount).toBe(0);
  });

  it('should calculate progress percentage correctly', () => {
    quest.updateProgress(250);
    expect(quest.getProgressPercentage()).toBe(50);
  });

  it('should complete quest when target amount is reached', () => {
    quest.updateProgress(500);
    expect(quest.status).toBe(QuestStatus.Completed);
    expect(quest.completedAt).toBeDefined();
  });

  it('should determine if quest is overdue', () => {
    const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const overdueQuest = new Quest({
      id: '2',
      title: 'Test',
      description: 'Test',
      category: FinancialCategory.Savings,
      targetAmount: 100,
      dueDate: pastDate,
    });
    expect(overdueQuest.isOverdue()).toBe(true);
  });
});
