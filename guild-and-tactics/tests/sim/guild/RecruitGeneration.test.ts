import { describe, expect, it } from 'vitest';
import { SeededRandomNumberGenerator } from '../../../src/sim/SeededRandomNumberGenerator';
import {
  RECRUITS_ON_OFFER_COUNT,
  averageRosterLevel,
  generateRecruitOffers,
  hireCostForLevel,
} from '../../../src/sim/guild/RecruitGeneration';
import { RACES } from '../../../src/content/races';
import { RECRUIT_NAMES_BY_RACE } from '../../../src/content/recruitNames';

describe('generateRecruitOffers', () => {
  it('only ever offers classes the recruit race allows', () => {
    // Many rolls so Feryan recruits (no magic) are certain to appear.
    for (let rollIndex = 0; rollIndex < 30; rollIndex += 1) {
      const offers = generateRecruitOffers(
        new SeededRandomNumberGenerator(rollIndex),
        RACES,
        RECRUIT_NAMES_BY_RACE,
        3,
      );
      expect(offers).toHaveLength(RECRUITS_ON_OFFER_COUNT);
      for (const offer of offers) {
        const race = RACES[offer.member.raceIdentifier];
        expect(race?.allowedBaseClasses).toContain(offer.member.baseClassIdentifier);
        expect(offer.member.level).toBeGreaterThanOrEqual(1);
        expect(offer.hireCostInGold).toBe(hireCostForLevel(offer.member.level));
      }
    }
  });
});

describe('averageRosterLevel', () => {
  it('rounds the average of the given levels', () => {
    expect(averageRosterLevel([2, 2, 3])).toBe(2);
    expect(averageRosterLevel([4, 5])).toBe(5);
  });

  it('falls back to one for an empty roster', () => {
    expect(averageRosterLevel([])).toBe(1);
  });
});
