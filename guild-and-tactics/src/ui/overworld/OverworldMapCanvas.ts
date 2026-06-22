import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import { drawMapVignette } from '../mapVignette';
import {
  MAP_BORDER,
  MAP_BORDER_HOVER,
  MAP_COIN_BRIGHT,
  MAP_COIN_DARK,
  MAP_COIN_MID,
  MAP_COIN_STROKE,
  MAP_INK,
  MAP_INK_LIGHT,
  MAP_INK_MEDIUM,
  MAP_PARCHMENT,
  MAP_PARCHMENT_CREAM,
  MAP_PARCHMENT_HOVER,
  MAP_PARCHMENT_LIGHT,
  MAP_WOOD,
  MAP_WOOD_DARK,
  MAP_WOOD_PIN,
} from '../mapPalette';

/**
 * `'zone'` — a road/landmark on the World Map. `'tavern'`/`'store'`/
 * `'guild'` — a building on a zone's Town screen. `'landmark'` — a plain
 * waypoint on a zone's interior road map. One canvas serves all three:
 * the World Map, Town, and a zone's road map are the same "click a node on
 * a map" interaction at different scales.
 */
export type MapNodeKind = 'zone' | 'tavern' | 'store' | 'guild' | 'landmark';

export interface MapNodeEntry {
  identifier: string;
  label: string;
  sublabel: string;
  kind: MapNodeKind;
  /** Normalized (0..1, 0..1) layout position. Omit to auto-distribute in a horizontal row (World Map/Town behavior). */
  position?: { x: number; y: number };
}

/** An explicit connection drawn between two nodes. Omit entirely to fall back to connecting consecutive array entries. */
export interface MapEdge {
  fromNodeIdentifier: string;
  toNodeIdentifier: string;
}

const NODE_WIDTH = 116;
const NODE_HEIGHT = 72;
const NODE_CORNER_RADIUS = 7;
const NODE_HORIZONTAL_MARGIN_FRACTION = 0.12;
const NODE_HORIZONTAL_MARGIN_MAX = 160;
const NODE_VERTICAL_MARGIN_FRACTION = 0.18;
const NODE_VERTICAL_MARGIN_MAX = 120;

const ICON_CENTER_OFFSET_Y = -16;
const LABEL_OFFSET_Y = 8;
const SUBLABEL_OFFSET_Y = 21;

const COLOR_BACKGROUND = MAP_PARCHMENT;
const COLOR_PATH = MAP_INK_MEDIUM;
const COLOR_NODE_DEFAULT = MAP_PARCHMENT_LIGHT;
const COLOR_NODE_HOVER = MAP_PARCHMENT_HOVER;
const COLOR_NODE_BORDER_DEFAULT = MAP_BORDER;
const COLOR_NODE_BORDER_HOVER = MAP_BORDER_HOVER;
const COLOR_LABEL = MAP_INK;
const COLOR_SUBLABEL = MAP_INK_LIGHT;

/**
 * If every node carries an explicit `position`, maps those normalized
 * (0..1, 0..1) coordinates onto the canvas. Otherwise distributes nodes
 * evenly across the canvas's current width, vertically centered — the
 * exact behavior the World Map and Town screen rely on.
 */
function nodeCenters(
  nodes: readonly MapNodeEntry[],
  canvasWidth: number,
  canvasHeight: number,
): Map<string, { x: number; y: number }> {
  const centers = new Map<string, { x: number; y: number }>();

  if (nodes.length > 0 && nodes.every((node) => node.position !== undefined)) {
    const marginX = Math.min(NODE_HORIZONTAL_MARGIN_MAX, canvasWidth * NODE_HORIZONTAL_MARGIN_FRACTION);
    const marginY = Math.min(NODE_VERTICAL_MARGIN_MAX, canvasHeight * NODE_VERTICAL_MARGIN_FRACTION);
    const usableWidth = Math.max(canvasWidth - marginX * 2, 0);
    const usableHeight = Math.max(canvasHeight - marginY * 2, 0);
    for (const node of nodes) {
      const position = node.position;
      if (position === undefined) continue;
      centers.set(node.identifier, {
        x: marginX + position.x * usableWidth,
        y: marginY + position.y * usableHeight,
      });
    }
    return centers;
  }

  const margin = Math.min(NODE_HORIZONTAL_MARGIN_MAX, canvasWidth * NODE_HORIZONTAL_MARGIN_FRACTION);
  const usableWidth = Math.max(canvasWidth - margin * 2, NODE_WIDTH);
  const step = nodes.length > 1 ? usableWidth / (nodes.length - 1) : 0;
  nodes.forEach((node, index) => {
    const x = nodes.length === 1 ? canvasWidth / 2 : margin + index * step;
    centers.set(node.identifier, { x, y: canvasHeight / 2 });
  });
  return centers;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

/** A zone node: a small roofed waypoint marker. */
function drawZoneIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 22;
  const wallH = 12;
  const roofH = 10;
  const wallTop = cy - wallH / 2 + 3;

  context.fillStyle = MAP_PARCHMENT_CREAM;
  context.strokeStyle = MAP_WOOD_DARK;
  context.lineWidth = 1;
  context.beginPath();
  context.rect(cx - w / 2, wallTop, w, wallH);
  context.fill();
  context.stroke();

  context.fillStyle = MAP_INK_MEDIUM;
  context.beginPath();
  context.moveTo(cx - w / 2 - 3, wallTop);
  context.lineTo(cx, wallTop - roofH);
  context.lineTo(cx + w / 2 + 3, wallTop);
  context.closePath();
  context.fill();
  context.stroke();
}

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

  context.strokeStyle = MAP_PARCHMENT_CREAM;
  context.lineWidth = 1.2;
  for (let row = 0; row < 3; row += 1) {
    const lineY = top + 4 + row * 5.5;
    context.beginPath();
    context.moveTo(left + 2.5, lineY);
    context.lineTo(left + w - 2.5, lineY);
    context.stroke();
  }

  context.fillStyle = MAP_WOOD_PIN;
  context.beginPath();
  context.arc(cx, top, 2.5, 0, Math.PI * 2);
  context.fill();
}

