import { motion } from 'motion/react';
import { Quest } from '@/domain/Quest';
import { ProgressBar } from '@/components/common/ProgressBar';
import { QuestStatus } from '@/enums/finquestEnums';
import { CATEGORY_META } from '@/utils/fixtures';

interface QuestCardProps {
  quest: Quest;
  onEdit?: (quest: Quest) => void;
  onDelete?: (questId: string) => void;
  onUpdateProgress?: (questId: string) => void;
  onComplete?: (questId: string) => void;
  delay?: number;
}

export function QuestCard({
  quest,
  onEdit,
  onDelete,
  onUpdateProgress,
  onComplete,
  delay = 0,
}: QuestCardProps) {
  const isOverdue = quest.isOverdue();
  const isCompleted = quest.status === QuestStatus.Completed;
  const meta = CATEGORY_META[quest.category];

  return (
    <motion.div
      className={`quest-card quest-card-${quest.status}`}
      style={{ borderLeftColor: isCompleted ? '#10b981' : meta.color }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="quest-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
          <span className="quest-category-icon" title={meta.label}>{meta.icon}</span>
          <div>
            <h3>{quest.title}</h3>
            <p className="quest-category">{meta.label}</p>
          </div>
        </div>
        <span
          className="quest-status-badge"
          style={{ color: isCompleted ? '#10b981' : meta.color }}
        >
          {quest.status}
        </span>
      </div>

      <p className="quest-description">{quest.description}</p>

      <div className="quest-meta">
        <div className="meta-item">
          <span className="label">Target</span>
          <span className="value">${quest.targetAmount.toLocaleString()}</span>
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
          <ProgressBar current={quest.currentAmount} target={quest.targetAmount} animated />
          <div className="quest-amount-display">
            <span>${quest.currentAmount.toFixed(2)}</span>
            <span className="separator">/</span>
            <span>${quest.targetAmount.toFixed(2)}</span>
          </div>
        </>
      )}

      {isCompleted && (
        <div className="quest-rewards-display">
          <span>+{quest.rewards.experience} XP</span>
          <span className="separator">·</span>
          <span>🪙 {quest.rewards.coins}</span>
        </div>
      )}

      <div className="quest-actions">
        {onEdit && !isCompleted && (
          <button className="btn-action btn-edit" onClick={() => onEdit(quest)} aria-label="Edit quest">
            Edit
          </button>
        )}
        {onUpdateProgress && !isCompleted && (
          <button className="btn-action btn-progress" onClick={() => onUpdateProgress(quest.id)} aria-label="Update progress">
            Update Progress
          </button>
        )}
        {onComplete && !isCompleted && (
          <button className="btn-action btn-complete" onClick={() => onComplete(quest.id)} aria-label="Mark as complete">
            Complete
          </button>
        )}
        {onDelete && (
          <button className="btn-action btn-delete" onClick={() => onDelete(quest.id)} aria-label="Delete quest">
            Delete
          </button>
        )}
      </div>
    </motion.div>
  );
}
