'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Player } from '@/domain/Player';
import { calculateFinancialHealthScore, getScoreTier } from '@/utils/healthScore';
import { useScoreHistoryStore } from '@/stores/scoreHistory';

const GAUGE_RADIUS = 52;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const BREAKDOWN_LABELS: Record<string, string> = {
  completionRate: 'Quest Completion',
  savingsProgress: 'Savings Progress',
  categoryDiversity: 'Category Diversity',
  timeliness: 'Timeliness',
};

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;

  const width = 120;
  const height = 32;
  const max = 100;
  const step = width / (points.length - 1);
  const path = points
    .map((value, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - (value / max) * height).toFixed(1)}`)
    .join(' ');

  return (
    <svg className="score-sparkline" viewBox={`0 0 ${width} ${height}`} aria-label="Score history">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FinancialHealthScore({ player }: { player: Player }) {
  const [expanded, setExpanded] = useState(false);
  const { total, breakdown } = calculateFinancialHealthScore(player);
  const tier = getScoreTier(total);
  const snapshots = useScoreHistoryStore((state) => state.snapshots);
  const recordDailyScore = useScoreHistoryStore((state) => state.recordDailyScore);

  useEffect(() => {
    recordDailyScore(total);
  }, [total, recordDailyScore]);

  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - total / 100);

  return (
    <div className="health-score-card chart-card">
      <div className="health-score-header">
        <h3>Financial Health</h3>
        <button
          className="health-score-toggle"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide breakdown' : 'Show breakdown'}
        </button>
      </div>

      <div className="health-score-gauge-wrap">
        <svg className="health-score-gauge" viewBox="0 0 120 120" role="img" aria-label={`Financial health score ${total} out of 100`}>
          <circle cx="60" cy="60" r={GAUGE_RADIUS} className="gauge-track" />
          <motion.circle
            cx="60"
            cy="60"
            r={GAUGE_RADIUS}
            className="gauge-fill"
            stroke={tier.color}
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            initial={{ strokeDashoffset: GAUGE_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </svg>
        <div className="health-score-value">
          <span className="score-number" style={{ color: tier.color }}>{total}</span>
          <span className="score-tier" style={{ color: tier.color }}>{tier.label}</span>
        </div>
      </div>

      {snapshots.length >= 2 && (
        <div className="health-score-history" style={{ color: tier.color }}>
          <Sparkline points={snapshots.map((s) => s.score)} />
          <span className="score-history-label">last {snapshots.length} days</span>
        </div>
      )}

      {expanded && (
        <motion.div
          className="health-score-breakdown"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="breakdown-row">
              <span className="breakdown-label">{BREAKDOWN_LABELS[key]}</span>
              <div className="breakdown-bar">
                <motion.div
                  className="breakdown-bar-fill"
                  style={{ backgroundColor: tier.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / 25) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="breakdown-value">{value} / 25</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
