import type { ConsumableItemDefinition } from '../sim/items/ConsumableItemDefinition';

/** Store stock for Wanderer's Rest (M2: consumables only; equipment is M3). */
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
    description: 'The apothecary’s honest work.',
    priceInGold: 70,
    effect: { kind: 'restoreHitPoints', amount: 60 },
  },
};
