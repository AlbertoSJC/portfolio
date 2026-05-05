import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Quest } from '@/domain/Quest';
import { FinancialCategory, QuestPriority, QuestStatus } from '@/enums/finquestEnums';
import { QuestCard } from '@/components/quests/QuestCard';

describe('QuestCard', () => {
  it('renders active quest details and action buttons', () => {
    const quest = new Quest({
      id: '1',
      title: 'Emergency Fund',
      description: 'Save for a rainy day',
      category: FinancialCategory.Savings,
      targetAmount: 500,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.High,
    });

    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onUpdateProgress = vi.fn();

    render(
      <QuestCard
        quest={quest}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdateProgress={onUpdateProgress}
      />
    );

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('savings')).toBeInTheDocument();
    expect(screen.getByText(QuestStatus.Active)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit quest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete quest/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit quest/i }));
    fireEvent.click(screen.getByRole('button', { name: /update progress/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete quest/i }));

    expect(onEdit).toHaveBeenCalledWith(quest);
    expect(onUpdateProgress).toHaveBeenCalledWith('1');
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('hides progress and update button when quest is completed', () => {
    const quest = new Quest({
      id: '2',
      title: 'Budget Check',
      description: 'Review monthly budget',
      category: FinancialCategory.Budgeting,
      targetAmount: 200,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: QuestPriority.Low,
    });
    quest.updateProgress(200);

    render(<QuestCard quest={quest} />);

    expect(screen.getByText('Budget Check')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update progress/i })).not.toBeInTheDocument();
    expect(screen.getByText(QuestStatus.Completed)).toBeInTheDocument();
  });
});