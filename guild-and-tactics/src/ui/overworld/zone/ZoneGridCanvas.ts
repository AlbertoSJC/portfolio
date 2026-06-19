import type { GridPosition } from '../../../sim/grid/GridPosition';
import type { ZoneDefinition } from '../../../sim/guild/ZoneDefinition';
import type { ZoneRoamingGroupPosition } from '../../../sim/guild/ZoneSession';
import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { drawMapVignette } from '../../mapVignette';
import {
  MAP_BORDER,
  MAP_INK,
  MAP_INK_MEDIUM,
  MAP_MARKER,
  MAP_PARCHMENT,
  MAP_PARCHMENT_CREAM,
  MAP_PARCHMENT_LIGHT,
  MAP_WOOD_DARK,
} from '../../mapPalette';

const OBSTACLE_COLOR = '#5a4830';
const MONSTER_COLOR = MAP_INK;
const MINIMUM_CELL_SIZE = 12;

interface GridLayout {
  cellSize: number;
  offsetX: number;
  offsetY: number;
}

/** Largest square cell size that fits the whole grid inside the canvas, grid centered. */
function computeGridLayout(zone: ZoneDefinition, canvasWidth: number, canvasHeight: number): GridLayout {
  const cellSize = Math.max(
    MINIMUM_CELL_SIZE,
    Math.min(canvasWidth / zone.explorationGridWidth, canvasHeight / zone.explorationGridHeight),
  );
  const offsetX = (canvasWidth - cellSize * zone.explorationGridWidth) / 2;
  const offsetY = (canvasHeight - cellSize * zone.explorationGridHeight) / 2;
  return { cellSize, offsetX, offsetY };
}

function cellTopLeft(position: GridPosition, layout: GridLayout): { x: number; y: number } {
  return {
    x: layout.offsetX + position.column * layout.cellSize,
    y: layout.offsetY + position.row * layout.cellSize,
  };
}

function drawTavernIcon(context: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number): void {
  const w = cellSize * 0.5;
  const wallH = cellSize * 0.3;
  const roofH = cellSize * 0.24;
  const wallTop = cy - wallH / 2 + cellSize * 0.07;

  context.fillStyle = MAP_PARCHMENT_CREAM;
  context.strokeStyle = MAP_WOOD_DARK;
  context.lineWidth = 1;
  context.beginPath();
  context.rect(cx - w / 2, wallTop, w, wallH);
  context.fill();
  context.stroke();

  context.fillStyle = MAP_INK_MEDIUM;
  context.beginPath();
  context.moveTo(cx - w / 2 - cellSize * 0.07, wallTop);
  context.lineTo(cx, wallTop - roofH);
  context.lineTo(cx + w / 2 + cellSize * 0.07, wallTop);
  context.closePath();
  context.fill();
  context.stroke();
}

function drawMonsterIcon(context: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number): void {
  const radius = cellSize * 0.26;
  context.fillStyle = MONSTER_COLOR;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  // Two small eyes so it reads as a creature, not a generic blot.
  context.fillStyle = MAP_PARCHMENT;
  context.beginPath();
  context.arc(cx - radius * 0.4, cy - radius * 0.15, radius * 0.18, 0, Math.PI * 2);
  context.arc(cx + radius * 0.4, cy - radius * 0.15, radius * 0.18, 0, Math.PI * 2);
  context.fill();
}

