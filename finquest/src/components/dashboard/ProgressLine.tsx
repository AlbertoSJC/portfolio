import React from 'react';
import { Player } from '@/domain/Player';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function ProgressLine({ player }: { player: Player }) {
  const data = player.quests
    .filter((q) => q.status === 'completed')
    .sort((a, b) => a.completedAt?.getTime()! - b.completedAt?.getTime()!)
    .map((quest) => ({
      name: quest.completedAt?.toLocaleDateString() ?? 'Completed',
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
