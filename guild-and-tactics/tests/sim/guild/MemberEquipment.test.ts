import { describe, expect, it } from 'vitest';
import { EQUIPMENT } from '../../../src/content/equipment';
import type { GuildMember, GuildState } from '../../../src/sim/guild/GuildState';
import {
  equipItemOnMember,
  equippedDefinitionsForMember,
  unequipMemberSlot,
} from '../../../src/sim/guild/MemberEquipment';
import type { EquipmentDefinition } from '../../../src/sim/items/EquipmentDefinition';

function equipmentOrThrow(equipmentIdentifier: string): EquipmentDefinition {
  const equipment = EQUIPMENT[equipmentIdentifier];
  if (equipment === undefined) {
    throw new Error(`Missing equipment "${equipmentIdentifier}" in content`);
  }
  return equipment;
}

function createTestGuildWithWarrior(equipmentInventory: Record<string, number>): {
  guild: GuildState;
  warrior: GuildMember;
} {
  const warrior: GuildMember = {
    identifier: 'member_warrior',
    displayName: 'Test Warrior',
    raceIdentifier: 'human',
    baseClassIdentifier: 'warrior',
    level: 2,
    experiencePoints: 0,
    equippedItemIdentifiers: {},
  };
  const guild: GuildState = {
    gold: 0,
    roster: [warrior],
    consumableInventory: {},
    equipmentInventory,
    questIdentifiersOnBoard: [],
    recruitsOnOffer: [],
    completedQuestCount: 0,
  };
  return { guild, warrior };
}

describe('equipItemOnMember', () => {
  it('moves the piece from the stores onto the member', () => {
    const { guild, warrior } = createTestGuildWithWarrior({ iron_sword: 1 });
    const equipped = equipItemOnMember(guild, warrior.identifier, equipmentOrThrow('iron_sword'));
    expect(equipped).toBe(true);
    expect(warrior.equippedItemIdentifiers.weapon).toBe('iron_sword');
    expect(guild.equipmentInventory['iron_sword']).toBeUndefined();
  });

  it('returns the previously worn piece to the stores when swapping', () => {
    const { guild, warrior } = createTestGuildWithWarrior({
      iron_sword: 1,
      steel_greatblade: 1,
    });
    equipItemOnMember(guild, warrior.identifier, equipmentOrThrow('iron_sword'));
    equipItemOnMember(guild, warrior.identifier, equipmentOrThrow('steel_greatblade'));
    expect(warrior.equippedItemIdentifiers.weapon).toBe('steel_greatblade');
    expect(guild.equipmentInventory['iron_sword']).toBe(1);
  });

  it('refuses class-restricted equipment for the wrong class', () => {
    const { guild, warrior } = createTestGuildWithWarrior({ oak_focus_staff: 1 });
    const equipped = equipItemOnMember(
      guild,
      warrior.identifier,
      equipmentOrThrow('oak_focus_staff'), // mage-only
    );
    expect(equipped).toBe(false);
    expect(warrior.equippedItemIdentifiers.weapon).toBeUndefined();
    expect(guild.equipmentInventory['oak_focus_staff']).toBe(1);
  });

  it('refuses to equip what the stores do not hold', () => {
    const { guild, warrior } = createTestGuildWithWarrior({});
    expect(equipItemOnMember(guild, warrior.identifier, equipmentOrThrow('iron_sword'))).toBe(false);
  });
});

describe('unequipMemberSlot', () => {
  it('returns the worn piece to the stores', () => {
    const { guild, warrior } = createTestGuildWithWarrior({ iron_sword: 1 });
    equipItemOnMember(guild, warrior.identifier, equipmentOrThrow('iron_sword'));
    expect(unequipMemberSlot(guild, warrior.identifier, 'weapon')).toBe(true);
    expect(warrior.equippedItemIdentifiers.weapon).toBeUndefined();
    expect(guild.equipmentInventory['iron_sword']).toBe(1);
  });

  it('reports false for an already empty slot', () => {
    const { guild, warrior } = createTestGuildWithWarrior({});
    expect(unequipMemberSlot(guild, warrior.identifier, 'weapon')).toBe(false);
  });
});

describe('equippedDefinitionsForMember', () => {
  it('resolves identifiers and skips unknown ones', () => {
    const definitions = equippedDefinitionsForMember(
      { weapon: 'iron_sword', armor: 'item_that_no_longer_exists' },
      EQUIPMENT,
    );
    expect(definitions.map((definition) => definition.identifier)).toEqual(['iron_sword']);
  });
});
