import {
  GUILD_ROSTER_CAPACITY,
  type GuildMember,
  type GuildState,
} from '../../../sim/guild/GuildState';
import { isMemberDispatched } from '../../../sim/guild/DispatchQuest';
import type { EquipmentDefinition } from '../../../sim/items/EquipmentDefinition';
import { experienceRequiredToLevelUpFrom } from '../../../sim/progression/ExperienceAndLevels';
import type { BaseClassDefinition, RaceDefinition } from '../../../sim/units/UnitDefinitions';

export interface MemberContentTables {
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  equipment: Record<string, EquipmentDefinition>;
}

export interface MemberIdentityViewModel {
  memberIdentifier: string;
  displayName: string;
  raceDisplayName: string;
  classDisplayName: string;
  summaryLine: string;
}

export function buildMemberIdentity(
  member: GuildMember,
  content: MemberContentTables,
): MemberIdentityViewModel {
  const raceDisplayName = content.races[member.raceIdentifier]?.displayName ?? member.raceIdentifier;
  const classDisplayName =
    content.baseClasses[member.classIdentifier]?.displayName ?? member.classIdentifier;
  return {
    memberIdentifier: member.identifier,
    displayName: member.displayName,
    raceDisplayName,
    classDisplayName,
    summaryLine: `${raceDisplayName} ${classDisplayName} · Level ${member.level}`,
  };
}

export interface RosterCardViewModel extends MemberIdentityViewModel {
  experienceLine: string;
  experienceFillPercent: number;
  equippedLine: string;
}

export function buildRosterCardViewModels(
  guild: GuildState,
  content: MemberContentTables,
): RosterCardViewModel[] {
  return guild.roster.map((member) => {
    const experienceRequired = experienceRequiredToLevelUpFrom(member.level);
    const equippedNames = Object.values(member.equippedItemIdentifiers)
      .map((equipmentIdentifier) => content.equipment[equipmentIdentifier]?.displayName)
      .filter((displayName) => displayName !== undefined)
      .join(', ');
    const identity = buildMemberIdentity(member, content);
    if (isMemberDispatched(guild, member.identifier)) {
      identity.summaryLine += ' · Away on dispatch';
    }
    return {
      ...identity,
      experienceLine: `XP: ${member.experiencePoints} / ${experienceRequired}`,
      experienceFillPercent: Math.min(100, (member.experiencePoints / experienceRequired) * 100),
      equippedLine: equippedNames === '' ? 'No equipment' : equippedNames,
    };
  });
}

export interface RecruitCardViewModel extends MemberIdentityViewModel {
  feeLine: string;
  hireButtonLabel: string;
  hireDisabled: boolean;
}

export function buildRecruitCardViewModels(
  guild: GuildState,
  content: MemberContentTables,
): RecruitCardViewModel[] {
  const rosterFull = guild.roster.length >= GUILD_ROSTER_CAPACITY;
  return guild.recruitsOnOffer.map((recruitOffer) => ({
    ...buildMemberIdentity(recruitOffer.member, content),
    feeLine: `Hiring fee: ${recruitOffer.hireCostInGold} gold`,
    hireButtonLabel: rosterFull ? 'Roster full' : `Hire (${recruitOffer.hireCostInGold}g)`,
    hireDisabled: rosterFull || guild.gold < recruitOffer.hireCostInGold,
  }));
}

export interface MusterCardViewModel extends MemberIdentityViewModel {
  isSelected: boolean;
  /** Away on a dispatch quest — shown but not selectable. */
  isAway: boolean;
}

export function buildMusterCardViewModels(
  guild: GuildState,
  selectedMemberIdentifiers: ReadonlySet<string>,
  content: MemberContentTables,
): MusterCardViewModel[] {
  return guild.roster.map((member) => ({
    ...buildMemberIdentity(member, content),
    isSelected: selectedMemberIdentifiers.has(member.identifier),
    isAway: isMemberDispatched(guild, member.identifier),
  }));
}
