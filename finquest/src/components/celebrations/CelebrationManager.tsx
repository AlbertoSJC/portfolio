'use client';

import { AnimatePresence } from 'motion/react';
import { useCelebration } from '@/hooks/useCelebration';
import { QuestCompleteModal } from '@/components/celebrations/QuestCompleteModal';
import { LevelUpOverlay } from '@/components/celebrations/LevelUpOverlay';

export function CelebrationManager() {
  const { current, dismiss } = useCelebration();

  return (
    <AnimatePresence>
      {current?.kind === 'quest-complete' && (
        <QuestCompleteModal
          key={current.id}
          celebrationId={current.id}
          questTitle={current.questTitle}
          xpGained={current.xpGained}
          coinsGained={current.coinsGained}
          achievementTitles={current.achievementTitles}
          onDismiss={dismiss}
        />
      )}
      {current?.kind === 'level-up' && (
        <LevelUpOverlay
          key={current.id}
          celebrationId={current.id}
          newLevel={current.newLevel}
          onDismiss={dismiss}
        />
      )}
    </AnimatePresence>
  );
}
