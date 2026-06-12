import { Player } from '@/domain/Player';
import { ProgressBar } from '@/components/common/ProgressBar';

interface Props {
  player: Player;
}

const XP_PER_LEVEL = 1000;

export function PlayerSummary({ player }: Props) {
  const xpIntoLevel = player.experience % XP_PER_LEVEL;
  const totalSaved = player.quests.reduce((sum, q) => sum + q.currentAmount, 0);
  const topAchievements = player.achievements.slice(0, 3);

  return (
    <div className="card">
      <div className="player-summary-header">
        <div>
          <h3>{player.username}</h3>
          <span className="player-level-badge">Level {player.level}</span>
        </div>
        <div className="player-coins">
          <span>🪙</span>
          <span>{player.coins}</span>
        </div>
      </div>

      <div className="player-xp">
        <div className="xp-label">
          <span>Experience</span>
          <span>{xpIntoLevel} / {XP_PER_LEVEL} XP</span>
        </div>
        <ProgressBar current={xpIntoLevel} target={XP_PER_LEVEL} animated />
      </div>

      <div className="player-stats-grid">
        <div className="stat-item">
          <span className="label">Active Quests</span>
          <span className="value">{player.getActiveQuestsCount()}</span>
        </div>
        <div className="stat-item">
          <span className="label">Completed</span>
          <span className="value">{player.getCompletedQuestsCount()}</span>
        </div>
        <div className="stat-item">
          <span className="label">Total Saved</span>
          <span className="value">${totalSaved.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="label">Achievements</span>
          <span className="value">{player.achievements.length}</span>
        </div>
      </div>

      {topAchievements.length > 0 && (
        <div className="player-achievements-row">
          <span className="achievements-row-label">Recent Achievements</span>
          <div className="achievement-icon-row">
            {topAchievements.map((a) => (
              <span key={a.id} title={a.title} className="achievement-icon-badge">
                {a.icon}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
