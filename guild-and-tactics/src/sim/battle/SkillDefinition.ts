import type { Element, ModifiableStatistic } from '../units/Unit';

export type SkillTargetTeam = 'enemies' | 'allies' | 'self';

export interface DamageSkillEffect {
  kind: 'damage';
  damageSource: 'physical' | 'magical';
  powerMultiplier: number;
  element?: Element;
  /** Extra power multiplier added when striking from the side or back (Thief flavor). */
  flankingPowerBonus?: number;
}

export interface HealSkillEffect {
  kind: 'heal';
  /** Healing restored = caster magic power × this multiplier. */
  powerMultiplier: number;
}

export interface StatModifierSkillEffect {
  kind: 'statModifier';
  statistic: ModifiableStatistic;
  amount: number;
  durationTurns: number;
}

export type SkillEffect = DamageSkillEffect | HealSkillEffect | StatModifierSkillEffect;

export interface SkillDefinition {
  identifier: string;
  displayName: string;
  description: string;
  manaPointCost: number;
  /** Manhattan distance from the user to the target tile; 1 = melee. */
  targetingRange: number;
  /** Manhattan radius around the target tile also affected; 0 = single target. */
  areaOfEffectRadius: number;
  targetTeam: SkillTargetTeam;
  effect: SkillEffect;
}
