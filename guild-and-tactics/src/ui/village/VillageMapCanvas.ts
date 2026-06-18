import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import {
  MAP_BORDER,
  MAP_BORDER_ACTIVE,
  MAP_BORDER_HOVER,
  MAP_COIN_BRIGHT,
  MAP_COIN_DARK,
  MAP_COIN_MID,
  MAP_COIN_STROKE,
  MAP_FIGURE_SIDE,
  MAP_FIGURE_STROKE,
  MAP_INK,
  MAP_INK_LIGHT,
  MAP_INK_MEDIUM,
  MAP_MARKER,
  MAP_PARCHMENT,
  MAP_PARCHMENT_ACTIVE,
  MAP_PARCHMENT_CREAM,
  MAP_PARCHMENT_HOVER,
  MAP_PARCHMENT_LIGHT,
  MAP_WOOD,
  MAP_WOOD_DARK,
  MAP_WOOD_PIN,
} from '../mapPalette';

export type VillageBuilding = 'tavern' | 'store' | 'recruitment' | 'guild_hall';

export interface VillageBuildingEntry {
  identifier: VillageBuilding;
  label: string;
  sublabel: string;
}

export const VILLAGE_BUILDINGS: VillageBuildingEntry[] = [
  { identifier: 'tavern', label: 'Tavern', sublabel: 'Quest Board' },
  { identifier: 'store', label: 'Store', sublabel: 'Buy & Sell' },
  { identifier: 'recruitment', label: 'Recruitment', sublabel: 'Hire Members' },
  { identifier: 'guild_hall', label: 'Guild Hall', sublabel: 'Roster & Gear' },
];

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 240;

const NODE_WIDTH = 116;
const NODE_HEIGHT = 72;
const NODE_CORNER_RADIUS = 7;

/** Vertical offsets within the node for icon, label, and sublabel. */
const ICON_CENTER_OFFSET_Y = -16;
const LABEL_OFFSET_Y = 8;
const SUBLABEL_OFFSET_Y = 21;

/** Center coordinates for each building node. */
const NODE_CENTERS: Record<VillageBuilding, { x: number; y: number }> = {
  tavern: { x: 100, y: 78 },
  store: { x: 340, y: 78 },
  recruitment: { x: 340, y: 172 },
  guild_hall: { x: 100, y: 172 },
};

/** Paths drawn between adjacent building nodes. */
const NODE_PATHS: [VillageBuilding, VillageBuilding][] = [
  ['tavern', 'store'],
  ['guild_hall', 'recruitment'],
  ['tavern', 'guild_hall'],
  ['store', 'recruitment'],
];

const COLOR_BACKGROUND = MAP_PARCHMENT;
const COLOR_PATH = MAP_INK_MEDIUM;
const COLOR_NODE_DEFAULT = MAP_PARCHMENT_LIGHT;
const COLOR_NODE_HOVER = MAP_PARCHMENT_HOVER;
const COLOR_NODE_ACTIVE = MAP_PARCHMENT_ACTIVE;
const COLOR_NODE_BORDER_DEFAULT = MAP_BORDER;
const COLOR_NODE_BORDER_ACTIVE = MAP_BORDER_ACTIVE;
const COLOR_NODE_BORDER_HOVER = MAP_BORDER_HOVER;
const COLOR_LABEL = MAP_INK;
const COLOR_SUBLABEL = MAP_INK_LIGHT;
const COLOR_PARTY_MARKER = MAP_MARKER;

// ── Building icons ────────────────────────────────────────────────────────────

/** Tavern: a notice board with three quest postings pinned to it. */
function drawTavernIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 18;
  const h = 20;
  const left = cx - w / 2;
  const top = cy - h / 2;

  context.fillStyle = MAP_WOOD;
  context.strokeStyle = MAP_WOOD_DARK;
  context.lineWidth = 1;
  context.beginPath();
  context.rect(left, top, w, h);
  context.fill();
  context.stroke();

  // Three posting lines (parchment slips)
  context.strokeStyle = MAP_PARCHMENT_CREAM;
  context.lineWidth = 1.2;
  for (let row = 0; row < 3; row++) {
    const lineY = top + 4 + row * 5.5;
    context.beginPath();
    context.moveTo(left + 2.5, lineY);
    context.lineTo(left + w - 2.5, lineY);
    context.stroke();
  }

  // Pin at top center
  context.fillStyle = MAP_WOOD_PIN;
  context.beginPath();
  context.arc(cx, top, 2.5, 0, Math.PI * 2);
  context.fill();
}

