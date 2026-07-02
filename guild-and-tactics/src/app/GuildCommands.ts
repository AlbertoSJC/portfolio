import { ADVANCED_CLASSES } from '../content/advancedClasses';
import { DISPATCH_QUESTS } from '../content/dispatchQuests';
import { EQUIPMENT } from '../content/equipment';
import { ITEMS } from '../content/items';
import { RACES } from '../content/races';
import { changeMemberClass } from '../sim/guild/ClassChange';
import { startDispatch } from '../sim/guild/DispatchQuest';
import {
  addConsumable,
  addEquipmentPiece,
  findRosterMember,
  hasRoomInRoster,
  removeConsumable,
  removeEquipmentPiece,
  spendGold,
  type GuildState,
} from '../sim/guild/GuildState';
import { equipItemOnMember, unequipMemberSlot } from '../sim/guild/MemberEquipment';
import { storeStockOf, takeOneFromStoreStock } from '../sim/guild/StoreStock';
import { sellPriceForItem } from '../sim/items/ConsumableItemDefinition';
import { sellPriceForEquipment, type EquipmentSlot } from '../sim/items/EquipmentDefinition';
import type { BaseClassIdentifier, ClassIdentifier } from '../sim/units/Unit';

function canAffordAndInStock(
  guild: GuildState,
  zoneIdentifier: string,
  priceInGold: number,
  itemIdentifier: string,
): boolean {
  return guild.gold >= priceInGold && storeStockOf(guild, zoneIdentifier, itemIdentifier) > 0;
}

/**
 * The menu-driven guild commands (store, roster, character sheet, dispatch
 * board): each validates through the sim layer and reports back through
 * `onGuildChanged` so the owner can persist and re-render. Battle flow and
 * scene management stay in GameController — this class never touches a
 * screen. Holds the same GuildState instance the whole game mutates in
 * place; a command that changes nothing calls nothing.
 */
export class GuildCommands {
  private readonly guild: GuildState;
  private readonly onGuildChanged: () => void;

  constructor(guild: GuildState, onGuildChanged: () => void) {
    this.guild = guild;
    this.onGuildChanged = onGuildChanged;
  }

  buyItem(zoneIdentifier: string | undefined, itemIdentifier: string): void {
    const item = ITEMS[itemIdentifier];
    if (
      zoneIdentifier === undefined ||
      item === undefined ||
      !canAffordAndInStock(this.guild, zoneIdentifier, item.priceInGold, itemIdentifier)
    ) {
      return;
    }
    takeOneFromStoreStock(this.guild, zoneIdentifier, itemIdentifier);
    spendGold(this.guild, item.priceInGold);
    addConsumable(this.guild, itemIdentifier, 1);
    this.onGuildChanged();
  }

  sellItem(itemIdentifier: string): void {
    const item = ITEMS[itemIdentifier];
    if (item === undefined || !removeConsumable(this.guild, itemIdentifier, 1)) {
      return;
    }
    this.guild.gold += sellPriceForItem(item);
    this.onGuildChanged();
  }

  buyEquipment(zoneIdentifier: string | undefined, equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (
      zoneIdentifier === undefined ||
      equipment === undefined ||
      !canAffordAndInStock(this.guild, zoneIdentifier, equipment.priceInGold, equipmentIdentifier)
    ) {
      return;
    }
    takeOneFromStoreStock(this.guild, zoneIdentifier, equipmentIdentifier);
    spendGold(this.guild, equipment.priceInGold);
    addEquipmentPiece(this.guild, equipmentIdentifier);
    this.onGuildChanged();
  }

  sellEquipment(equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !removeEquipmentPiece(this.guild, equipmentIdentifier)) {
      return;
    }
    this.guild.gold += sellPriceForEquipment(equipment);
    this.onGuildChanged();
  }

  changeClass(memberIdentifier: string, classIdentifier: ClassIdentifier): void {
    if (!changeMemberClass(this.guild, memberIdentifier, classIdentifier, RACES, ADVANCED_CLASSES, EQUIPMENT)) {
      return;
    }
    this.onGuildChanged();
  }

  setSecondarySkillClass(
    memberIdentifier: string,
    classIdentifier: BaseClassIdentifier | undefined,
  ): void {
    const member = findRosterMember(this.guild, memberIdentifier);
    if (member === undefined) return;
    member.secondarySkillClassIdentifier = classIdentifier;
    this.onGuildChanged();
  }

  equipItem(memberIdentifier: string, equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !equipItemOnMember(this.guild, memberIdentifier, equipment)) {
      return;
    }
    this.onGuildChanged();
  }

  unequipSlot(memberIdentifier: string, slot: EquipmentSlot): void {
    if (!unequipMemberSlot(this.guild, memberIdentifier, slot)) {
      return;
    }
    this.onGuildChanged();
  }

  startDispatchQuest(dispatchQuestIdentifier: string, memberIdentifier: string): void {
    const dispatchQuest = DISPATCH_QUESTS[dispatchQuestIdentifier];
    if (dispatchQuest === undefined || !startDispatch(this.guild, dispatchQuest, memberIdentifier)) {
      return;
    }
    this.onGuildChanged();
  }

  hireRecruit(recruitMemberIdentifier: string): void {
    const recruitOffer = this.guild.recruitsOnOffer.find(
      (offer) => offer.member.identifier === recruitMemberIdentifier,
    );
    if (recruitOffer === undefined || !hasRoomInRoster(this.guild)) {
      return;
    }
    if (!spendGold(this.guild, recruitOffer.hireCostInGold)) {
      return;
    }
    this.guild.roster.push(recruitOffer.member);
    this.guild.recruitsOnOffer = this.guild.recruitsOnOffer.filter(
      (offer) => offer.member.identifier !== recruitMemberIdentifier,
    );
    this.onGuildChanged();
  }
}