function drawPlayerToken(context: CanvasRenderingContext2D, cx: number, cy: number, cellSize: number): void {
  context.fillStyle = MAP_MARKER;
  context.beginPath();
  context.arc(cx, cy - cellSize * 0.08, cellSize * 0.22, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(cx, cy - cellSize * 0.02);
  context.lineTo(cx - cellSize * 0.18, cy + cellSize * 0.28);
  context.lineTo(cx + cellSize * 0.18, cy + cellSize * 0.28);
  context.closePath();
  context.fill();
}

/** Redraws the whole grid for the current state — cheap enough to call on every step. */
export function renderZoneGrid(
  canvas: HTMLCanvasElement,
  zone: ZoneDefinition,
  playerPosition: GridPosition,
  activeRoamingGroupPositions: readonly ZoneRoamingGroupPosition[],
): void {
  const context = canvas.getContext('2d');
  if (context === null) return;
  const layout = computeGridLayout(zone, canvas.width, canvas.height);
  const { cellSize } = layout;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = MAP_PARCHMENT;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const obstacleKeys = new Set(zone.obstacleTiles.map((tile) => `${tile.column},${tile.row}`));
  for (let row = 0; row < zone.explorationGridHeight; row += 1) {
    for (let column = 0; column < zone.explorationGridWidth; column += 1) {
      const { x, y } = cellTopLeft({ column, row }, layout);
      const isObstacle = obstacleKeys.has(`${column},${row}`);
      context.fillStyle = isObstacle ? OBSTACLE_COLOR : MAP_PARCHMENT_LIGHT;
      context.fillRect(x, y, cellSize, cellSize);
      context.strokeStyle = MAP_BORDER;
      context.lineWidth = 1;
      context.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
    }
  }

  const tavernTopLeft = cellTopLeft(zone.tavernTile, layout);
  drawTavernIcon(context, tavernTopLeft.x + cellSize / 2, tavernTopLeft.y + cellSize / 2, cellSize);

  for (const group of activeRoamingGroupPositions) {
    const topLeft = cellTopLeft(group.position, layout);
    drawMonsterIcon(context, topLeft.x + cellSize / 2, topLeft.y + cellSize / 2, cellSize);
  }

  const playerTopLeft = cellTopLeft(playerPosition, layout);
  drawPlayerToken(context, playerTopLeft.x + cellSize / 2, playerTopLeft.y + cellSize / 2, cellSize);

  drawMapVignette(context, canvas.width, canvas.height);
}

function cellFromCanvasPoint(zone: ZoneDefinition, layout: GridLayout, x: number, y: number): GridPosition | undefined {
  const column = Math.floor((x - layout.offsetX) / layout.cellSize);
  const row = Math.floor((y - layout.offsetY) / layout.cellSize);
  if (column < 0 || column >= zone.explorationGridWidth || row < 0 || row >= zone.explorationGridHeight) {
    return undefined;
  }
  return { column, row };
}

/**
 * Creates a full-bleed canvas (tracks its container's rendered size via
 * ResizeObserver, like OverworldMapCanvas) showing the given state, and
 * wires clicks to `onCellClicked`. No hover highlight: ZoneScreen rebuilds
 * its whole DOM (a fresh canvas included) on every render — every
 * exploration step recreates this with fresh state — so a per-mousemove
 * rebuild would be wasteful; `cursor: pointer` already signals "this is
 * clickable." A resize re-renders with the *same* state this canvas was
 * created with, which is exactly right since a new one replaces it on the
 * next step anyway.
 */
export function createZoneGridCanvas(
  zone: ZoneDefinition,
  playerPosition: GridPosition,
  activeRoamingGroupPositions: readonly ZoneRoamingGroupPosition[],
  sounds: UserInterfaceSounds,
  onCellClicked: (position: GridPosition) => void,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = 'zone-grid-canvas';
  canvas.style.cursor = 'pointer';

  function resizeAndRedraw(): void {
    const width = Math.round(canvas.clientWidth);
    const height = Math.round(canvas.clientHeight);
    if (width === 0 || height === 0) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderZoneGrid(canvas, zone, playerPosition, activeRoamingGroupPositions);
  }

  const resizeObserver = new ResizeObserver(resizeAndRedraw);
  resizeObserver.observe(canvas);

  canvas.addEventListener('click', (event) => {
    const bounds = canvas.getBoundingClientRect();
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    const layout = computeGridLayout(zone, canvas.width, canvas.height);
    const hit = cellFromCanvasPoint(zone, layout, point.x, point.y);
    if (hit !== undefined) {
      sounds.playMenuConfirm();
      onCellClicked(hit);
    }
  });

  return canvas;
}
