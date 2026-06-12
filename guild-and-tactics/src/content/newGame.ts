import type { SeededRandomNumberGenerator } from '../sim/SeededRandomNumberGenerator';
import type { GuildState } from '../sim/guild/GuildState';
import { STARTING_GOLD } from '../sim/guild/GuildState';
import { refillQuestBoard } from '../sim/guild/QuestBoard';
import { averageRosterLevel, generateRecruitOffers } from '../sim/guild/RecruitGeneration';
import { QUESTS } from './quests';
import { RACES } from './races';
import { RECRUIT_NAMES_BY_RACE } from './recruitNames';

const STARTING_MEMBER_LEVEL = 2;
const STARTING_POTIONS = 2;
const STARTING_ETHERS = 1;

/**
 * A fresh guild charter in Wanderer's Rest: the five founding members
 * (one per race — the same five who held the forest clearing in M1),
 * a little coin, and a stocked quest board.
 */
export function createNewGuild(randomNumberGenerator: SeededRandomNumberGenerator): GuildState {
  const guild: GuildState = {
    gold: STARTING_GOLD,
    roster: [
      {
        identifier: 'member_garrick',
        displayName: 'Garrick',
        raceIdentifier: 'human',
        baseClassIdentifier: 'warrior',
        level: STARTING_MEMBER_LEVEL,
        experiencePoints: 0,
        equippedItemIdentifiers: {},
      },
      {
        identifier: 'member_nyssa',
        displayName: 'Nyssa',
        raceIdentifier: 'werecat',
        baseClassIdentifier: 'thief',
        level: STARTING_MEMBER_LEVEL,
        experiencePoints: 0,
        equippedItemIdentifiers: {},
      },
      {
        identifier: 'member_morvane',
        displayName: 'Morvane',
        raceIdentifier: 'undead',
        baseClassIdentifier: 'mage',
        level: STARTING_MEMBER_LEVEL,
        experiencePoints: 0,
        equippedItemIdentifiers: {},
      },
      {
        identifier: 'member_brakka',
        displayName: 'Brakka',
        raceIdentifier: 'werelizard',
        baseClassIdentifier: 'priest',
        level: STARTING_MEMBER_LEVEL,
        experiencePoints: 0,
        equippedItemIdentifiers: {},
      },
      {
        identifier: 'member_skreel',
        displayName: 'Skreel',
        raceIdentifier: 'feryan',
        baseClassIdentifier: 'warrior',
        level: STARTING_MEMBER_LEVEL,
        experiencePoints: 0,
        equippedItemIdentifiers: {},
      },
    ],
    consumableInventory: { potion: STARTING_POTIONS, ether: STARTING_ETHERS },
    // A couple of starter pieces so the equipment flow is discoverable.
    equipmentInventory: { iron_sword: 1, leather_vest: 1 },
    questIdentifiersOnBoard: [],
    recruitsOnOffer: [],
    completedQuestCount: 0,
  };
  refillQuestBoard(guild, Object.keys(QUESTS), randomNumberGenerator);
  guild.recruitsOnOffer = generateRecruitOffers(
    randomNumberGenerator,
    RACES,
    RECRUIT_NAMES_BY_RACE,
    averageRosterLevel(guild.roster.map((member) => member.level)),
  );
  return guild;
}
