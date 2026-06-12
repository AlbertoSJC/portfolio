import { Player } from '@/domain/Player';
import { QuestStatus } from '@/enums/finquestEnums';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function ProgressLine({ player }: { player: Player }) {
  const data = player.quests
    .filter((q) => q.status === QuestStatus.Completed)
    .sort((a, b) => {
      const aTime = a.completedAt?.getTime() ?? 0;
      const bTime = b.completedAt?.getTime() ?? 0;
      return aTime - bTime;
    })
    .map((quest) => ({
      name: quest.completedAt?.toLocaleDateString() ?? QuestStatus.Completed,
      value: quest.targetAmount,
    }));

  if (data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Completed Quest Growth</h3>
        <div className="chart-empty">
          <p>No completed quests yet</p>
          <p className="empty-hint">Finish a quest to start tracking your growth</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Completed Quest Growth</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
