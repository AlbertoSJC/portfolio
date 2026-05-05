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
