import { describe, expect, it } from 'vitest';
import { SeededRandomNumberGenerator } from '@/sim/SeededRandomNumberGenerator';
import {
  RECRUITS_ON_OFFER_BY_TIER,
  averageRosterLevel,
  generateRecruitOffers,
  hireCostForLevel,
} from '@/sim/guild/RecruitGeneration';
import { RACES } from '@/content/races';
import { RECRUIT_NAMES_BY_RACE } from '@/content/recruitNames';

describe('generateRecruitOffers', () => {
  it('only ever offers classes the recruit race allows', () => {
    // Many rolls so Feryan recruits (no magic) are certain to appear.
    for (let rollIndex = 0; rollIndex < 30; rollIndex += 1) {
      const offers = generateRecruitOffers(
        new SeededRandomNumberGenerator(rollIndex),
        RACES,
        RECRUIT_NAMES_BY_RACE,
        3,
        'bronze',
      );
      expect(offers).toHaveLength(RECRUITS_ON_OFFER_BY_TIER.bronze);
      for (const offer of offers) {
        const race = RACES[offer.member.raceIdentifier];
        expect(race?.allowedBaseClasses).toContain(offer.member.classIdentifier);
        expect(offer.member.level).toBeGreaterThanOrEqual(1);
        expect(offer.hireCostInGold).toBe(hireCostForLevel(offer.member.level));
      }
    }
  });

  it('offers more recruits at gold reputation', () => {
    const offers = generateRecruitOffers(
      new SeededRandomNumberGenerator(1),
      RACES,
      RECRUIT_NAMES_BY_RACE,
      3,
      'gold',
    );
    expect(offers).toHaveLength(RECRUITS_ON_OFFER_BY_TIER.gold);
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
