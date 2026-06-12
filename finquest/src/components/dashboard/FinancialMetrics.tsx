import { Player } from '@/domain/Player';
import { QuestStatus } from '@/enums/finquestEnums';

interface Props {
  player: Player;
}

export function FinancialMetrics({ player }: Props) {
  const totalSaved = player.quests.reduce((sum, q) => sum + q.currentAmount, 0);
  const totalGoal = player.quests.reduce((sum, q) => sum + q.targetAmount, 0);
  const completed = player.quests.filter((q) => q.status === QuestStatus.Completed).length;
  const completionRate = player.quests.length > 0
    ? Math.round((completed / player.quests.length) * 100)
    : 0;
  const totalXp = player.experience;

  const metrics = [
    {
      icon: '💰',
      value: `$${totalSaved.toLocaleString()}`,
      label: 'Total Saved',
      bg: 'rgba(16, 185, 129, 0.12)',
    },
    {
      icon: '🎯',
      value: `$${totalGoal.toLocaleString()}`,
      label: 'Total Goals',
      bg: 'rgba(99, 102, 241, 0.12)',
    },
    {
      icon: '✅',
      value: `${completionRate}%`,
      label: 'Completion Rate',
      bg: 'rgba(245, 158, 11, 0.12)',
    },
    {
      icon: '⭐',
      value: totalXp.toLocaleString(),
      label: 'Total XP Earned',
      bg: 'rgba(139, 92, 246, 0.12)',
    },
  ];

  return (
    <div className="metrics-hero">
      {metrics.map((m) => (
        <div key={m.label} className="metric-card">
          <div className="metric-icon-wrap" style={{ background: m.bg }}>
            {m.icon}
          </div>
          <div className="metric-body">
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
