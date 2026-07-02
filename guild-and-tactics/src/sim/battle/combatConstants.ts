/**
 * Every combat tuning value lives here, named. No formula in the sim may
 * contain a bare number (PRD §9.1).
 */

/** A unit acts when its accumulated charge reaches this threshold. */
export const TURN_READY_CHARGE_THRESHOLD = 100;

/** Chance to hit before facing and evasion adjustments. */
export const BASE_HIT_CHANCE = 0.85;
export const SIDE_ATTACK_HIT_CHANCE_BONUS = 0.08;
export const BACK_ATTACK_HIT_CHANCE_BONUS = 0.16;

export const BASE_CRITICAL_HIT_CHANCE = 0.05;
export const BACK_ATTACK_CRITICAL_HIT_CHANCE_BONUS = 0.1;
export const CRITICAL_HIT_DAMAGE_MULTIPLIER = 1.5;

/** Fraction of the defensive stat subtracted from incoming damage. */
export const PHYSICAL_DEFENSE_MITIGATION_FACTOR = 0.5;
export const MAGICAL_RESISTANCE_MITIGATION_FACTOR = 0.5;

/** A connecting hit always deals at least this much damage. */
export const MINIMUM_DAMAGE_DEALT = 1;

/** Healing always restores at least this much. */
export const MINIMUM_HEALING_RESTORED = 1;

/** Hit points at or below which a unit is knocked out. */
export const KNOCKED_OUT_HIT_POINTS = 0;

/** How many upcoming turns the turn-order forecast computes. */
export const TURN_ORDER_FORECAST_LENGTH = 8;

/** Consumables reach the user's own tile or an adjacent one. */
export const ITEM_USE_RANGE = 1;

/** Hit points lost to poison at the start of each poisoned unit's turn. */
export const POISON_DAMAGE_PER_TURN = 8;

/** Penalty subtracted from a blinded attacker's hit chance. */
export const BLIND_HIT_CHANCE_PENALTY = 0.35;

/** Hit points restored by regen at the start of each affected unit's turn. */
export const REGEN_HEALING_PER_TURN = 8;

/** Speed multipliers while hasted or slowed (they stack against each other). */
export const HASTE_SPEED_MULTIPLIER = 1.5;
export const SLOW_SPEED_MULTIPLIER = 0.5;

/** Fraction of damage still taken through protect (physical) and shell (magical). */
export const PROTECT_PHYSICAL_DAMAGE_TAKEN_MULTIPLIER = 0.7;
export const SHELL_MAGICAL_DAMAGE_TAKEN_MULTIPLIER = 0.7;