/** Store: a stack of three coins viewed edge-on. */
function drawStoreIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const coinW = 20;
  const coinH = 7;
  const stackStep = 5;
  const bottomY = cy + 8;

  const shades = [MAP_COIN_DARK, MAP_COIN_MID, MAP_COIN_BRIGHT];
  for (let i = 0; i < 3; i++) {
    const coinY = bottomY - i * stackStep;
    context.fillStyle = shades[i] ?? MAP_COIN_BRIGHT;
    context.strokeStyle = MAP_COIN_STROKE;
    context.lineWidth = 0.8;
    context.beginPath();
    context.ellipse(cx, coinY, coinW / 2, coinH / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  // "G" on top coin
  const topCoinY = bottomY - 2 * stackStep;
  context.fillStyle = MAP_INK;
  context.font = 'bold 7px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('G', cx, topCoinY);
  context.textBaseline = 'alphabetic';
}

/** Recruitment Hall: three small person silhouettes standing side by side. */
function drawRecruitmentIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const positions = [cx - 7, cx, cx + 7];
  const scales = [0.8, 1.0, 0.8];

  for (let i = 0; i < positions.length; i++) {
    const px = positions[i] ?? cx;
    const scale = scales[i] ?? 1;
    const headR = 4 * scale;
    const headY = cy - 6 * scale;
    const bodyH = 10 * scale;

    context.fillStyle = i === 1 ? MAP_BORDER : MAP_FIGURE_SIDE;
    context.strokeStyle = MAP_FIGURE_STROKE;
    context.lineWidth = 0.7;

    // Head
    context.beginPath();
    context.arc(px, headY, headR, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    // Body (rounded rectangle)
    const bodyW = 6 * scale;
    context.beginPath();
    context.rect(px - bodyW / 2, headY + headR + 1, bodyW, bodyH);
    context.fill();
    context.stroke();
  }
}

/** Guild Hall: a heraldic shield with a small emblem. */
function drawGuildHallIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 20;
  const h = 22;
  const top = cy - h / 2;

  // Shield outline
  context.fillStyle = MAP_INK_MEDIUM;
  context.strokeStyle = MAP_INK;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(cx - w / 2, top);
  context.lineTo(cx + w / 2, top);
  context.lineTo(cx + w / 2, top + h * 0.55);
  context.quadraticCurveTo(cx + w / 2, top + h, cx, top + h);
  context.quadraticCurveTo(cx - w / 2, top + h, cx - w / 2, top + h * 0.55);
  context.closePath();
  context.fill();
  context.stroke();

  // Horizontal divider line on shield
  const dividerY = top + h * 0.42;
  context.strokeStyle = MAP_PARCHMENT_CREAM;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(cx - w / 2 + 2, dividerY);
  context.lineTo(cx + w / 2 - 2, dividerY);
  context.stroke();

  // Small sword on the shield
  context.strokeStyle = MAP_PARCHMENT_CREAM;
  context.lineWidth = 1.5;
  const swordTop = top + 3;
  const swordBottom = dividerY - 2;
  context.beginPath();
  context.moveTo(cx, swordTop);
  context.lineTo(cx, swordBottom);
  context.stroke();
  // Crossguard
  context.beginPath();
  context.moveTo(cx - 4, swordTop + (swordBottom - swordTop) * 0.65);
  context.lineTo(cx + 4, swordTop + (swordBottom - swordTop) * 0.65);
  context.stroke();
}

function drawBuildingIcon(
  context: CanvasRenderingContext2D,
  building: VillageBuilding,
  cx: number,
  cy: number,
): void {
  const iconCy = cy + ICON_CENTER_OFFSET_Y;
  switch (building) {
    case 'tavern':
      drawTavernIcon(context, cx, iconCy);
      return;
    case 'store':
      drawStoreIcon(context, cx, iconCy);
      return;
    case 'recruitment':
      drawRecruitmentIcon(context, cx, iconCy);
      return;
    case 'guild_hall':
      drawGuildHallIcon(context, cx, iconCy);
      return;
  }
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  radius: number,
): void {
  const left = cx - width / 2;
  const top = cy - height / 2;
  context.beginPath();
  context.moveTo(left + radius, top);
  context.lineTo(left + width - radius, top);
  context.arcTo(left + width, top, left + width, top + radius, radius);
  context.lineTo(left + width, top + height - radius);
  context.arcTo(left + width, top + height, left + width - radius, top + height, radius);
  context.lineTo(left + radius, top + height);
  context.arcTo(left, top + height, left, top + height - radius, radius);
  context.lineTo(left, top + radius);
  context.arcTo(left, top, left + radius, top, radius);
  context.closePath();
}