/** Store: a stack of three coins viewed edge-on. */
function drawStoreIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const coinWidth = 20;
  const coinHeight = 7;
  const stackStep = 5;
  const bottomY = cy + 8;

  const shades = [MAP_COIN_DARK, MAP_COIN_MID, MAP_COIN_BRIGHT];
  for (let coinIndex = 0; coinIndex < 3; coinIndex += 1) {
    const coinY = bottomY - coinIndex * stackStep;
    context.fillStyle = shades[coinIndex] ?? MAP_COIN_BRIGHT;
    context.strokeStyle = MAP_COIN_STROKE;
    context.lineWidth = 0.8;
    context.beginPath();
    context.ellipse(cx, coinY, coinWidth / 2, coinHeight / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  const topCoinY = bottomY - 2 * stackStep;
  context.fillStyle = MAP_INK;
  context.font = 'bold 7px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('G', cx, topCoinY);
  context.textBaseline = 'alphabetic';
}

/** Guild Hall: a heraldic shield with a small sword emblem. */
function drawGuildHallIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const w = 20;
  const h = 22;
  const top = cy - h / 2;

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

  const dividerY = top + h * 0.42;
  context.strokeStyle = MAP_PARCHMENT_CREAM;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(cx - w / 2 + 2, dividerY);
  context.lineTo(cx + w / 2 - 2, dividerY);
  context.stroke();

  context.strokeStyle = MAP_PARCHMENT_CREAM;
  context.lineWidth = 1.5;
  const swordTop = top + 3;
  const swordBottom = dividerY - 2;
  context.beginPath();
  context.moveTo(cx, swordTop);
  context.lineTo(cx, swordBottom);
  context.stroke();
  context.beginPath();
  context.moveTo(cx - 4, swordTop + (swordBottom - swordTop) * 0.65);
  context.lineTo(cx + 4, swordTop + (swordBottom - swordTop) * 0.65);
  context.stroke();
}

/** Landmark: a way-marker post with a small sign board, for a plain stop on a zone's road map. */
function drawLandmarkIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const postWidth = 4;
  const postHeight = 20;
  const postTop = cy - postHeight / 2 + 4;
  const signWidth = 16;
  const signHeight = 8;

  context.fillStyle = MAP_WOOD_DARK;
  context.fillRect(cx - postWidth / 2, postTop, postWidth, postHeight);

  context.fillStyle = MAP_PARCHMENT_CREAM;
  context.strokeStyle = MAP_WOOD_DARK;
  context.lineWidth = 1;
  context.beginPath();
  context.rect(cx - signWidth / 2, postTop - signHeight + 2, signWidth, signHeight);
  context.fill();
  context.stroke();
}

