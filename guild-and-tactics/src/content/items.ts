import type { ConsumableItemDefinition } from '../sim/items/ConsumableItemDefinition';

export const ITEMS: Record<string, ConsumableItemDefinition> = {
  potion: {
    identifier: 'potion',
    displayName: 'Potion',
    description: 'A stoppered draught of red tonic.',
    priceInGold: 30,
    effect: { kind: 'restoreHitPoints', amount: 30 },
  },
  ether: {
    identifier: 'ether',
    displayName: 'Ether',
    description: 'Distilled prayer-water, faintly humming — the only way mana comes back mid-battle.',
    priceInGold: 55,
    effect: { kind: 'restoreManaPoints', amount: 12 },
  },
  strong_potion: {
    identifier: 'strong_potion',
    displayName: 'Strong Potion',
    description: "The apothecary's honest work.",
    priceInGold: 70,
    effect: { kind: 'restoreHitPoints', amount: 60 },
    minimumReputationTier: 'silver',
  },
  apothecarys_finest: {
    identifier: 'apothecarys_finest',
    displayName: 'Apothecary’s Finest',
    description: 'The bottle from the locked cabinet, sold only to guilds with a name.',
    priceInGold: 150,
    effect: { kind: 'restoreHitPoints', amount: 120 },
    minimumReputationTier: 'gold',
  },
  superior_ether: {
    identifier: 'superior_ether',
    displayName: 'Superior Ether',
    description: 'Prayer-water distilled twice over. The hum is a chord now.',
    priceInGold: 120,
    effect: { kind: 'restoreManaPoints', amount: 25 },
    minimumReputationTier: 'gold',
  },
};
