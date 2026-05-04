'use client';

import { usePlayerStore } from '@/stores/player';
import Link from 'next/link';

export default function Achievements() {
  const { player } = usePlayerStore();

  if (!player) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="container">
        <Link href="/" className="btn-back">
          ← Back
        </Link>

        <h1>Achievements</h1>

        <section>
          <h2>Unlocked Achievements ({player.achievements.length})</h2>
          {player.achievements.length === 0 ? (
            <p>No achievements unlocked yet. Complete quests to earn them!</p>
          ) : (
            <div className="achievements-grid">
              {player.achievements.map((achievement) => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <span className={`rarity ${achievement.rarity}`}>
                    {achievement.rarity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
