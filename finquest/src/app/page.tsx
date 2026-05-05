'use client';

import { Player } from '@/domain/Player';
import { usePlayerStore } from '@/stores/player';
import { createDemoQuests } from '@/utils/fixtures';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { player, initializePlayer } = usePlayerStore();

  useEffect(() => {
    if (!player) {
      const demoPlayer = new Player({ id: '1', username: 'Adventurer' });
      const demoQuests = createDemoQuests();
      demoQuests.forEach((q) => demoPlayer.addQuest(q));
      initializePlayer(demoPlayer);
    }
  }, [player, initializePlayer]);

  return (
    <main>
      <div className="hero-section">
        <h1>Welcome to FinQuest</h1>
        <p>Transform your financial goals into an exciting adventure game</p>

        {player && (
          <div className="player-summary">
            <h2>Welcome, {player.username}!</h2>
            <div className="player-stats">
              <div className="stat">
                <span>Level</span>
                <strong>{player.level}</strong>
              </div>
              <div className="stat">
                <span>Experience</span>
                <strong>{player.experience}</strong>
              </div>
              <div className="stat">
                <span>Coins</span>
                <strong>{player.coins}</strong>
              </div>
              <div className="stat">
                <span>Quests</span>
                <strong>{player.getActiveQuestsCount()}</strong>
              </div>
            </div>
          </div>
        )}

        <nav className="main-nav">
          <Link href="/dashboard" className="btn btn-primary">
            Dashboard
          </Link>
          <Link href="/quests" className="btn btn-secondary">
            Quests
          </Link>
          <Link href="/achievements" className="btn btn-secondary">
            Achievements
          </Link>
        </nav>
      </div>
    </main>
  );
}
