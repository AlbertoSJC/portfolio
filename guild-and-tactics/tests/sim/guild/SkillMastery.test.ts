import { describe, expect, it } from 'vitest';
import {
  SKILL_USES_TO_MASTER,
  equipmentGrantedSkillIdentifiersForMember,
  isSkillMastered,
  masteredSkillIdentifiersForMember,
  recordEquipmentSkillUses,
} from '@/sim/guild/SkillMastery';
import type { GuildMember } from '@/sim/guild/GuildState';
import { EQUIPMENT } from '@/content/equipment';
import { SKILLS } from '@/content/skills';

function createTestMember(overrides: Partial<GuildMember> = {}): GuildMember {
  return {
    identifier: 'member_test',
    displayName: 'Test Member',
    raceIdentifier: 'human',
    classIdentifier: 'warrior',
    classLevelsReached: {},
    skillMasteryProgress: {},
    level: 2,
    experiencePoints: 0,
    equippedItemIdentifiers: {},
    ...overrides,
  };
}

describe('equipmentGrantedSkillIdentifiersForMember', () => {
  it('lists the skills granted by worn gear and nothing else', () => {
    const member = createTestMember({
      equippedItemIdentifiers: { weapon: 'greathorn_cleaver', armor: 'leather_vest' },
    });
    expect(equipmentGrantedSkillIdentifiersForMember(member, EQUIPMENT)).toEqual(['cleaving_arc']);
  });

  it('is empty when no worn piece grants a skill', () => {
    const member = createTestMember({ equippedItemIdentifiers: { weapon: 'iron_sword' } });
    expect(equipmentGrantedSkillIdentifiersForMember(member, EQUIPMENT)).toEqual([]);
  });
});

describe('recordEquipmentSkillUses', () => {
  it('accumulates progress across battles and reports the mastering battle', () => {
    const member = createTestMember({
      equippedItemIdentifiers: { weapon: 'greathorn_cleaver' },
    });
    expect(recordEquipmentSkillUses(member, { cleaving_arc: SKILL_USES_TO_MASTER - 1 }, EQUIPMENT)).toEqual([]);
    expect(isSkillMastered(member, 'cleaving_arc')).toBe(false);

    expect(recordEquipmentSkillUses(member, { cleaving_arc: 1 }, EQUIPMENT)).toEqual(['cleaving_arc']);
    expect(isSkillMastered(member, 'cleaving_arc')).toBe(true);
    expect(masteredSkillIdentifiersForMember(member)).toEqual(['cleaving_arc']);
  });

  it('ignores uses of skills not granted by currently worn gear', () => {
    const member = createTestMember();
    expect(recordEquipmentSkillUses(member, { cleaving_arc: 5 }, EQUIPMENT)).toEqual([]);
    expect(member.skillMasteryProgress).toEqual({});
  });

  it('stops counting once a skill is mastered', () => {
    const member = createTestMember({
      skillMasteryProgress: { cleaving_arc: SKILL_USES_TO_MASTER },
      equippedItemIdentifiers: { weapon: 'greathorn_cleaver' },
    });
    expect(recordEquipmentSkillUses(member, { cleaving_arc: 2 }, EQUIPMENT)).toEqual([]);
    expect(member.skillMasteryProgress['cleaving_arc']).toBe(SKILL_USES_TO_MASTER);
  });

  it('never reports a skill as newly mastered twice', () => {
    const member = createTestMember({
      equippedItemIdentifiers: { weapon: 'greathorn_cleaver' },
    });
    recordEquipmentSkillUses(member, { cleaving_arc: SKILL_USES_TO_MASTER }, EQUIPMENT);
    expect(recordEquipmentSkillUses(member, { cleaving_arc: 1 }, EQUIPMENT)).toEqual([]);
  });
});

describe('equipment content validity', () => {
  it('every grantedSkillIdentifier in EQUIPMENT points at a real skill', () => {
    for (const equipment of Object.values(EQUIPMENT)) {
      if (equipment.grantedSkillIdentifier === undefined) {
        continue;
      }
      expect(
        SKILLS[equipment.grantedSkillIdentifier],
        `"${equipment.identifier}" grants unknown skill "${equipment.grantedSkillIdentifier}"`,
      ).toBeDefined();
    }
  });
});
