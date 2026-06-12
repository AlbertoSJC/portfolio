'use client';

import { motion } from 'motion/react';
import { ConfettiBurst } from '@/components/celebrations/ConfettiBurst';

interface LevelUpOverlayProps {
  celebrationId: string;
  newLevel: number;
  onDismiss: () => void;
}

export function LevelUpOverlay({ celebrationId, newLevel, onDismiss }: LevelUpOverlayProps) {
  return (
    <motion.div
      className="celebration-overlay celebration-overlay--level"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      role="dialog"
      aria-label={`Level ${newLevel} reached`}
    >
      <ConfettiBurst burstKey={celebrationId} />
      <motion.div
        className="celebration-card celebration-card--level"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <motion.span
          className="levelup-label"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          LEVEL UP
        </motion.span>
        <motion.span
          className="levelup-number"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.25, 1] }}
          transition={{ delay: 0.35, duration: 0.6, times: [0, 0.7, 1] }}
        >
          {newLevel}
        </motion.span>
        <motion.span
          className="levelup-bonus"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          🪙 +100 bonus coins
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
