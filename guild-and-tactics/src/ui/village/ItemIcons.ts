import type { ConsumableItemDefinition } from '@/sim/items/ConsumableItemDefinition';
import type { EquipmentDefinition } from '@/sim/items/EquipmentDefinition';

/**
 * Procedural canvas icons by item type — the item counterpart of the
 * unit miniatures. One icon per type, not per item (PRD swap-point
 * principle: real art later replaces only this module).
 */

export type ItemIconKind =
  | 'healingFlask'
  | 'manaFlask'
  | 'sword'
  | 'dagger'
  | 'staff'
  | 'rod'
  | 'armor'
  | 'accessory';

const ICON_SIZE_PIXELS = 56;
const ICON_OUTLINE_COLOR = '#15181e';
const FLASK_GLASS_COLOR = '#c8d4dc';
const HEALING_LIQUID_COLOR = '#d9534f';
const MANA_LIQUID_COLOR = '#4f8fd0';
const BLADE_COLOR = '#dde3e8';
const HANDLE_COLOR = '#8a6233';
const GOLD_TRIM_COLOR = '#d9b13b';
const ARMOR_PLATE_COLOR = '#7f8a99';
const ACCESSORY_GEM_COLOR = '#7fd4ff';

export function iconKindForConsumable(item: ConsumableItemDefinition): ItemIconKind {
  return item.effect.kind === 'restoreHitPoints' ? 'healingFlask' : 'manaFlask';
}

export function iconKindForEquipment(equipment: EquipmentDefinition): ItemIconKind {
  if (equipment.slot === 'armor') {
    return 'armor';
  }
  if (equipment.slot === 'accessory') {
    return 'accessory';
  }
  // Weapons: pick the silhouette from the class that wields them.
  const wieldingClass = equipment.allowedClasses?.[0];
  switch (wieldingClass) {
    case 'thief':
      return 'dagger';
    case 'mage':
      return 'staff';
    case 'priest':
      return 'rod';
    default:
      return 'sword';
  }
}

export function createItemIconCanvas(iconKind: ItemIconKind): HTMLCanvasElement {
  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = ICON_SIZE_PIXELS;
  iconCanvas.height = ICON_SIZE_PIXELS;
  iconCanvas.className = 'item-icon';
  const drawingContext = iconCanvas.getContext('2d');
  if (drawingContext === null) {
    return iconCanvas;
  }
  const centerX = ICON_SIZE_PIXELS / 2;
  ICON_DRAWERS[iconKind](drawingContext, centerX);
  return iconCanvas;
}

type IconDrawer = (drawingContext: CanvasRenderingContext2D, centerX: number) => void;

function outlineAndFill(drawingContext: CanvasRenderingContext2D, fillColor: string): void {
  drawingContext.fillStyle = fillColor;
  drawingContext.fill();
  drawingContext.strokeStyle = ICON_OUTLINE_COLOR;
  drawingContext.stroke();
}

function drawFlask(
  drawingContext: CanvasRenderingContext2D,
  centerX: number,
  liquidColor: string,
): void {
  // Round body with liquid, narrow neck, cork.
  drawingContext.beginPath();
  drawingContext.arc(centerX, 34, 14, 0, Math.PI * 2);
  outlineAndFill(drawingContext, FLASK_GLASS_COLOR);
  drawingContext.beginPath();
  drawingContext.arc(centerX, 36, 11, 0, Math.PI * 2);
  drawingContext.fillStyle = liquidColor;
  drawingContext.fill();
  drawingContext.beginPath();
  drawingContext.rect(centerX - 4, 12, 8, 10);
  outlineAndFill(drawingContext, FLASK_GLASS_COLOR);
  drawingContext.beginPath();
  drawingContext.rect(centerX - 5, 8, 10, 5);
  outlineAndFill(drawingContext, HANDLE_COLOR);
}

