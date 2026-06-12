import type { EquipmentSlot } from '../items/EquipmentDefinition';
import type { BaseClassIdentifier, RaceIdentifier } from '../units/Unit';

export const GUILD_ROSTER_CAPACITY = 20;
export const BATTLE_PARTY_CAPACITY = 6;
export const STARTING_GOLD = 300;

/** A persistent guild character; battle units are derived from this + content tables. */
export interface GuildMember {
  identifier: string;
  displayName: string;
  raceIdentifier: RaceIdentifier;
  baseClassIdentifier: BaseClassIdentifier;
  level: number;
  /** Progress toward the next level (see ExperienceAndLevels). */
  experiencePoints: number;
  /** What the member is wearing, by slot. Pieces here are NOT in the guild inventory. */
  equippedItemIdentifiers: Partial<Record<EquipmentSlot, string>>;
}

/** A candidate in the recruitment hall: a member plus their hiring fee. */
export interface RecruitOffer {
  member: GuildMember;
  hireCostInGold: number;
}

export interface GuildState {
  gold: number;
  roster: GuildMember[];
  /** Shared consumables by item identifier (potions, ethers …). */
  consumableInventory: Record<string, number>;
  /** Unequipped gear in the guild stores, by equipment identifier. */
  equipmentInventory: Record<string, number>;
  questIdentifiersOnBoard: string[];
  recruitsOnOffer: RecruitOffer[];
  completedQuestCount: number;
}

export function canAffordGoldCost(guild: GuildState, goldCost: number): boolean {
  return guild.gold >= goldCost;
}

/** Returns false (and changes nothing) when the guild cannot pay. */
export function spendGold(guild: GuildState, goldCost: number): boolean {
  if (!canAffordGoldCost(guild, goldCost)) {
    return false;
  }
  guild.gold -= goldCost;
  return true;
}

export function countConsumable(guild: GuildState, itemIdentifier: string): number {
  return guild.consumableInventory[itemIdentifier] ?? 0;
}

export function addConsumable(guild: GuildState, itemIdentifier: string, amount: number): void {
  guild.consumableInventory[itemIdentifier] = countConsumable(guild, itemIdentifier) + amount;
}

/** Returns false (and changes nothing) when there are not enough to remove. */
export function removeConsumable(guild: GuildState, itemIdentifier: string, amount: number): boolean {
  const owned = countConsumable(guild, itemIdentifier);
  if (owned < amount) {
    return false;
  }
  if (owned === amount) {
    delete guild.consumableInventory[itemIdentifier];
  } else {
    guild.consumableInventory[itemIdentifier] = owned - amount;
  }
  return true;
}

export function countEquipmentPieces(guild: GuildState, equipmentIdentifier: string): number {
  return guild.equipmentInventory[equipmentIdentifier] ?? 0;
}

export function addEquipmentPiece(guild: GuildState, equipmentIdentifier: string): void {
  guild.equipmentInventory[equipmentIdentifier] = countEquipmentPieces(guild, equipmentIdentifier) + 1;
}

/** Returns false (and changes nothing) when none are in the stores. */
export function removeEquipmentPiece(guild: GuildState, equipmentIdentifier: string): boolean {
  const owned = countEquipmentPieces(guild, equipmentIdentifier);
  if (owned < 1) {
    return false;
  }
  if (owned === 1) {
    delete guild.equipmentInventory[equipmentIdentifier];
  } else {
    guild.equipmentInventory[equipmentIdentifier] = owned - 1;
  }
  return true;
}

export function hasRoomInRoster(guild: GuildState): boolean {
  return guild.roster.length < GUILD_ROSTER_CAPACITY;
}

export function findRosterMember(guild: GuildState, memberIdentifier: string): GuildMember | undefined {
  return guild.roster.find((member) => member.identifier === memberIdentifier);
}
