'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
const PARTICLE_COUNT = 36;

interface Particle {
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
}

export function ConfettiBurst({ burstKey }: { burstKey: string }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        left: Math.random() * 100,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 160,
        rotation: 360 + Math.random() * 540,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey]
  );

  return (
    <div className="confetti-layer" aria-hidden="true">
      {particles.map((particle, index) => (
        <motion.span
          key={`${burstKey}-${index}`}
          className="confetti-particle"
          style={{
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size * 0.6,
            backgroundColor: particle.color,
          }}
          initial={{ y: '-10vh', x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', x: particle.drift, rotate: particle.rotation, opacity: [1, 1, 0.8, 0] }}
          transition={{ duration: particle.duration, delay: particle.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
