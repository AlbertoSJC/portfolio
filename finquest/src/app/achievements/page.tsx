'use client';

import { usePlayerStore } from '@/stores/player';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDefaultAchievements } from '@/utils/fixtures';

export default function Achievements() {
  const { player } = usePlayerStore();

  if (!player) {
    return <div>Loading...</div>;
  }

  const allAchievements = getDefaultAchievements();
  const unlockedCount = player.achievements.length;
  const totalCount = allAchievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main>
      <div className="container">
        <Link href="/" className="btn-back">
          ← Back
        </Link>

        <h1>Achievements</h1>

        <div className="achievements-header">
          <div className="achievement-stats">
            <div className="stat-block">
              <div className="stat-value">{unlockedCount}</div>
              <div className="stat-label">Unlocked</div>
            </div>
            <div className="stat-block">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
          <div className="achievement-progress-container">
            <div className="progress-bar-large">
              <motion.div
                className="progress-fill-large"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="progress-text">{progressPercentage}% Complete</span>
          </div>
        </div>

        <section>
          <h2>
            {unlockedCount === 0
              ? 'No achievements yet'
              : `Unlocked (${unlockedCount}/${totalCount})`}
          </h2>
          {unlockedCount === 0 ? (
            <div className="empty-achievements">
              <div className="empty-icon">🎯</div>
              <p>No achievements unlocked yet.</p>
              <p className="empty-hint">
                Complete quests and reach milestones to earn achievements!
              </p>
            </div>
          ) : (
            <motion.div
              className="achievements-grid"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {player.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="achievement-card unlocked"
                  variants={item}
                >
                  <div className="achievement-icon-large">{achievement.icon}</div>
                  <div className="achievement-content">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <div className="achievement-footer">
                      <span className={`rarity ${achievement.rarity.toLowerCase()}`}>
                        {achievement.rarity}
                      </span>
                      {achievement.unlockedAt && (
                        <span className="unlock-date">
                          {achievement.unlockedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {unlockedCount < totalCount && (
          <section>
            <h2>Locked Achievements</h2>
            <div className="achievements-grid">
              {allAchievements
                .filter((ach) => !player.achievements.find((a) => a.id === ach.id))
                .map((achievement) => (
                  <div key={achievement.id} className="achievement-card locked">
                    <div className="achievement-icon-locked">{achievement.icon}</div>
                    <div className="achievement-content">
                      <h3>{achievement.title}</h3>
                      <p>{achievement.description}</p>
                      <div className="achievement-footer">
                        <span className={`rarity ${achievement.rarity.toLowerCase()}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
