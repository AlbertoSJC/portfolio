import { motion } from 'framer-motion';
import { Quest } from '@/domain/Quest';
import { ProgressBar } from '@/components/common/ProgressBar';
import { QuestStatus } from '@/enums/finquestEnums';

interface QuestCardProps {
  quest: Quest;
  onEdit?: (quest: Quest) => void;
  onDelete?: (questId: string) => void;
  onUpdateProgress?: (questId: string) => void;
  delay?: number;
}

  const statusColors = {
    active: '#6366f1',
    completed: '#10b981',
    failed: '#ef4444',
    locked: '#9ca3af',
  };

export function QuestCard({
  quest,
  onEdit,
  onDelete,
  onUpdateProgress,
  delay = 0,
}: QuestCardProps) {
  const isOverdue = quest.isOverdue();
  const isCompleted = quest.status === QuestStatus.Completed;

  return (
    <motion.div
      className={`quest-card quest-card-${quest.status}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="quest-header">
        <div>
          <h3>{quest.title}</h3>
          <p className="quest-category">{quest.category}</p>
        </div>
        <div
          className="quest-status-badge"
          style={{ borderLeftColor: statusColors[quest.status] }}
        >
          {quest.status}
        </div>
      </div>

      <p className="quest-description">{quest.description}</p>

      <div className="quest-meta">
        <div className="meta-item">
          <span className="label">Target</span>
          <span className="value">${quest.targetAmount}</span>
        </div>
        <div className="meta-item">
          <span className="label">Priority</span>
          <span className={`priority priority-${quest.priority}`}>
            {quest.priority}
          </span>
        </div>
        <div className="meta-item">
          <span className="label">Due</span>
          <span className={isOverdue && !isCompleted ? 'overdue' : ''}>
            {quest.dueDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      {!isCompleted && (
        <>
          <ProgressBar
            current={quest.currentAmount}
            target={quest.targetAmount}
            animated
          />
          <div className="quest-amount-display">
            <span>${quest.currentAmount.toFixed(2)}</span>
            <span className="separator">/</span>
            <span>${quest.targetAmount.toFixed(2)}</span>
          </div>
        </>
      )}

      <div className="quest-actions">
        {onEdit && (
          <button
            className="btn-action btn-edit"
            onClick={() => onEdit(quest)}
            aria-label="Edit quest"
          >
            Edit
          </button>
        )}
        {onUpdateProgress && !isCompleted && (
          <button
            className="btn-action btn-progress"
            onClick={() => onUpdateProgress(quest.id)}
            aria-label="Update progress"
          >
            Update Progress
          </button>
        )}
        {onDelete && (
          <button
            className="btn-action btn-delete"
            onClick={() => onDelete(quest.id)}
            aria-label="Delete quest"
          >
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}
