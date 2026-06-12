import type { SkillDefinition } from '../sim/battle/SkillDefinition';

/**
 * The shared skill pool (PRD §7): skills are defined once and referenced by
 * any class or monster that knows them.
 */
export const SKILLS: Record<string, SkillDefinition> = {
  basic_attack: {
    identifier: 'basic_attack',
    displayName: 'Attack',
    description: 'A standard strike with the equipped weapon.',
    manaPointCost: 0,
    targetingRange: 1,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 1.0 },
  },

  // ── Warrior ────────────────────────────────────────────────────────────
  power_strike: {
    identifier: 'power_strike',
    displayName: 'Power Strike',
    description: 'A heavy two-handed blow dealing half again normal damage.',
    manaPointCost: 4,
    targetingRange: 1,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 1.5 },
  },
  war_cry: {
    identifier: 'war_cry',
    displayName: 'War Cry',
    description: 'A rallying roar that raises the user’s attack for three turns.',
    manaPointCost: 3,
    targetingRange: 0,
    areaOfEffectRadius: 0,
    targetTeam: 'self',
    effect: { kind: 'statModifier', statistic: 'attack', amount: 4, durationTurns: 3 },
  },

  // ── Thief ──────────────────────────────────────────────────────────────
  flanking_strike: {
    identifier: 'flanking_strike',
    displayName: 'Flanking Strike',
    description: 'A precise cut that punishes exposed sides and backs.',
    manaPointCost: 3,
    targetingRange: 1,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: {
      kind: 'damage',
      damageSource: 'physical',
      powerMultiplier: 1.1,
      flankingPowerBonus: 0.6,
    },
  },
  thrown_dagger: {
    identifier: 'thrown_dagger',
    displayName: 'Thrown Dagger',
    description: 'A dagger hurled at a target up to three tiles away.',
    manaPointCost: 2,
    targetingRange: 3,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 0.8 },
  },

  // ── Mage ───────────────────────────────────────────────────────────────
  fire_bolt: {
    identifier: 'fire_bolt',
    displayName: 'Fire Bolt',
    description: 'A searing bolt of Kosh’s element hurled at one target.',
    manaPointCost: 5,
    targetingRange: 4,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'magical', powerMultiplier: 1.4, element: 'fire' },
  },
  flame_burst: {
    identifier: 'flame_burst',
    displayName: 'Flame Burst',
    description: 'An eruption of fire that scorches the target tile and its surroundings.',
    manaPointCost: 8,
    targetingRange: 3,
    areaOfEffectRadius: 1,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'magical', powerMultiplier: 1.0, element: 'fire' },
  },

  // ── Priest ─────────────────────────────────────────────────────────────
  first_aid: {
    identifier: 'first_aid',
    displayName: 'First Aid',
    description: 'A prayer of mending that restores an ally’s hit points.',
    manaPointCost: 4,
    targetingRange: 3,
    areaOfEffectRadius: 0,
    targetTeam: 'allies',
    effect: { kind: 'heal', powerMultiplier: 1.5 },
  },
  sacred_bolt: {
    identifier: 'sacred_bolt',
    displayName: 'Sacred Bolt',
    description: 'A lance of Hort’s light. Devastating against the unliving.',
    manaPointCost: 5,
    targetingRange: 3,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'magical', powerMultiplier: 1.2, element: 'sacred' },
  },

  // ── Creatures of the Darkness ──────────────────────────────────────────
  savage_bite: {
    identifier: 'savage_bite',
    displayName: 'Savage Bite',
    description: 'Twisted fangs tear at the target.',
    manaPointCost: 2,
    targetingRange: 1,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 1.25 },
  },
  rock_slam: {
    identifier: 'rock_slam',
    displayName: 'Rock Slam',
    description: 'A living boulder brings its whole mass down on the target.',
    manaPointCost: 3,
    targetingRange: 1,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 1.5 },
  },
  root_lash: {
    identifier: 'root_lash',
    displayName: 'Root Lash',
    description: 'A gnarled root whips out at a target two tiles away.',
    manaPointCost: 2,
    targetingRange: 2,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 1.1, element: 'earth' },
  },
  goring_charge: {
    identifier: 'goring_charge',
    displayName: 'Goring Charge',
    description: 'Twisted tusks slam home with the boar’s full weight behind them.',
    manaPointCost: 3,
    targetingRange: 1,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'physical', powerMultiplier: 1.4 },
  },
  dark_bolt: {
    identifier: 'dark_bolt',
    displayName: 'Dark Bolt',
    description: 'A mote of the unnamed god’s element, flung cold and silent.',
    manaPointCost: 4,
    targetingRange: 3,
    areaOfEffectRadius: 0,
    targetTeam: 'enemies',
    effect: { kind: 'damage', damageSource: 'magical', powerMultiplier: 1.2, element: 'dark' },
  },
};
