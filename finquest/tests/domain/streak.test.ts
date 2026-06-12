import { describe, expect, it } from 'vitest';
import { Player } from '@/domain/Player';

describe('Player streak', () => {
  it('starts a streak on first activity', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.recordActivity(new Date('2026-06-10T10:00:00'));

    expect(player.streak.currentStreak).toBe(1);
    expect(player.streak.longestStreak).toBe(1);
    expect(player.streak.lastActivityDate).toBe('2026-06-10');
  });

  it('only counts one activity per calendar day', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.recordActivity(new Date('2026-06-10T10:00:00'));
    player.recordActivity(new Date('2026-06-10T18:00:00'));

    expect(player.streak.currentStreak).toBe(1);
  });

  it('extends the streak on consecutive days', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.recordActivity(new Date('2026-06-10T10:00:00'));
    player.recordActivity(new Date('2026-06-11T09:00:00'));
    player.recordActivity(new Date('2026-06-12T22:00:00'));

    expect(player.streak.currentStreak).toBe(3);
    expect(player.streak.longestStreak).toBe(3);
  });

  it('restarts the streak after a missed day but keeps the record', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.recordActivity(new Date('2026-06-10T10:00:00'));
    player.recordActivity(new Date('2026-06-11T10:00:00'));
    player.recordActivity(new Date('2026-06-14T10:00:00'));

    expect(player.streak.currentStreak).toBe(1);
    expect(player.streak.longestStreak).toBe(2);
  });

  it('syncStreak zeroes the current streak when stale', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.recordActivity(new Date('2026-06-10T10:00:00'));
    player.syncStreak(new Date('2026-06-13T10:00:00'));

    expect(player.streak.currentStreak).toBe(0);
    expect(player.streak.longestStreak).toBe(1);
  });

  it('syncStreak keeps the streak when last activity was yesterday', () => {
    const player = new Player({ id: 'p1', username: 'Tester' });
    player.recordActivity(new Date('2026-06-10T10:00:00'));
    player.syncStreak(new Date('2026-06-11T10:00:00'));

    expect(player.streak.currentStreak).toBe(1);
  });
});
