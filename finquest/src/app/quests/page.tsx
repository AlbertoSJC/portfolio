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
  const [updatingQuestId, setUpdatingQuestId] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState('');
  const [progressError, setProgressError] = useState<string | null>(null);

  const filteredQuests = useQuestFilter({
    quests: player?.quests ?? [],
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
        setUpdatingQuestId(questId);
        setProgressInput(quest.currentAmount.toString());
        setProgressError(null);
      }
    },
    [player]
  );

  const handleSubmitProgress = useCallback(() => {
    if (!updatingQuestId) return;

    const amount = parseFloat(progressInput);
    if (isNaN(amount) || amount < 0) {
      setProgressError('Please enter a valid non-negative amount.');
      return;
    }

    updateQuestProgress(updatingQuestId, amount);
    setUpdatingQuestId(null);
    setProgressInput('');
    setProgressError(null);
  }, [progressInput, updatingQuestId, updateQuestProgress]);

  const handleCancelProgress = useCallback(() => {
    setUpdatingQuestId(null);
    setProgressInput('');
    setProgressError(null);
  }, []);

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

        {updatingQuestId && (
          <div className="update-progress-container">
            <h3>Update Quest Progress</h3>
            <p>
              Enter a new current amount for{' '}
              <strong>{player.quests.find((q) => q.id === updatingQuestId)?.title}</strong>.
            </p>
            <div className="update-progress-controls">
              <input
                type="number"
                min="0"
                step="0.01"
                value={progressInput}
                onChange={(event) => {
                  setProgressInput(event.target.value);
                  setProgressError(null);
                }}
              />
              <button className="btn btn-primary" onClick={handleSubmitProgress}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={handleCancelProgress}>
                Cancel
              </button>
            </div>
            {progressError && <p className="form-error">{progressError}</p>}
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
