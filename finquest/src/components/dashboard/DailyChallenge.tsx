'use client';

import { motion } from 'motion/react';
import { Player } from '@/domain/Player';
import { DAILY_CHALLENGE_REWARD, getTodaysChallenge } from '@/utils/fixtures';
import { toDateKey } from '@/utils/date';

interface Props {
  player: Player;
}

export function DailyChallenge({ player }: Props) {
  const challenge = getTodaysChallenge();
  const isDone = player.dailyChallengeDate === toDateKey(new Date());

  return (
    <motion.section
      className={`daily-challenge${isDone ? ' daily-challenge--done' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="daily-challenge-icon">{isDone ? '✅' : challenge.icon}</div>
      <div className="daily-challenge-body">
        <span className="daily-challenge-label">Daily Challenge</span>
        <h3>{challenge.title}</h3>
        <p>{isDone ? 'Done for today — come back tomorrow!' : challenge.description}</p>
      </div>
      <div className="daily-challenge-reward">
        <span>+{DAILY_CHALLENGE_REWARD.experience} XP</span>
        <span>🪙 +{DAILY_CHALLENGE_REWARD.coins}</span>
      </div>
    </motion.section>
  );
}
