import { Player } from '@/domain/Player';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function CategoryBar({ player }: { player: Player }) {
  const categories = new Map<string, number>();

  player.quests.forEach((q) => {
    const key = q.category;
    const prev = categories.get(key) || 0;
    categories.set(key, prev + q.targetAmount);
  });

  const data = Array.from(categories.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div className="chart-card">
      <h3>Targets by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