function drawNodeIcon(context: CanvasRenderingContext2D, kind: MapNodeKind, cx: number, cy: number): void {
  switch (kind) {
    case 'zone':
      drawZoneIcon(context, cx, cy);
      return;
    case 'tavern':
      drawTavernIcon(context, cx, cy);
      return;
    case 'store':
      drawStoreIcon(context, cx, cy);
      return;
    case 'guild':
      drawGuildHallIcon(context, cx, cy);
      return;
    case 'landmark':
      drawLandmarkIcon(context, cx, cy);
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

// ── Main render ───────────────────────────────────────────────────────────────

function renderNodeMap(
  canvas: HTMLCanvasElement,
  nodes: readonly MapNodeEntry[],
  hoveredNodeIdentifier: string | undefined,
  edges: readonly MapEdge[] | undefined,
  afterRender: ((context: CanvasRenderingContext2D, centers: Map<string, { x: number; y: number }>) => void) | undefined,
): void {
  const context = canvas.getContext('2d');
  if (context === null) return;
  const centers = nodeCenters(nodes, canvas.width, canvas.height);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = COLOR_BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = COLOR_PATH;
  context.lineWidth = 2.5;
  context.setLineDash([8, 5]);
  if (edges !== undefined) {
    for (const edge of edges) {
      const from = centers.get(edge.fromNodeIdentifier);
      const to = centers.get(edge.toNodeIdentifier);
      if (from === undefined || to === undefined) continue;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }
  } else {
    for (let nodeIndex = 0; nodeIndex < nodes.length - 1; nodeIndex += 1) {
      const from = centers.get(nodes[nodeIndex]?.identifier ?? '');
      const to = centers.get(nodes[nodeIndex + 1]?.identifier ?? '');
      if (from === undefined || to === undefined) continue;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }
  }
  context.setLineDash([]);

  for (const node of nodes) {
    const center = centers.get(node.identifier);
    if (center === undefined) continue;
    const isHovered = node.identifier === hoveredNodeIdentifier;

    drawRoundedRect(context, center.x, center.y, NODE_WIDTH, NODE_HEIGHT, NODE_CORNER_RADIUS);
    context.fillStyle = isHovered ? COLOR_NODE_HOVER : COLOR_NODE_DEFAULT;
    context.fill();
    context.strokeStyle = isHovered ? COLOR_NODE_BORDER_HOVER : COLOR_NODE_BORDER_DEFAULT;
    context.lineWidth = 1;
    context.stroke();

    drawNodeIcon(context, node.kind, center.x, center.y + ICON_CENTER_OFFSET_Y);

    context.textAlign = 'center';
    context.font = 'bold 12px sans-serif';
    context.fillStyle = COLOR_LABEL;
    context.fillText(node.label, center.x, center.y + LABEL_OFFSET_Y);

    context.font = '10px sans-serif';
    context.fillStyle = COLOR_SUBLABEL;
    context.fillText(node.sublabel, center.x, center.y + SUBLABEL_OFFSET_Y);
  }

  drawMapVignette(context, canvas.width, canvas.height);
  afterRender?.(context, centers);
}

// ── Hit testing ───────────────────────────────────────────────────────────────

function nodeFromCanvasPoint(
  nodes: readonly MapNodeEntry[],
  centers: Map<string, { x: number; y: number }>,
  x: number,
  y: number,
): string | undefined {
  for (const node of nodes) {
    const center = centers.get(node.identifier);
    if (center === undefined) continue;
    if (Math.abs(x - center.x) <= NODE_WIDTH / 2 && Math.abs(y - center.y) <= NODE_HEIGHT / 2) {
      return node.identifier;
    }
  }
  return undefined;
}

// ── Public factory ────────────────────────────────────────────────────────────

/**
 * A full-bleed node-graph map: the canvas tracks its container's rendered
 * size (via ResizeObserver) instead of an intrinsic pixel size, so it fills
 * the screen on any viewport — the World Map, a zone's Town screen, and a
 * zone's interior road map all use this, just with a different node
 * list/kind. `edges` draws explicit connections (defaults to connecting
 * consecutive array entries, the World Map/Town behavior) and `afterRender`
 * lets a caller layer extra markers on top (e.g. roaming-group/player
 * tokens) without this generic renderer knowing anything about them.
 */
export function createOverworldMapCanvas(
  nodes: readonly MapNodeEntry[],
  sounds: UserInterfaceSounds,
  onNodeSelected: (identifier: string) => void,
  edges?: readonly MapEdge[],
  afterRender?: (context: CanvasRenderingContext2D, centers: Map<string, { x: number; y: number }>) => void,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = 'overworld-map-canvas';
  canvas.style.cursor = 'pointer';

  let hoveredNodeIdentifier: string | undefined;

  function resizeAndRender(): void {
    const width = Math.round(canvas.clientWidth);
    const height = Math.round(canvas.clientHeight);
    if (width === 0 || height === 0) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderNodeMap(canvas, nodes, hoveredNodeIdentifier, edges, afterRender);
  }

  const resizeObserver = new ResizeObserver(resizeAndRender);
  resizeObserver.observe(canvas);

  function canvasPointFromEvent(event: MouseEvent): { x: number; y: number } {
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  canvas.addEventListener('mousemove', (event) => {
    const point = canvasPointFromEvent(event);
    const centers = nodeCenters(nodes, canvas.width, canvas.height);
    const hit = nodeFromCanvasPoint(nodes, centers, point.x, point.y);
    if (hit !== hoveredNodeIdentifier) {
      if (hit !== undefined) {
        sounds.playMenuHover();
      }
      hoveredNodeIdentifier = hit;
      renderNodeMap(canvas, nodes, hoveredNodeIdentifier, edges, afterRender);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredNodeIdentifier = undefined;
    renderNodeMap(canvas, nodes, hoveredNodeIdentifier, edges, afterRender);
  });

  canvas.addEventListener('click', (event) => {
    const point = canvasPointFromEvent(event);
    const centers = nodeCenters(nodes, canvas.width, canvas.height);
    const hit = nodeFromCanvasPoint(nodes, centers, point.x, point.y);
    if (hit !== undefined) {
      sounds.playMenuConfirm();
      onNodeSelected(hit);
    }
  });

  return canvas;
}