function drawPartyMarker(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
): void {
  context.fillStyle = COLOR_PARTY_MARKER;
  context.beginPath();
  context.arc(cx, cy - NODE_HEIGHT / 2 - 11, 6, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(cx, cy - NODE_HEIGHT / 2 - 4);
  context.lineTo(cx - 5, cy - NODE_HEIGHT / 2 + 2);
  context.lineTo(cx + 5, cy - NODE_HEIGHT / 2 + 2);
  context.closePath();
  context.fill();
}

// ── Main render ───────────────────────────────────────────────────────────────

function renderVillageMap(
  canvas: HTMLCanvasElement,
  activeBuilding: VillageBuilding,
  hoveredBuilding: VillageBuilding | undefined,
): void {
  const context = canvas.getContext('2d');
  if (context === null) return;

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = COLOR_BACKGROUND;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.strokeStyle = COLOR_PATH;
  context.lineWidth = 2.5;
  context.setLineDash([8, 5]);
  context.lineDashOffset = 0;
  for (const [fromId, toId] of NODE_PATHS) {
    const from = NODE_CENTERS[fromId];
    const to = NODE_CENTERS[toId];
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }
  context.setLineDash([]);

  for (const building of VILLAGE_BUILDINGS) {
    const center = NODE_CENTERS[building.identifier];
    const isActive = building.identifier === activeBuilding;
    const isHovered = building.identifier === hoveredBuilding;

    drawRoundedRect(context, center.x, center.y, NODE_WIDTH, NODE_HEIGHT, NODE_CORNER_RADIUS);
    context.fillStyle = isActive ? COLOR_NODE_ACTIVE : isHovered ? COLOR_NODE_HOVER : COLOR_NODE_DEFAULT;
    context.fill();
    context.strokeStyle = isActive
      ? COLOR_NODE_BORDER_ACTIVE
      : isHovered
        ? COLOR_NODE_BORDER_HOVER
        : COLOR_NODE_BORDER_DEFAULT;
    context.lineWidth = isActive ? 2 : 1;
    context.stroke();

    drawBuildingIcon(context, building.identifier, center.x, center.y);

    context.textAlign = 'center';
    context.font = 'bold 12px sans-serif';
    context.fillStyle = COLOR_LABEL;
    context.fillText(building.label, center.x, center.y + LABEL_OFFSET_Y);

    context.font = '10px sans-serif';
    context.fillStyle = COLOR_SUBLABEL;
    context.fillText(building.sublabel, center.x, center.y + SUBLABEL_OFFSET_Y);

    if (isActive) {
      drawPartyMarker(context, center.x, center.y);
    }
  }
}

// ── Hit testing ───────────────────────────────────────────────────────────────

function buildingFromCanvasPoint(x: number, y: number): VillageBuilding | undefined {
  for (const building of VILLAGE_BUILDINGS) {
    const center = NODE_CENTERS[building.identifier];
    if (
      Math.abs(x - center.x) <= NODE_WIDTH / 2 &&
      Math.abs(y - center.y) <= NODE_HEIGHT / 2
    ) {
      return building.identifier;
    }
  }
  return undefined;
}

// ── Public factory ────────────────────────────────────────────────────────────

export function createVillageMapCanvas(
  activeBuilding: VillageBuilding,
  sounds: UserInterfaceSounds,
  onBuildingSelected: (building: VillageBuilding) => void,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.className = 'village-map-canvas';
  canvas.style.cursor = 'pointer';

  let hoveredBuilding: VillageBuilding | undefined;

  renderVillageMap(canvas, activeBuilding, hoveredBuilding);

  canvas.addEventListener('mousemove', (event) => {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / bounds.width;
    const scaleY = CANVAS_HEIGHT / bounds.height;
    const canvasX = (event.clientX - bounds.left) * scaleX;
    const canvasY = (event.clientY - bounds.top) * scaleY;
    const hit = buildingFromCanvasPoint(canvasX, canvasY);
    if (hit !== hoveredBuilding) {
      if (hit !== undefined) {
        sounds.playMenuHover();
      }
      hoveredBuilding = hit;
      renderVillageMap(canvas, activeBuilding, hoveredBuilding);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredBuilding = undefined;
    renderVillageMap(canvas, activeBuilding, hoveredBuilding);
  });

  canvas.addEventListener('click', (event) => {
    const bounds = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / bounds.width;
    const scaleY = CANVAS_HEIGHT / bounds.height;
    const canvasX = (event.clientX - bounds.left) * scaleX;
    const canvasY = (event.clientY - bounds.top) * scaleY;
    const hit = buildingFromCanvasPoint(canvasX, canvasY);
    if (hit !== undefined && hit !== activeBuilding) {
      sounds.playMenuConfirm();
      onBuildingSelected(hit);
    }
  });

  return canvas;
}
