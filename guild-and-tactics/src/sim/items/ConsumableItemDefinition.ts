/** What a consumable does when used on a battle unit. */
export type ConsumableItemEffect =
  | { kind: 'restoreHitPoints'; amount: number }
  | { kind: 'restoreManaPoints'; amount: number };

export interface ConsumableItemDefinition {
  identifier: string;
  displayName: string;
  description: string;
  priceInGold: number;
  effect: ConsumableItemEffect;
}

/** Stores buy back consumables at this fraction of the purchase price. */
export const ITEM_SELL_PRICE_FRACTION = 0.5;

export function sellPriceForItem(item: ConsumableItemDefinition): number {
  return Math.floor(item.priceInGold * ITEM_SELL_PRICE_FRACTION);
}
