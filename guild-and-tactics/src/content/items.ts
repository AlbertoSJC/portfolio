import type { ConsumableItemDefinition } from '../sim/items/ConsumableItemDefinition';

/** Store stock for Wanderer's Rest (M2: consumables only; equipment is M3). */
export const ITEMS: Record<string, ConsumableItemDefinition> = {
  potion: {
    identifier: 'potion',
    displayName: 'Potion',
    description: 'A stoppered draught of red tonic. Restores 30 hit points.',
    priceInGold: 30,
    effect: { kind: 'restoreHitPoints', amount: 30 },
  },
  ether: {
    identifier: 'ether',
    displayName: 'Ether',
    description:
      'Distilled prayer-water, faintly humming. Restores 12 mana points — the only way mana comes back mid-battle.',
    priceInGold: 55,
    effect: { kind: 'restoreManaPoints', amount: 12 },
  },
  strong_potion: {
    identifier: 'strong_potion',
    displayName: 'Strong Potion',
    description: 'The apothecary’s honest work. Restores 60 hit points.',
    priceInGold: 70,
    effect: { kind: 'restoreHitPoints', amount: 60 },
  },
};
