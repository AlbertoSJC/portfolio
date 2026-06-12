'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '@/stores/player';
import { Quest } from '@/domain/Quest';
import { QuestStatus, QuestPriority, FinancialCategory } from '@/enums/finquestEnums';
import { QuestForm } from '@/components/quests/QuestForm';
import { QuestGrid } from '@/components/quests/QuestGrid';
import { QuestFilter } from '@/components/quests/QuestFilter';
import { Modal } from '@/components/common/Modal';
import { useQuestFilter } from '@/hooks/useQuestFilter';

export default function QuestsPage() {
  const { player, _hasHydrated, addQuest, editQuest, deleteQuest, updateQuestProgress, completeQuest } = usePlayerStore();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<QuestPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<FinancialCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress'>('dueDate');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [updatingQuestId, setUpdatingQuestId] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState('');
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressFloat, setProgressFloat] = useState<{ key: number; text: string } | null>(null);

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

    const quest = player?.quests.find((q) => q.id === updatingQuestId);
    const delta = quest ? amount - quest.currentAmount : 0;
    const completes = quest ? amount >= quest.targetAmount : false;

    updateQuestProgress(updatingQuestId, amount);
    if (delta > 0 && !completes) {
      setProgressFloat({ key: Date.now(), text: `+$${delta.toLocaleString()} saved` });
    }
    setUpdatingQuestId(null);
    setProgressInput('');
    setProgressError(null);
  }, [progressInput, updatingQuestId, updateQuestProgress, player]);

  const handleCancelProgress = useCallback(() => {
    setUpdatingQuestId(null);
    setProgressInput('');
    setProgressError(null);
  }, []);

  const handleEditQuest = useCallback((quest: Quest) => {
    setShowCreateForm(false);
    setEditingQuest(quest);
  }, []);

  const handleSaveEdit = useCallback(
    (questData: {
      title: string;
      description: string;
      category: FinancialCategory;
      targetAmount: number;
      dueDate: Date;
      priority: QuestPriority;
    }) => {
      if (!editingQuest) return;
      editQuest(editingQuest.id, questData);
      setEditingQuest(null);
    },
    [editingQuest, editQuest]
  );

  const handleDeleteQuest = useCallback(
    (questId: string) => {
      deleteQuest(questId);
    },
    [deleteQuest]
  );

  const handleCompleteQuest = useCallback(
    (questId: string) => {
      completeQuest(questId);
    },
    [completeQuest]
  );

  useEffect(() => {
    if (_hasHydrated && !player) router.replace('/');
  }, [_hasHydrated, player, router]);

  if (!_hasHydrated || !player) {
    return <div className="loading">Loading...</div>;
  }

  const activeQuests = player.quests.filter((q) => q.status === QuestStatus.Active);
  const completedQuests = player.quests.filter((q) => q.status === QuestStatus.Completed);

  return (
    <main>
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Quests</h1>
            <p className="page-subtitle">
              {activeQuests.length} active · {completedQuests.length} completed
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowCreateForm(true);
              setEditingQuest(null);
            }}
          >
            + Create Quest
          </button>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <Modal title="Create Quest" onClose={() => setShowCreateForm(false)}>
              <QuestForm
                onSubmit={handleCreateQuest}
                onCancel={() => setShowCreateForm(false)}
              />
            </Modal>
          )}

          {editingQuest && (
            <Modal title="Edit Quest" onClose={() => setEditingQuest(null)}>
              <QuestForm
                key={editingQuest.id}
                initialData={editingQuest}
                onSubmit={handleSaveEdit}
                onCancel={() => setEditingQuest(null)}
              />
            </Modal>
          )}

          {updatingQuestId && (
            <Modal title="Update Quest Progress" onClose={handleCancelProgress}>
              <p>
                Enter a new current amount for{' '}
                <strong>{player.quests.find((q) => q.id === updatingQuestId)?.title}</strong>.
              </p>
              <div className="update-progress-controls">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  autoFocus
                  value={progressInput}
                  onChange={(event) => {
                    setProgressInput(event.target.value);
                    setProgressError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSubmitProgress();
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
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {progressFloat && (
            <motion.div
              key={progressFloat.key}
              className="progress-float"
              initial={{ opacity: 0, y: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], y: -56, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut', times: [0, 0.15, 0.75, 1] }}
              onAnimationComplete={() => setProgressFloat(null)}
            >
              {progressFloat.text}
            </motion.div>
          )}
        </AnimatePresence>

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
                  onEdit={handleEditQuest}
                  onDelete={handleDeleteQuest}
                  onUpdateProgress={handleUpdateProgress}
                  onComplete={handleCompleteQuest}
                />
              </section>
            )}

            {filteredQuests.filter((q) => q.status === QuestStatus.Completed).length > 0 && (
              <section className="quest-section">
                <h2>Completed Quests</h2>
                <QuestGrid
                  quests={filteredQuests.filter((q) => q.status === QuestStatus.Completed)}
                  onDelete={handleDeleteQuest}
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
