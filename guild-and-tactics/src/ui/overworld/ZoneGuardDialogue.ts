import { REPUTATION_TIER_LABELS, type ReputationTier } from '@/sim/guild/ReputationTier';
import { requiredReputationTierForZone } from '@/sim/guild/ZoneAccess';
import type { ZoneDefinition } from '@/sim/guild/ZoneDefinition';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import { createSoundedButton } from '../village/views/SoundedButton';

/**
 * The diegetic zone gate (PRD §6): a roadwatch guard turns the party back
 * from a zone above the guild's reputation tier, instead of the zone being
 * hidden or its node silently disabled.
 */
export function buildZoneGuardDialogue(
  zone: ZoneDefinition,
  currentTier: ReputationTier,
  sounds: UserInterfaceSounds,
  onTurnBack: () => void,
): HTMLElement {
  const requiredTier = requiredReputationTierForZone(zone);
  const dialogue = document.createElement('div');
  dialogue.className = 'guard-dialogue';

  const speaker = document.createElement('h2');
  speaker.className = 'guard-dialogue-speaker';
  speaker.textContent = 'A roadwatch guard bars the way';
  dialogue.appendChild(speaker);

  const speech = document.createElement('p');
  speech.className = 'guard-dialogue-speech';
  speech.textContent =
    `“Hold there. The road to ${zone.displayName} is no place for a ` +
    `${REPUTATION_TIER_LABELS[currentTier].toLowerCase()}-rank guild — too dangerous by half. ` +
    'Make your name on safer roads, and come back when word of your deeds travels ahead of you.”';
  dialogue.appendChild(speech);

  const requirement = document.createElement('p');
  requirement.className = 'guard-dialogue-requirement';
  requirement.textContent =
    `${zone.displayName} opens to ${REPUTATION_TIER_LABELS[requiredTier]}-rank guilds. ` +
    'Complete quests to raise the guild’s reputation.';
  dialogue.appendChild(requirement);

  dialogue.appendChild(
    createSoundedButton(sounds, {
      label: 'Turn back',
      className: 'primary-action-button',
      playsCancelSound: true,
      onClick: onTurnBack,
    }),
  );

  return dialogue;
}
