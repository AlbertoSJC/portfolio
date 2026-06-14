import type { SeededRandomNumberGenerator } from '../SeededRandomNumberGenerator';
import type { ClassIdentifier, RaceIdentifier } from '../units/Unit';
import type { RaceDefinition } from '../units/UnitDefinitions';
import type { RecruitOffer } from './GuildState';

/** How many candidates the recruitment hall shows at a time. */
export const RECRUITS_ON_OFFER_COUNT = 3;

const HIRE_COST_BASE_GOLD = 120;
const HIRE_COST_PER_LEVEL_GOLD = 60;

let nextRecruitNumber = 1;

export function hireCostForLevel(level: number): number {
  return HIRE_COST_BASE_GOLD + HIRE_COST_PER_LEVEL_GOLD * (level - 1);
}

/**
 * Rolls a fresh set of recruitment-hall candidates: random race, a base
 * class that race allows, a lore name, and a level near the guild's own.
 */
export function generateRecruitOffers(
  randomNumberGenerator: SeededRandomNumberGenerator,
  raceTable: Record<string, RaceDefinition>,
  namePoolByRace: Record<RaceIdentifier, readonly string[]>,
  guildAverageLevel: number,
): RecruitOffer[] {
  const raceIdentifiers = Object.keys(raceTable) as RaceIdentifier[];
  const offers: RecruitOffer[] = [];
  for (let offerIndex = 0; offerIndex < RECRUITS_ON_OFFER_COUNT; offerIndex += 1) {
    const raceIdentifier =
      raceIdentifiers[randomNumberGenerator.nextIntegerBetween(0, raceIdentifiers.length - 1)];
    if (raceIdentifier === undefined) {
      continue;
    }
    const race = raceTable[raceIdentifier];
    if (race === undefined) {
      continue;
    }
    const allowedClasses = race.allowedBaseClasses;
    const classIdentifier: ClassIdentifier | undefined =
      allowedClasses[randomNumberGenerator.nextIntegerBetween(0, allowedClasses.length - 1)];
    const namePool = namePoolByRace[raceIdentifier];
    const displayName =
      namePool[randomNumberGenerator.nextIntegerBetween(0, namePool.length - 1)] ?? 'Wanderer';
    const level = Math.max(1, guildAverageLevel + randomNumberGenerator.nextIntegerBetween(-1, 1));
    if (classIdentifier === undefined) {
      continue;
    }
    offers.push({
      member: {
        identifier: `recruit_${nextRecruitNumber++}`,
        displayName,
        raceIdentifier,
        classIdentifier,
        classLevelsReached: {},
        level,
        experiencePoints: 0,
        equippedItemIdentifiers: {},
      },
      hireCostInGold: hireCostForLevel(level),
    });
  }
  return offers;
}

export function averageRosterLevel(memberLevels: readonly number[]): number {
  if (memberLevels.length === 0) {
    return 1;
  }
  const levelSum = memberLevels.reduce((sum, level) => sum + level, 0);
  return Math.round(levelSum / memberLevels.length);
}
