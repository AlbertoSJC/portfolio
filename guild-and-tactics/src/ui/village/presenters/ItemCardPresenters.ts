import {
  countConsumable,
  countEquipmentPieces,
  type GuildState,
} from '../../../sim/guild/GuildState';
import { storeStockOf } from '../../../sim/guild/StoreStock';
import {
  describeConsumableEffect,
  sellPriceForItem,
  type ConsumableItemDefinition,
} from '../../../sim/items/ConsumableItemDefinition';
import {
  EQUIPMENT_SLOT_DISPLAY_NAMES,
  sellPriceForEquipment,
  type EquipmentDefinition,
  type EquipmentSlot,
} from '../../../sim/items/EquipmentDefinition';
import type { BaseClassDefinition } from '../../../sim/units/UnitDefinitions';
import type { SkillDefinition } from '../../../sim/battle/SkillDefinition';
import type { ItemIconKind } from '../ItemIcons';
import { iconKindForConsumable, iconKindForEquipment } from '../ItemIcons';
import { describeStatisticBonuses } from './StatisticDescriptions';

export interface ItemCardViewModel {
  iconKind: ItemIconKind;
  title: string;
  typeLine: string;
  effectLine: string;
  description: string;
  detailLines: string[];
}

export interface StoreCardViewModel extends ItemCardViewModel {
  merchandiseIdentifier: string;
  merchandiseKind: 'consumable' | 'equipment';
  priceLine: string;
  buyButtonLabel: string;
  buyDisabled: boolean;
  sellButtonLabel: string;
  sellDisabled: boolean;
}

export type StoreFilter = 'all' | 'consumables' | EquipmentSlot;

export const STORE_FILTER_ENTRIES: { identifier: StoreFilter; label: string }[] = [
  { identifier: 'all', label: 'All' },
  { identifier: 'consumables', label: 'Consumables' },
  { identifier: 'weapon', label: 'Weapons' },
  { identifier: 'armor', label: 'Armor' },
  { identifier: 'accessory', label: 'Accessories' },
];

export interface ItemContentTables {
  items: Record<string, ConsumableItemDefinition>;
  equipment: Record<string, EquipmentDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  skills: Record<string, SkillDefinition>;
}

/** "+5 ATK · Teaches: Cleaving Arc" — bonuses plus the granted skill, if any. */
function describeEquipmentEffects(
  equipment: EquipmentDefinition,
  skills: Record<string, SkillDefinition>,
): string {
  const bonusLine = describeStatisticBonuses(equipment.statisticBonuses);
  if (equipment.grantedSkillIdentifier === undefined) {
    return bonusLine;
  }
  const skillName =
    skills[equipment.grantedSkillIdentifier]?.displayName ?? equipment.grantedSkillIdentifier;
  return `${bonusLine} · Teaches: ${skillName}`;
}

export function describeClassRestriction(
  equipment: EquipmentDefinition,
  baseClasses: Record<string, BaseClassDefinition>,
): string {
  if (equipment.allowedClasses === undefined) {
    return 'Anyone';
  }
  return equipment.allowedClasses
    .map((classIdentifier) => baseClasses[classIdentifier]?.displayName ?? classIdentifier)
    .join(', ');
}

export function buildStoreCardViewModels(
  guild: GuildState,
  zoneIdentifier: string,
  content: ItemContentTables,
  storeFilter: StoreFilter,
): StoreCardViewModel[] {
  const storeCards: StoreCardViewModel[] = [];
  if (storeFilter === 'all' || storeFilter === 'consumables') {
    for (const item of Object.values(content.items)) {
      storeCards.push(buildConsumableStoreCard(guild, zoneIdentifier, item));
    }
  }
  for (const equipment of Object.values(content.equipment)) {
    if (storeFilter === 'all' || storeFilter === equipment.slot) {
      storeCards.push(buildEquipmentStoreCard(guild, zoneIdentifier, equipment, content));
    }
  }
  return storeCards;
}

