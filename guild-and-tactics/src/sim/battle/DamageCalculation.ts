import type { DamageSkillEffect } from './SkillDefinition';
import type { Unit } from '../units/Unit';
import { effectiveStatistic, elementalAffinityFor } from '../units/Unit';
import type { RelativeAttackArc } from './FacingAndFlanking';
import {
  BACK_ATTACK_CRITICAL_HIT_CHANCE_BONUS,
  BACK_ATTACK_HIT_CHANCE_BONUS,
  BASE_CRITICAL_HIT_CHANCE,
  BASE_HIT_CHANCE,
  MAGICAL_RESISTANCE_MITIGATION_FACTOR,
  MINIMUM_DAMAGE_DEALT,
  PHYSICAL_DEFENSE_MITIGATION_FACTOR,
  SIDE_ATTACK_HIT_CHANCE_BONUS,
} from './combatConstants';

export function calculateHitChance(defender: Unit, attackArc: RelativeAttackArc): number {
  let hitChance = BASE_HIT_CHANCE - defender.baseStatistics.evasion;
  if (attackArc === 'side') {
    hitChance += SIDE_ATTACK_HIT_CHANCE_BONUS;
  }
  if (attackArc === 'back') {
    hitChance += BACK_ATTACK_HIT_CHANCE_BONUS;
  }
  return Math.min(1, Math.max(0, hitChance));
}

export function calculateCriticalHitChance(attackArc: RelativeAttackArc): number {
  let criticalChance = BASE_CRITICAL_HIT_CHANCE;
  if (attackArc === 'back') {
    criticalChance += BACK_ATTACK_CRITICAL_HIT_CHANCE_BONUS;
  }
  return criticalChance;
}

/**
 * Damage before the hit/critical dice: offensive statistic scaled by the
 * skill, minus the mitigating fraction of the defensive statistic, scaled
 * by the defender's elemental affinity.
 *
 * A negative result means the defender absorbs the element (e.g. Dark
 * healing the Undead) — callers treat it as healing.
 */
export function calculateDamageBeforeDice(
  attacker: Unit,
  defender: Unit,
  damageEffect: DamageSkillEffect,
  attackArc: RelativeAttackArc,
): number {
  const offensiveStatistic =
    damageEffect.damageSource === 'physical'
      ? effectiveStatistic(attacker, 'attack')
      : effectiveStatistic(attacker, 'magicPower');
  const defensiveStatistic =
    damageEffect.damageSource === 'physical'
      ? effectiveStatistic(defender, 'defense') * PHYSICAL_DEFENSE_MITIGATION_FACTOR
      : effectiveStatistic(defender, 'magicResistance') * MAGICAL_RESISTANCE_MITIGATION_FACTOR;

  const flankingBonus =
    attackArc !== 'front' && damageEffect.flankingPowerBonus !== undefined
      ? damageEffect.flankingPowerBonus
      : 0;
  const totalPowerMultiplier = damageEffect.powerMultiplier + flankingBonus;

  const rawDamage = offensiveStatistic * totalPowerMultiplier - defensiveStatistic;
  const elementalAffinity = elementalAffinityFor(defender, damageEffect.element);
  const affinityAdjustedDamage = Math.round(rawDamage * elementalAffinity);

  if (elementalAffinity < 0) {
    // Absorption: return the negative (healing) amount as-is.
    return affinityAdjustedDamage;
  }
  return Math.max(MINIMUM_DAMAGE_DEALT, affinityAdjustedDamage);
}
