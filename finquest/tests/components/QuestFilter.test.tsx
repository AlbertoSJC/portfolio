import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestFilter } from '@/components/quests/QuestFilter';
import { QuestPriority, QuestStatus, FinancialCategory } from '@/enums/finquestEnums';

describe('QuestFilter', () => {
  it('renders filter inputs and propagates changes', () => {
    const onSearchChange = vi.fn();
    const onStatusChange = vi.fn();
    const onPriorityChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onSortChange = vi.fn();

    render(
      <QuestFilter
        searchTerm=""
        onSearchChange={onSearchChange}
        statusFilter="all"
        onStatusChange={onStatusChange}
        priorityFilter="all"
        onPriorityChange={onPriorityChange}
        categoryFilter="all"
        onCategoryChange={onCategoryChange}
        sortBy="dueDate"
        onSortChange={onSortChange}
      />
    );

    fireEvent.input(screen.getByPlaceholderText(/search quests/i), {
      target: { value: 'budget' },
    });
    fireEvent.change(screen.getByDisplayValue('All Statuses'), {
      target: { value: QuestStatus.Completed },
    });
    fireEvent.change(screen.getByDisplayValue('All Priorities'), {
      target: { value: QuestPriority.Low },
    });
    fireEvent.change(screen.getByDisplayValue('All Categories'), {
      target: { value: FinancialCategory.Investing },
    });
    fireEvent.change(screen.getByDisplayValue('Sort by Due Date'), {
      target: { value: 'progress' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('budget');
    expect(onStatusChange).toHaveBeenCalledWith(QuestStatus.Completed);
    expect(onPriorityChange).toHaveBeenCalledWith(QuestPriority.Low);
    expect(onCategoryChange).toHaveBeenCalledWith(FinancialCategory.Investing);
    expect(onSortChange).toHaveBeenCalledWith('progress');
  });
});