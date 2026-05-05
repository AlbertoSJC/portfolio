import { useMemo } from 'react';
import { QuestStatus, QuestPriority, FinancialCategory } from '@/enums/finquestEnums';
import { Quest } from '@/domain/Quest';

interface UseQuestFilterOptions {
  quests: Quest[];
  searchTerm: string;
  statusFilter: QuestStatus | 'all';
  priorityFilter: QuestPriority | 'all';
  categoryFilter: FinancialCategory | 'all';
  sortBy: 'dueDate' | 'priority' | 'progress';
}

export function useQuestFilter({
  quests,
  searchTerm,
  statusFilter,
  priorityFilter,
  categoryFilter,
  sortBy,
}: UseQuestFilterOptions) {
  const filtered = useMemo(() => {
    return quests
      .filter((quest) => {
        if (searchTerm && !quest.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (statusFilter !== 'all' && quest.status !== statusFilter) {
          return false;
        }
        if (priorityFilter !== 'all' && quest.priority !== priorityFilter) {
          return false;
        }
        if (categoryFilter !== 'all' && quest.category !== categoryFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'priority') {
          const priorityOrder: Record<QuestPriority, number> = {
            high: 0,
            medium: 1,
            low: 2,
          };
          const priorityA = a.priority as QuestPriority;
          const priorityB = b.priority as QuestPriority;
          return priorityOrder[priorityA] - priorityOrder[priorityB];
        }
        if (sortBy === 'progress') {
          return b.getProgressPercentage() - a.getProgressPercentage();
        }
        return 0;
      });
  }, [quests, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy]);

  return filtered;
}
