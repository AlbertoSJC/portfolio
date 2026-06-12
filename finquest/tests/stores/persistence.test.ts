import { describe, expect, it } from 'vitest';
import { Player } from '@/domain/Player';
import { Quest } from '@/domain/Quest';
import { reconstructPlayer } from '@/stores/player';
import { getDefaultAchievements } from '@/utils/fixtures';
import { FinancialCategory, QuestStatus } from '@/enums/finquestEnums';

function buildPlayer(): Player {
  const player = new Player({ id: 'p1', username: 'Saver' });
  player.addExperience(1500);
  player.coins = 320;

  const quest = new Quest({
    id: 'q1',
    title: 'Emergency Fund',
    description: 'Save up',
    category: FinancialCategory.Savings,
    targetAmount: 1000,
    dueDate: new Date(Date.now() + 86400000),
  });
  quest.updateProgress(400);
  player.addQuest(quest);

  player.unlockAchievement(getDefaultAchievements()[0]);
  return player;
}

describe('player persistence round-trip', () => {
  it('restores class instances with methods after serialize/deserialize', () => {
    const original = buildPlayer();
    const raw = JSON.parse(JSON.stringify(original)) as Record<string, unknown>;

    const restored = reconstructPlayer(raw);

    expect(restored).toBeInstanceOf(Player);
    expect(restored.quests[0]).toBeInstanceOf(Quest);
    expect(restored.level).toBe(original.level);
    expect(restored.coins).toBe(original.coins);
    expect(restored.quests[0].getProgressPercentage()).toBe(40);
    expect(restored.quests[0].dueDate).toBeInstanceOf(Date);
    expect(restored.achievements[0].isUnlocked()).toBe(true);
    expect(restored.achievements[0].requirements.metric).toBeDefined();
  });

  it('marks active quests past their due date as overdue-failable', () => {
    const player = new Player({ id: 'p1', username: 'Late' });
    const overdue = new Quest({
      id: 'q-late',
      title: 'Old goal',
      description: 'missed it',
      category: FinancialCategory.Budgeting,
      targetAmount: 100,
      dueDate: new Date(Date.now() - 86400000),
    });
    player.addQuest(overdue);

    expect(overdue.isOverdue()).toBe(true);
    overdue.failQuest();
    expect(overdue.status).toBe(QuestStatus.Failed);
  });
});
