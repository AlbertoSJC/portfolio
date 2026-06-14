import { describe, expect, it } from 'vitest';
import { ADVANCED_CLASSES } from '../../../src/content/advancedClasses';
import { EQUIPMENT } from '../../../src/content/equipment';
import { RACES } from '../../../src/content/races';
import { changeMemberClass } from '../../../src/sim/guild/ClassChange';
import type { GuildMember, GuildState } from '../../../src/sim/guild/GuildState';

function createTestGuildWithMember(member: GuildMember): GuildState {
  return {
    gold: 0,
    roster: [member],
    consumableInventory: {},
    equipmentInventory: {},
    storeStock: {},
    questIdentifiersOnBoard: [],
    recruitsOnOffer: [],
    completedQuestCount: 0,
  };
}

describe('changeMemberClass — base classes', () => {
  it('switches to another base class the race allows', () => {
    const human: GuildMember = {
      identifier: 'member_human',
      displayName: 'Test Human',
      raceIdentifier: 'human',
      classIdentifier: 'warrior',
      classLevelsReached: {},
      level: 3,
      experiencePoints: 20,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberClass(guild, human.identifier, 'mage', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(true);
    expect(human.classIdentifier).toBe('mage');
    expect(human.level).toBe(3);
    expect(human.experiencePoints).toBe(20);
  });

  it('refuses base classes the race forbids (Feryans never cast)', () => {
    const feryan: GuildMember = {
      identifier: 'member_feryan',
      displayName: 'Test Feryan',
      raceIdentifier: 'feryan',
      classIdentifier: 'warrior',
      classLevelsReached: {},
      level: 2,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(feryan);
    expect(changeMemberClass(guild, feryan.identifier, 'mage', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(false);
    expect(feryan.classIdentifier).toBe('warrior');
  });

  it('returns gear the new class cannot use to the guild stores', () => {
    const human: GuildMember = {
      identifier: 'member_armed',
      displayName: 'Armed Human',
      raceIdentifier: 'human',
      classIdentifier: 'warrior',
      classLevelsReached: {},
      level: 2,
      experiencePoints: 0,
      equippedItemIdentifiers: { weapon: 'iron_sword', armor: 'leather_vest' },
    };
    const guild = createTestGuildWithMember(human);
    changeMemberClass(guild, human.identifier, 'thief', RACES, ADVANCED_CLASSES, EQUIPMENT);
    // The warrior-only sword comes off; the unrestricted vest stays on.
    expect(human.equippedItemIdentifiers.weapon).toBeUndefined();
    expect(human.equippedItemIdentifiers.armor).toBe('leather_vest');
    expect(guild.equipmentInventory['iron_sword']).toBe(1);
  });

  it('reports false when asked to switch to the current class', () => {
    const human: GuildMember = {
      identifier: 'member_same',
      displayName: 'Same Class Human',
      raceIdentifier: 'human',
      classIdentifier: 'warrior',
      classLevelsReached: {},
      level: 2,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberClass(guild, human.identifier, 'warrior', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(false);
  });
});

describe('changeMemberClass — advanced classes', () => {
  it('allows an advanced class when the prerequisite level is met', () => {
    const human: GuildMember = {
      identifier: 'member_knight',
      displayName: 'Knight Candidate',
      raceIdentifier: 'human',
      classIdentifier: 'warrior',
      classLevelsReached: { warrior: 5 },
      level: 5,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberClass(guild, human.identifier, 'knight', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(true);
    expect(human.classIdentifier).toBe('knight');
  });

  it('blocks an advanced class when the primary prerequisite is not yet met', () => {
    const human: GuildMember = {
      identifier: 'member_low',
      displayName: 'Low Level Human',
      raceIdentifier: 'human',
      classIdentifier: 'warrior',
      classLevelsReached: { warrior: 4 },
      level: 4,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberClass(guild, human.identifier, 'knight', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(false);
    expect(human.classIdentifier).toBe('warrior');
  });

  it('allows a hybrid class when both prerequisite levels are met', () => {
    const human: GuildMember = {
      identifier: 'member_sage',
      displayName: 'Sage Candidate',
      raceIdentifier: 'human',
      classIdentifier: 'mage',
      classLevelsReached: { mage: 5, priest: 3 },
      level: 5,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberClass(guild, human.identifier, 'sage', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(true);
    expect(human.classIdentifier).toBe('sage');
  });

  it('blocks a hybrid class when only the primary prerequisite is met', () => {
    const human: GuildMember = {
      identifier: 'member_partial',
      displayName: 'Partial Candidate',
      raceIdentifier: 'human',
      classIdentifier: 'mage',
      classLevelsReached: { mage: 5, priest: 2 },
      level: 5,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberClass(guild, human.identifier, 'sage', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(false);
  });

  it('refuses an advanced class the race does not have access to', () => {
    const feryan: GuildMember = {
      identifier: 'member_feryan_knight',
      displayName: 'Feryan Wannabe Knight',
      raceIdentifier: 'feryan',
      classIdentifier: 'warrior',
      classLevelsReached: { warrior: 5 },
      level: 5,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(feryan);
    // Feryans cannot be Knights — that class is not in their allowedAdvancedClasses.
    expect(changeMemberClass(guild, feryan.identifier, 'knight', RACES, ADVANCED_CLASSES, EQUIPMENT)).toBe(false);
  });
});
