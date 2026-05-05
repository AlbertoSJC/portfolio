import { Player } from '@/domain/Player';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#ef4444'];

export function CompletionPie({ player }: { player: Player }) {
  const completed = player.getCompletedQuestsCount();
  const active = player.getActiveQuestsCount();
  const total = player.quests.length;
  const failed = total - completed - active;

  const data = [
    { name: 'Completed', value: completed },
    { name: 'Active', value: active },
  ];

  if (failed > 0) data.push({ name: 'Failed', value: failed });

  return (
    <div className="chart-card">
      <h3>Quest Completion</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
