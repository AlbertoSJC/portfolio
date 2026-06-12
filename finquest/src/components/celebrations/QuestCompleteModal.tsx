'use client';

import { motion } from 'motion/react';
import { ConfettiBurst } from '@/components/celebrations/ConfettiBurst';

interface QuestCompleteModalProps {
  celebrationId: string;
  questTitle: string;
  xpGained: number;
  coinsGained: number;
  achievementTitles: string[];
  onDismiss: () => void;
}

export function QuestCompleteModal({
  celebrationId,
  questTitle,
  xpGained,
  coinsGained,
  achievementTitles,
  onDismiss,
}: QuestCompleteModalProps) {
  return (
    <motion.div
      className="celebration-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      role="dialog"
      aria-label="Quest complete"
    >
      <ConfettiBurst burstKey={celebrationId} />
      <motion.div
        className="celebration-card"
        initial={{ scale: 0.6, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.div
          className="celebration-emblem"
          initial={{ rotate: -15, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
        >
          🏆
        </motion.div>
        <h2>Quest Complete!</h2>
        <p className="celebration-quest-title">{questTitle}</p>

        <div className="celebration-rewards">
          <motion.span
            className="celebration-reward xp"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            +{xpGained} XP
          </motion.span>
          <motion.span
            className="celebration-reward coins"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            🪙 +{coinsGained}
          </motion.span>
        </div>

        {achievementTitles.length > 0 && (
          <motion.div
            className="celebration-achievements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <span className="celebration-achievements-label">Achievement unlocked</span>
            {achievementTitles.map((title) => (
              <span key={title} className="celebration-achievement">
                {title}
              </span>
            ))}
          </motion.div>
        )}

        <span className="celebration-hint">Click anywhere to continue</span>
      </motion.div>
    </motion.div>
  );
}
