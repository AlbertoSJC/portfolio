import type { EquipmentDefinition } from '../sim/items/EquipmentDefinition';

/**
 * Store equipment for Wanderer's Rest. Weapons are class-bound; armor and
 * accessories are open to everyone. Some pieces are gated behind a
 * `minimumReputationTier` (see `src/sim/guild/ReputationTier.ts`); rarities
 * beyond tier-gating remain M4 content work.
 */
export const EQUIPMENT: Record<string, EquipmentDefinition> = {
  // ── Weapons ────────────────────────────────────────────────────────────
  iron_sword: {
    identifier: 'iron_sword',
    displayName: 'Iron Sword',
    description: 'Honest smith-work from the Rest. The guild standard.',
    slot: 'weapon',
    priceInGold: 90,
    statisticBonuses: { attack: 3 },
    allowedClasses: ['warrior'],
  },
  steel_greatblade: {
    identifier: 'steel_greatblade',
    displayName: 'Steel Greatblade',
    description: 'Two hands, one argument. Werelizards swear by it.',
    slot: 'weapon',
    priceInGold: 210,
    statisticBonuses: { attack: 6, speed: -1 },
    allowedClasses: ['warrior'],
    minimumReputationTier: 'silver',
  },
  hunting_dagger: {
    identifier: 'hunting_dagger',
    displayName: 'Hunting Dagger',
    description: 'Light, quick, and quiet — a thief’s closest friend.',
    slot: 'weapon',
    priceInGold: 80,
    statisticBonuses: { attack: 2, speed: 1 },
    allowedClasses: ['thief'],
  },
  oak_focus_staff: {
    identifier: 'oak_focus_staff',
    displayName: 'Oak Focus Staff',
    description: 'Cut from a tree that never walked. Steadies the casting hand.',
    slot: 'weapon',
    priceInGold: 95,
    statisticBonuses: { magicPower: 3 },
    allowedClasses: ['mage'],
  },
  blessed_rod: {
    identifier: 'blessed_rod',
    displayName: 'Blessed Rod',
    description: 'Anointed at the shrines. Hums faintly near the wounded.',
    slot: 'weapon',
    priceInGold: 95,
    statisticBonuses: { magicPower: 2, magicResistance: 2 },
    allowedClasses: ['priest'],
  },
  // ── Armor ──────────────────────────────────────────────────────────────
  leather_vest: {
    identifier: 'leather_vest',
    displayName: 'Leather Vest',
    description: 'Boiled leather over padding. Better than regret.',
    slot: 'armor',
    priceInGold: 70,
    statisticBonuses: { defense: 2 },
  },
  iron_mail: {
    identifier: 'iron_mail',
    displayName: 'Iron Mail',
    description: 'Heavy rings, heavier confidence.',
    slot: 'armor',
    priceInGold: 160,
    statisticBonuses: { defense: 4, speed: -1 },
    minimumReputationTier: 'silver',
  },
  travelers_garb: {
    identifier: 'travelers_garb',
    displayName: 'Traveler’s Garb',
    description: 'Weathered, loose, and easy to vanish in.',
    slot: 'armor',
    priceInGold: 85,
    statisticBonuses: { defense: 1, evasion: 0.04 },
  },
  // ── Accessories ────────────────────────────────────────────────────────
  swift_charm: {
    identifier: 'swift_charm',
    displayName: 'Swift Charm',
    description: 'A werecat token: a knot of wind tied in copper wire.',
    slot: 'accessory',
    priceInGold: 120,
    statisticBonuses: { speed: 2 },
  },
  stout_ring: {
    identifier: 'stout_ring',
    displayName: 'Stout Ring',
    description: 'Taurk-blessed iron. Wearers eat well and fall seldom.',
    slot: 'accessory',
    priceInGold: 110,
    statisticBonuses: { hitPointsMaximum: 8 },
  },
  focus_band: {
    identifier: 'focus_band',
    displayName: 'Focus Band',
    description: 'A cord of prayer-knots that keeps the well of mana deep.',
    slot: 'accessory',
    priceInGold: 110,
    statisticBonuses: { manaPointsMaximum: 6 },
  },
};
