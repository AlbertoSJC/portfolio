import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../../../src/content/equipment';
import { RACES } from '../../../src/content/races';
import { changeMemberBaseClass } from '../../../src/sim/guild/ClassChange';
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

describe('changeMemberBaseClass', () => {
  it('switches to another class the race allows', () => {
    const human: GuildMember = {
      identifier: 'member_human',
      displayName: 'Test Human',
      raceIdentifier: 'human',
      baseClassIdentifier: 'warrior',
      level: 3,
      experiencePoints: 20,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberBaseClass(guild, human.identifier, 'mage', RACES, EQUIPMENT)).toBe(true);
    expect(human.baseClassIdentifier).toBe('mage');
    expect(human.level).toBe(3); // level and XP survive the change
    expect(human.experiencePoints).toBe(20);
  });

  it('refuses classes the race forbids (Feryans never cast)', () => {
    const feryan: GuildMember = {
      identifier: 'member_feryan',
      displayName: 'Test Feryan',
      raceIdentifier: 'feryan',
      baseClassIdentifier: 'warrior',
      level: 2,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(feryan);
    expect(changeMemberBaseClass(guild, feryan.identifier, 'mage', RACES, EQUIPMENT)).toBe(false);
    expect(feryan.baseClassIdentifier).toBe('warrior');
  });

  it('returns gear the new class cannot use to the guild stores', () => {
    const human: GuildMember = {
      identifier: 'member_armed',
      displayName: 'Armed Human',
      raceIdentifier: 'human',
      baseClassIdentifier: 'warrior',
      level: 2,
      experiencePoints: 0,
      equippedItemIdentifiers: { weapon: 'iron_sword', armor: 'leather_vest' },
    };
    const guild = createTestGuildWithMember(human);
    changeMemberBaseClass(guild, human.identifier, 'thief', RACES, EQUIPMENT);
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
      baseClassIdentifier: 'warrior',
      level: 2,
      experiencePoints: 0,
      equippedItemIdentifiers: {},
    };
    const guild = createTestGuildWithMember(human);
    expect(changeMemberBaseClass(guild, human.identifier, 'warrior', RACES, EQUIPMENT)).toBe(false);
  });
});
