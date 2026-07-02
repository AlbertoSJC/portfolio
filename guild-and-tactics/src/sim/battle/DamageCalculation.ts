import type { DamageSkillEffect } from './SkillDefinition';
import type { Unit } from '../units/Unit';
import { effectiveStatistic, elementalAffinityFor, hasStatusEffect, STATISTIC } from '../units/Unit';
import type { RelativeAttackArc } from './FacingAndFlanking';
import {
  BACK_ATTACK_CRITICAL_HIT_CHANCE_BONUS,
  BACK_ATTACK_HIT_CHANCE_BONUS,
  BASE_CRITICAL_HIT_CHANCE,
  BASE_HIT_CHANCE,
  BLIND_HIT_CHANCE_PENALTY,
  MAGICAL_RESISTANCE_MITIGATION_FACTOR,
  MINIMUM_DAMAGE_DEALT,
  PHYSICAL_DEFENSE_MITIGATION_FACTOR,
  PROTECT_PHYSICAL_DAMAGE_TAKEN_MULTIPLIER,
  SHELL_MAGICAL_DAMAGE_TAKEN_MULTIPLIER,
  SIDE_ATTACK_HIT_CHANCE_BONUS,
} from './combatConstants';

export function calculateHitChance(
  attacker: Unit,
  defender: Unit,
  attackArc: RelativeAttackArc,
): number {
  let hitChance = BASE_HIT_CHANCE - defender.baseStatistics.evasion;
  if (attackArc === 'side') {
    hitChance += SIDE_ATTACK_HIT_CHANCE_BONUS;
  }
  if (attackArc === 'back') {
    hitChance += BACK_ATTACK_HIT_CHANCE_BONUS;
  }
  if (hasStatusEffect(attacker, 'blind')) {
    hitChance -= BLIND_HIT_CHANCE_PENALTY;
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
      ? effectiveStatistic(attacker, STATISTIC.Attack)
      : effectiveStatistic(attacker, STATISTIC.MagicPower);
  const defensiveStatistic =
    damageEffect.damageSource === 'physical'
      ? effectiveStatistic(defender, STATISTIC.Defense) * PHYSICAL_DEFENSE_MITIGATION_FACTOR
      : effectiveStatistic(defender, STATISTIC.MagicResistance) * MAGICAL_RESISTANCE_MITIGATION_FACTOR;

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

  const guardMultiplier =
    damageEffect.damageSource === 'physical'
      ? hasStatusEffect(defender, 'protect')
        ? PROTECT_PHYSICAL_DAMAGE_TAKEN_MULTIPLIER
        : 1
      : hasStatusEffect(defender, 'shell')
        ? SHELL_MAGICAL_DAMAGE_TAKEN_MULTIPLIER
        : 1;
  const guardedDamage = Math.round(affinityAdjustedDamage * guardMultiplier);
  return Math.max(MINIMUM_DAMAGE_DEALT, guardedDamage);
}
