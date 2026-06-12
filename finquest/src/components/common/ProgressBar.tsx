import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  target: number;
  animated?: boolean;
  variant?: 'default' | 'banner' | 'mini';
  showLabel?: boolean;
}

export function ProgressBar({
  current,
  target,
  animated = true,
  variant = 'default',
  showLabel = true,
}: ProgressBarProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

  return (
    <div className={`progress-container progress-container--${variant}`}>
      <div className={`progress-bar progress-bar--${variant}`}>
        <motion.div
          className={`progress-fill progress-fill--${variant}`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
      {showLabel && (
        <span className={`progress-text progress-text--${variant}`}>{percentage}%</span>
      )}
    </div>
  );
}
