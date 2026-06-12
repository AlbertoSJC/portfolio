'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryBar } from '@/components/dashboard/CategoryBar';
import { CompletionPie } from '@/components/dashboard/CompletionPie';
import { DailyChallenge } from '@/components/dashboard/DailyChallenge';
import { ExchangeRates } from '@/components/dashboard/ExchangeRates';
import { FinancialHealthScore } from '@/components/dashboard/FinancialHealthScore';
import { FinancialMetrics } from '@/components/dashboard/FinancialMetrics';
import { PlayerSummary } from '@/components/dashboard/PlayerSummary';
import { ProgressLine } from '@/components/dashboard/ProgressLine';
import { usePlayerStore } from '@/stores/player';

export default function Dashboard() {
  const { player, _hasHydrated } = usePlayerStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !player) router.replace('/');
  }, [_hasHydrated, player, router]);

  if (!_hasHydrated || !player) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <main>
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="page-subtitle">Visualize your progress and financial goals.</p>
          </div>
        </div>

        <DailyChallenge player={player} />

        <FinancialMetrics player={player} />

        <section className="dashboard-grid">
          <FinancialHealthScore player={player} />
          <PlayerSummary player={player} />
          <CompletionPie player={player} />
          <CategoryBar player={player} />
          <ProgressLine player={player} />
          <ExchangeRates />
        </section>
      </div>
    </main>
  );
}
