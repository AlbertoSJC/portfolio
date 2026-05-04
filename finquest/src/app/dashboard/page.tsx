'use client';

import Link from 'next/link';
import { usePlayerStore } from '@/stores/player';
import { CompletionPie } from '@/components/dashboard/CompletionPie';
import { CategoryBar } from '@/components/dashboard/CategoryBar';
import { ProgressLine } from '@/components/dashboard/ProgressLine';

export default function Dashboard() {
  const { player } = usePlayerStore();

  if (!player) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <main>
      <div className="container">
        <Link href="/" className="btn-back">
          ← Back
        </Link>

        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="page-subtitle">Visualize your progress and financial goals.</p>
          </div>
        </div>

        <section className="dashboard-grid">
          <CompletionPie player={player} />
          <CategoryBar player={player} />
          <ProgressLine player={player} />
        </section>
      </div>
    </main>
  );
}
