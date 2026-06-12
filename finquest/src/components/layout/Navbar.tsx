'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { usePlayerStore } from '@/stores/player';
import { useNotificationStore } from '@/stores/notification';
import { useTheme } from '@/hooks/useTheme';
import { getPlayerTitle } from '@/utils/titles';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/quests', label: 'Quests' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/account', label: 'Account' },
];

export function Navbar() {
  const pathname = usePathname();
  const { player } = usePlayerStore();
  const { isDark, toggleTheme } = useTheme();
  const playerTitle = player ? getPlayerTitle(player) : null;
  const previousTitle = useRef<string | null>(null);

  useEffect(() => {
    if (!playerTitle) return;
    if (previousTitle.current && previousTitle.current !== playerTitle) {
      useNotificationStore.getState().pushNotification({
        title: 'New title unlocked!',
        message: `You are now known as ${playerTitle}.`,
        variant: 'success',
      });
    }
    previousTitle.current = playerTitle;
  }, [playerTitle]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="navbar-brand-icon">⚔️</span>
          <span className="navbar-brand-name">FinQuest</span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`navbar-link${pathname === href ? ' navbar-link-active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navbar-player">
          {player && (
            <>
              <span className="navbar-identity">
                <span className="navbar-username">{player.username}</span>
                <span className="navbar-title">{playerTitle}</span>
              </span>
              <span className="navbar-level">Lv {player.level}</span>
              <span className="navbar-coins">🪙 {player.coins.toLocaleString()}</span>
              <motion.span
                key={player.streak.currentStreak}
                className={`navbar-streak${player.streak.currentStreak === 0 ? ' navbar-streak--cold' : ''}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.45 }}
                title={`Activity streak: ${player.streak.currentStreak} day${player.streak.currentStreak === 1 ? '' : 's'} (best ${player.streak.longestStreak})`}
              >
                🔥 {player.streak.currentStreak}
              </motion.span>
            </>
          )}
          <button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
