import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { GridPosition } from '../grid/GridPosition';
import { manhattanDistance } from '../grid/GridPosition';
import type { Unit } from '../units/Unit';
import { effectiveStatistic, hasStatusEffect, isKnockedOut, STATISTIC } from '../units/Unit';
import type { BattleEvent } from './BattleEvents';
import { determineRelativeAttackArc } from './FacingAndFlanking';
import type { DamageSkillEffect, SkillDefinition } from './SkillDefinition';
import {
  calculateCriticalHitChance,
  calculateDamageBeforeDice,
  calculateHitChance,
} from './DamageCalculation';
import {
  CRITICAL_HIT_DAMAGE_MULTIPLIER,
  MINIMUM_HEALING_RESTORED,
} from './combatConstants';

export function isTargetTileWithinSkillRange(
  user: Unit,
  skill: SkillDefinition,
  targetTile: GridPosition,
): boolean {
  return manhattanDistance(user.position, targetTile) <= skill.targetingRange;
}

export function canUnitAffordSkill(user: Unit, skill: SkillDefinition): boolean {
  return user.currentManaPoints >= skill.manaPointCost;
}

/** Silence blocks any skill that costs mana; a silenced unit can still attack for free. */
export function isUnitSilencedForSkill(user: Unit, skill: SkillDefinition): boolean {
  return hasStatusEffect(user, 'silence') && skill.manaPointCost > 0;
}

function isUnitAValidTargetForSkill(user: Unit, skill: SkillDefinition, candidate: Unit): boolean {
  if (isKnockedOut(candidate)) {
    return false;
  }
  switch (skill.targetTeam) {
    case 'enemies':
      return candidate.team !== user.team;
    case 'allies':
      return candidate.team === user.team;
    case 'self':
      return candidate.identifier === user.identifier;
  }
}

/** All living units standing inside the skill's area around the target tile. */
export function findUnitsAffectedBySkill(
  user: Unit,
  skill: SkillDefinition,
  targetTile: GridPosition,
  allUnits: readonly Unit[],
): Unit[] {
  return allUnits.filter(
    (candidate) =>
      isUnitAValidTargetForSkill(user, skill, candidate) &&
      manhattanDistance(candidate.position, targetTile) <= skill.areaOfEffectRadius,
  );
}

/**
 * Executes a skill the Battle has already validated (range, cost, turn).
 * Spends mana, rolls dice, applies consequences, and reports events.
 */
export function executeSkill(
  user: Unit,
  skill: SkillDefinition,
  targetTile: GridPosition,
  allUnits: readonly Unit[],
  randomNumberGenerator: SeededRandomNumberGenerator,
): BattleEvent[] {
  const events: BattleEvent[] = [];
  user.currentManaPoints -= skill.manaPointCost;
  events.push({
    kind: 'skillUsed',
    unitIdentifier: user.identifier,
    skillIdentifier: skill.identifier,
    targetTile,
  });

  const affectedUnits = findUnitsAffectedBySkill(user, skill, targetTile, allUnits);
  for (const affectedUnit of affectedUnits) {
    applySkillEffectToUnit(user, skill, affectedUnit, randomNumberGenerator, events);
  }
  return events;
}

/**
 * Rolls hit/crit and applies a damage effect against one specific target.
 * Shared by the normal (team-filtered) skill path and
 * `resolveForcedDamageAttack` (which picks its own target, bypassing the
 * skill's team filter — e.g. confuse striking an ally).
 */