function buildConsumableStoreCard(
  guild: GuildState,
  zoneIdentifier: string,
  item: ConsumableItemDefinition,
): StoreCardViewModel {
  const stockRemaining = storeStockOf(guild, zoneIdentifier, item.identifier);
  return {
    iconKind: iconKindForConsumable(item),
    title: item.displayName,
    typeLine: 'Consumable',
    effectLine: describeConsumableEffect(item),
    description: item.description,
    detailLines: [],
    merchandiseIdentifier: item.identifier,
    merchandiseKind: 'consumable',
    priceLine: `Price: ${item.priceInGold} gold · Stock: ${stockRemaining} · Owned: ${countConsumable(guild, item.identifier)}`,
    buyButtonLabel: stockRemaining < 1 ? 'Out of stock' : `Buy (${item.priceInGold}g)`,
    buyDisabled: guild.gold < item.priceInGold || stockRemaining < 1,
    sellButtonLabel: `Sell (${sellPriceForItem(item)}g)`,
    sellDisabled: countConsumable(guild, item.identifier) < 1,
  };
}

function buildEquipmentStoreCard(
  guild: GuildState,
  zoneIdentifier: string,
  equipment: EquipmentDefinition,
  content: ItemContentTables,
): StoreCardViewModel {
  const stockRemaining = storeStockOf(guild, zoneIdentifier, equipment.identifier);
  return {
    iconKind: iconKindForEquipment(equipment),
    title: equipment.displayName,
    typeLine: `${EQUIPMENT_SLOT_DISPLAY_NAMES[equipment.slot]} · ${describeClassRestriction(equipment, content.baseClasses)}`,
    effectLine: describeEquipmentEffects(equipment, content.skills),
    description: equipment.description,
    detailLines: [],
    merchandiseIdentifier: equipment.identifier,
    merchandiseKind: 'equipment',
    priceLine: `Price: ${equipment.priceInGold} gold · Stock: ${stockRemaining} · In storage: ${countEquipmentPieces(guild, equipment.identifier)}`,
    buyButtonLabel: stockRemaining < 1 ? 'Out of stock' : `Buy (${equipment.priceInGold}g)`,
    buyDisabled: guild.gold < equipment.priceInGold || stockRemaining < 1,
    sellButtonLabel: `Sell (${sellPriceForEquipment(equipment)}g)`,
    sellDisabled: countEquipmentPieces(guild, equipment.identifier) < 1,
  };
}

export interface InventoryViewModel {
  consumableCards: ItemCardViewModel[];
  equipmentCards: ItemCardViewModel[];
}

export function buildInventoryViewModel(
  guild: GuildState,
  content: ItemContentTables,
): InventoryViewModel {
  const consumableCards: ItemCardViewModel[] = [];
  for (const [itemIdentifier, count] of Object.entries(guild.consumableInventory)) {
    const item = content.items[itemIdentifier];
    if (item === undefined || count < 1) {
      continue;
    }
    consumableCards.push({
      iconKind: iconKindForConsumable(item),
      title: `${item.displayName} ×${count}`,
      typeLine: 'Consumable',
      effectLine: describeConsumableEffect(item),
      description: item.description,
      detailLines: [],
    });
  }

  const equipmentCards: ItemCardViewModel[] = [];
  for (const equipment of Object.values(content.equipment)) {
    const storageCount = countEquipmentPieces(guild, equipment.identifier);
    const wearerNames = guild.roster
      .filter((member) =>
        Object.values(member.equippedItemIdentifiers).includes(equipment.identifier),
      )
      .map((member) => member.displayName);
    if (storageCount < 1 && wearerNames.length === 0) {
      continue;
    }
    equipmentCards.push({
      iconKind: iconKindForEquipment(equipment),
      title: equipment.displayName,
      typeLine: `${EQUIPMENT_SLOT_DISPLAY_NAMES[equipment.slot]} · ${describeClassRestriction(equipment, content.baseClasses)}`,
      effectLine: describeEquipmentEffects(equipment, content.skills),
      description: equipment.description,
      detailLines: [
        `Equipped by: ${wearerNames.length === 0 ? '—' : wearerNames.join(', ')}`,
        `In storage: ${storageCount}`,
      ],
    });
  }

  return { consumableCards, equipmentCards };
}
