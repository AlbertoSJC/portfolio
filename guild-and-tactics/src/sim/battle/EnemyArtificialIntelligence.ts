import type { GridPosition } from '../grid/GridPosition';
import { directionFromTo, manhattanDistance } from '../grid/GridPosition';
import type { Unit } from '../units/Unit';
import { isKnockedOut } from '../units/Unit';
import type { Battle } from './Battle';
import { determineRelativeAttackArc } from './FacingAndFlanking';
import { calculateDamageBeforeDice, calculateHitChance } from './DamageCalculation';
import { findReachableTiles } from './MovementRange';
import type { DamageSkillEffect } from './SkillDefinition';
import { canUnitAffordSkill } from './SkillExecution';

/** Scoring weights for the utility AI. Named so tuning is honest (PRD §9.1). */
const KNOCKOUT_SCORE_BONUS = 50;
const BACK_ATTACK_SCORE_BONUS = 6;
const SIDE_ATTACK_SCORE_BONUS = 3;

/**
 * What the enemy unit decided to do with its turn. The BattleController
 * executes it through the same Battle commands a player uses.
 */
export interface EnemyTurnPlan {
  moveDestination?: GridPosition;
  skillIdentifier?: string;
  skillTargetTile?: GridPosition;
}

interface ScoredAttackPlan extends EnemyTurnPlan {
  score: number;
}

/**
 * Utility AI: evaluate every (reachable tile × affordable skill × target)
 * combination by expected damage, knockout potential, and flanking, and
 * take the best. With no target in reach, advance toward the nearest foe.
 */
export function planEnemyTurn(battle: Battle, enemyUnit: Unit): EnemyTurnPlan {
  const candidatePositions: GridPosition[] = [
    enemyUnit.position,
    ...findReachableTiles(enemyUnit, battle.map, battle.units),
  ];
  const livingTargets = battle.units.filter(
    (unit) => unit.team !== enemyUnit.team && !isKnockedOut(unit),
  );

  let bestAttackPlan: ScoredAttackPlan | undefined;
  for (const candidatePosition of candidatePositions) {
    for (const skillIdentifier of enemyUnit.skillIdentifiers) {
      const skill = battle.getSkillByIdentifier(skillIdentifier);
      if (skill.targetTeam !== 'enemies' || skill.effect.kind !== 'damage') {
        continue;
      }
      if (!canUnitAffordSkill(enemyUnit, skill)) {
        continue;
      }
      for (const target of livingTargets) {
        const distanceToTarget = manhattanDistance(candidatePosition, target.position);
        if (distanceToTarget > skill.targetingRange) {
          continue;
        }
        const score = scoreAttack(enemyUnit, candidatePosition, target, skill.effect);
        if (bestAttackPlan === undefined || score > bestAttackPlan.score) {
          bestAttackPlan = {
            moveDestination: candidatePosition,
            skillIdentifier,
            skillTargetTile: { ...target.position },
            score,
          };
        }
      }
    }
  }

  if (bestAttackPlan !== undefined) {
    const staysInPlace =
      bestAttackPlan.moveDestination !== undefined &&
      manhattanDistance(bestAttackPlan.moveDestination, enemyUnit.position) === 0;
    return {
      moveDestination: staysInPlace ? undefined : bestAttackPlan.moveDestination,
      skillIdentifier: bestAttackPlan.skillIdentifier,
      skillTargetTile: bestAttackPlan.skillTargetTile,
    };
  }

  return planAdvanceTowardNearestFoe(battle, enemyUnit, candidatePositions);
}

function scoreAttack(
  enemyUnit: Unit,
  attackFromPosition: GridPosition,
  target: Unit,
  damageEffect: DamageSkillEffect,
): number {
  const hypotheticalAttacker: Unit = {
    ...enemyUnit,
    position: attackFromPosition,
    facing: directionFromTo(attackFromPosition, target.position),
  };
  const attackArc = determineRelativeAttackArc(hypotheticalAttacker, target);
  const hitChance = calculateHitChance(target, attackArc);
  const damageEstimate = calculateDamageBeforeDice(
    hypotheticalAttacker,
    target,
    damageEffect,
    attackArc,
  );
  if (damageEstimate <= 0) {
    return 0;
  }
  let score = damageEstimate * hitChance;
  if (damageEstimate >= target.currentHitPoints) {
    score += KNOCKOUT_SCORE_BONUS * hitChance;
  }
  if (attackArc === 'back') {
    score += BACK_ATTACK_SCORE_BONUS;
  } else if (attackArc === 'side') {
    score += SIDE_ATTACK_SCORE_BONUS;
  }
  return score;
}

function planAdvanceTowardNearestFoe(
  battle: Battle,
  enemyUnit: Unit,
  candidatePositions: readonly GridPosition[],
): EnemyTurnPlan {
  const nearestOpponent = battle.findNearestLivingOpponent(enemyUnit);
  if (nearestOpponent === undefined) {
    return {};
  }
  let bestDestination = enemyUnit.position;
  let bestDistance = manhattanDistance(enemyUnit.position, nearestOpponent.position);
  for (const candidatePosition of candidatePositions) {
    const distance = manhattanDistance(candidatePosition, nearestOpponent.position);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestDestination = candidatePosition;
    }
  }
  const staysInPlace = manhattanDistance(bestDestination, enemyUnit.position) === 0;
  return { moveDestination: staysInPlace ? undefined : bestDestination };
}
