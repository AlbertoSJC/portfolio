'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/stores/player';
import { Quest } from '@/domain/Quest';
import { QuestStatus, QuestPriority, FinancialCategory } from '@/enums/finquestEnums';
import { QuestForm } from '@/components/quests/QuestForm';
import { QuestGrid } from '@/components/quests/QuestGrid';
import { QuestFilter } from '@/components/quests/QuestFilter';
import { useQuestFilter } from '@/hooks/useQuestFilter';

export default function QuestsPage() {
  const { player, addQuest, updateQuestProgress } = usePlayerStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<QuestPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<FinancialCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress'>('dueDate');

  const filteredQuests = useQuestFilter({
    quests: player?.quests || [],
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
  });

  const handleCreateQuest = useCallback(
    (questData: {
      title: string;
      description: string;
      category: FinancialCategory;
      targetAmount: number;
      dueDate: Date;
      priority: QuestPriority;
    }) => {
      if (!player) return;
      const newQuest = new Quest({
        id: `quest-${Date.now()}`,
        title: questData.title,
        description: questData.description,
        category: questData.category,
        targetAmount: questData.targetAmount,
        dueDate: questData.dueDate,
        priority: questData.priority,
      });

      addQuest(newQuest);
      setShowCreateForm(false);
    },
    [addQuest, player]
  );

  const handleUpdateProgress = useCallback(
    (questId: string) => {
      if (!player) return;
      const quest = player.quests.find((q) => q.id === questId);
      if (quest) {
        const newAmount = prompt(
          `Current: $${quest.currentAmount}. Enter new amount:`,
          quest.currentAmount.toString()
        );

        if (newAmount !== null) {
          const amount = parseFloat(newAmount);
          if (!isNaN(amount) && amount >= 0) {
            updateQuestProgress(questId, amount);
          }
        }
      }
    },
    [player, updateQuestProgress]
  );

  if (!player) {
    return <div className="loading">Loading...</div>;
  }

  const activeQuests = player.quests.filter((q) => q.status === QuestStatus.Active);
  const completedQuests = player.quests.filter((q) => q.status === QuestStatus.Completed);

  return (
    <main>
      <div className="container">
        <Link href="/" className="btn-back">
          ← Back
        </Link>

        <div className="page-header">
          <div>
            <h1>Quests</h1>
            <p className="page-subtitle">
              {activeQuests.length} active · {completedQuests.length} completed
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Quest'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-form-container">
            <QuestForm
              onSubmit={handleCreateQuest}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <QuestFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {filteredQuests.length === 0 ? (
          <div className="empty-state">
            <p>No quests match your filters</p>
          </div>
        ) : (
          <>
            {filteredQuests.filter((q) => q.status === QuestStatus.Active).length > 0 && (
              <section className="quest-section">
                <h2>Active Quests</h2>
                <QuestGrid
                  quests={filteredQuests.filter((q) => q.status === QuestStatus.Active)}
                  onUpdateProgress={handleUpdateProgress}
                />
              </section>
            )}

            {filteredQuests.filter((q) => q.status === QuestStatus.Completed).length > 0 && (
              <section className="quest-section">
                <h2>Completed Quests</h2>
                <QuestGrid
                  quests={filteredQuests.filter((q) => q.status === QuestStatus.Completed)}
                  emptyMessage="No completed quests yet"
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
