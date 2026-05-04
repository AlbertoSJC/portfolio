import { Quest } from '@/domain/Quest';
import { QuestCard } from './QuestCard';

interface QuestGridProps {
  quests: Quest[];
  onEdit?: (quest: Quest) => void;
  onDelete?: (questId: string) => void;
  onUpdateProgress?: (questId: string) => void;
  emptyMessage?: string;
}

export function QuestGrid({
  quests,
  onEdit,
  onDelete,
  onUpdateProgress,
  emptyMessage = 'No quests found',
}: QuestGridProps) {
  if (quests.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="quest-grid">
      {quests.map((quest, index) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateProgress={onUpdateProgress}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}