function resolveDamageEffectAgainstTarget(
  user: Unit,
  target: Unit,
  damageEffect: DamageSkillEffect,
  randomNumberGenerator: SeededRandomNumberGenerator,
  events: BattleEvent[],
): void {
  const attackArc = determineRelativeAttackArc(user, target);
  const hitChance = calculateHitChance(user, target, attackArc);
  if (!randomNumberGenerator.rollChance(hitChance)) {
    events.push({
      kind: 'attackMissed',
      attackerIdentifier: user.identifier,
      defenderIdentifier: target.identifier,
    });
    return;
  }
  const wasCriticalHit = randomNumberGenerator.rollChance(calculateCriticalHitChance(attackArc));
  let damageDealt = calculateDamageBeforeDice(user, target, damageEffect, attackArc);
  if (damageDealt < 0) {
    // Elemental absorption (e.g. Dark striking the Undead) heals instead.
    const healingFromAbsorption = Math.abs(damageDealt);
    target.currentHitPoints = Math.min(
      target.baseStatistics.hitPointsMaximum,
      target.currentHitPoints + healingFromAbsorption,
    );
    events.push({
      kind: 'healingReceived',
      healerIdentifier: user.identifier,
      targetIdentifier: target.identifier,
      amount: healingFromAbsorption,
    });
    return;
  }
  if (wasCriticalHit) {
    damageDealt = Math.round(damageDealt * CRITICAL_HIT_DAMAGE_MULTIPLIER);
  }
  target.currentHitPoints = Math.max(0, target.currentHitPoints - damageDealt);
  events.push({
    kind: 'damageDealt',
    attackerIdentifier: user.identifier,
    defenderIdentifier: target.identifier,
    amount: damageDealt,
    wasCriticalHit,
  });
  if (isKnockedOut(target)) {
    events.push({ kind: 'unitKnockedOut', unitIdentifier: target.identifier });
  }
}

/**
 * Forces a damage skill against a specific target the caller already chose,
 * ignoring the skill's normal team-targeting rule. Used by confuse, which
 * must be able to strike an ally.
 */
export function resolveForcedDamageAttack(
  user: Unit,
  target: Unit,
  skill: SkillDefinition,
  randomNumberGenerator: SeededRandomNumberGenerator,
): BattleEvent[] {
  const events: BattleEvent[] = [
    {
      kind: 'skillUsed',
      unitIdentifier: user.identifier,
      skillIdentifier: skill.identifier,
      targetTile: target.position,
    },
  ];
  if (skill.effect.kind === 'damage') {
    resolveDamageEffectAgainstTarget(user, target, skill.effect, randomNumberGenerator, events);
  }
  return events;
}

function applySkillEffectToUnit(
  user: Unit,
  skill: SkillDefinition,
  target: Unit,
  randomNumberGenerator: SeededRandomNumberGenerator,
  events: BattleEvent[],
): void {
  const effect = skill.effect;
  switch (effect.kind) {
    case 'damage': {
      resolveDamageEffectAgainstTarget(user, target, effect, randomNumberGenerator, events);
      return;
    }
    case 'heal': {
      const healingRestored = Math.max(
        MINIMUM_HEALING_RESTORED,
        Math.round(effectiveStatistic(user, STATISTIC.MagicPower) * effect.powerMultiplier),
      );
      target.currentHitPoints = Math.min(
        target.baseStatistics.hitPointsMaximum,
        target.currentHitPoints + healingRestored,
      );
      events.push({
        kind: 'healingReceived',
        healerIdentifier: user.identifier,
        targetIdentifier: target.identifier,
        amount: healingRestored,
      });
      return;
    }
    case 'statModifier': {
      target.activeStatModifiers.push({
        statistic: effect.statistic,
        amount: effect.amount,
        remainingTurns: effect.durationTurns,
        sourceSkillName: skill.displayName,
      });
      events.push({
        kind: 'statModifierApplied',
        targetIdentifier: target.identifier,
        statistic: effect.statistic,
        amount: effect.amount,
        durationTurns: effect.durationTurns,
      });
      return;
    }
    case 'statusEffect': {
      target.activeStatusEffects.push({
        kind: effect.statusEffect,
        remainingTurns: effect.durationTurns,
        sourceSkillName: skill.displayName,
      });
      events.push({
        kind: 'statusEffectApplied',
        targetIdentifier: target.identifier,
        statusEffect: effect.statusEffect,
        durationTurns: effect.durationTurns,
      });
      return;
    }
  }
}
