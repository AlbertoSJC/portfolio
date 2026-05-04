import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  target: number;
  animated?: boolean;
}

export function ProgressBar({ current, target, animated = true }: ProgressBarProps) {
  const percentage = Math.round((current / target) * 100);

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
        />
      </div>
      <span className="progress-text">{percentage}%</span>
    </div>
  );
}
