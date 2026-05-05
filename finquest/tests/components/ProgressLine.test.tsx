import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { QuestStatus, FinancialCategory, QuestPriority } from '@/enums/finquestEnums';
import { ProgressLine } from '@/components/dashboard/ProgressLine';

describe('ProgressLine', () => {
  it('renders a completed quest chart and excludes active quests', () => {
    const player = new Player({ id: 'player-1', username: 'test-player' });

    const completedQuest = new Quest({
      id: 'q1',
      title: 'Goal One',
      description: 'Complete goal one',
      category: FinancialCategory.Savings,
      targetAmount: 400,
      dueDate: new Date('2026-01-01'),
      priority: QuestPriority.Medium,
    });
    completedQuest.status = QuestStatus.Completed;
    completedQuest.completedAt = new Date('2026-01-01');
    completedQuest.currentAmount = 400;

    const activeQuest = new Quest({
      id: 'q2',
      title: 'Goal Two',
      description: 'Ongoing goal',
      category: FinancialCategory.Learning,
      targetAmount: 150,
      dueDate: new Date('2026-01-05'),
      priority: QuestPriority.Low,
    });

    player.addQuest(completedQuest);
    player.addQuest(activeQuest);

    const { container } = render(<ProgressLine player={player} />);

    expect(screen.getByText('Completed Quest Growth')).toBeInTheDocument();
    expect(container.querySelector('.chart-card')).toBeInTheDocument();
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});