const ICON_DRAWERS: Record<ItemIconKind, IconDrawer> = {
  healingFlask: (drawingContext, centerX) =>
    drawFlask(drawingContext, centerX, HEALING_LIQUID_COLOR),
  manaFlask: (drawingContext, centerX) => drawFlask(drawingContext, centerX, MANA_LIQUID_COLOR),

  sword: (drawingContext, centerX) => {
    drawingContext.strokeStyle = BLADE_COLOR;
    drawingContext.lineWidth = 5;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX + 12, 10);
    drawingContext.lineTo(centerX - 8, 34);
    drawingContext.stroke();
    drawingContext.strokeStyle = GOLD_TRIM_COLOR;
    drawingContext.lineWidth = 4;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX - 14, 30);
    drawingContext.lineTo(centerX - 2, 40);
    drawingContext.stroke();
    drawingContext.strokeStyle = HANDLE_COLOR;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX - 9, 36);
    drawingContext.lineTo(centerX - 16, 45);
    drawingContext.stroke();
    drawingContext.lineWidth = 1;
  },

  dagger: (drawingContext, centerX) => {
    drawingContext.strokeStyle = BLADE_COLOR;
    drawingContext.lineWidth = 4;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX + 8, 16);
    drawingContext.lineTo(centerX - 4, 32);
    drawingContext.stroke();
    drawingContext.strokeStyle = GOLD_TRIM_COLOR;
    drawingContext.lineWidth = 3;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX - 9, 29);
    drawingContext.lineTo(centerX, 36);
    drawingContext.stroke();
    drawingContext.strokeStyle = HANDLE_COLOR;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX - 5, 34);
    drawingContext.lineTo(centerX - 11, 42);
    drawingContext.stroke();
    drawingContext.lineWidth = 1;
  },

  staff: (drawingContext, centerX) => {
    drawingContext.strokeStyle = HANDLE_COLOR;
    drawingContext.lineWidth = 4;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX - 2, 48);
    drawingContext.lineTo(centerX + 2, 16);
    drawingContext.stroke();
    drawingContext.lineWidth = 1;
    drawingContext.beginPath();
    drawingContext.arc(centerX + 3, 12, 6, 0, Math.PI * 2);
    outlineAndFill(drawingContext, ACCESSORY_GEM_COLOR);
  },

  rod: (drawingContext, centerX) => {
    drawingContext.strokeStyle = HANDLE_COLOR;
    drawingContext.lineWidth = 4;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX, 48);
    drawingContext.lineTo(centerX, 18);
    drawingContext.stroke();
    drawingContext.strokeStyle = GOLD_TRIM_COLOR;
    drawingContext.beginPath();
    drawingContext.moveTo(centerX, 8);
    drawingContext.lineTo(centerX, 22);
    drawingContext.moveTo(centerX - 6, 13);
    drawingContext.lineTo(centerX + 6, 13);
    drawingContext.stroke();
    drawingContext.lineWidth = 1;
  },

  armor: (drawingContext, centerX) => {
    // A breastplate: shoulders tapering to the waist.
    drawingContext.beginPath();
    drawingContext.moveTo(centerX - 16, 14);
    drawingContext.lineTo(centerX + 16, 14);
    drawingContext.lineTo(centerX + 12, 32);
    drawingContext.lineTo(centerX, 44);
    drawingContext.lineTo(centerX - 12, 32);
    drawingContext.closePath();
    outlineAndFill(drawingContext, ARMOR_PLATE_COLOR);
    drawingContext.beginPath();
    drawingContext.moveTo(centerX, 18);
    drawingContext.lineTo(centerX, 40);
    drawingContext.strokeStyle = ICON_OUTLINE_COLOR;
    drawingContext.stroke();
  },

  accessory: (drawingContext, centerX) => {
    drawingContext.beginPath();
    drawingContext.arc(centerX, 32, 11, 0, Math.PI * 2);
    drawingContext.lineWidth = 5;
    drawingContext.strokeStyle = GOLD_TRIM_COLOR;
    drawingContext.stroke();
    drawingContext.lineWidth = 1;
    drawingContext.beginPath();
    drawingContext.arc(centerX, 18, 5, 0, Math.PI * 2);
    outlineAndFill(drawingContext, ACCESSORY_GEM_COLOR);
  },
};
