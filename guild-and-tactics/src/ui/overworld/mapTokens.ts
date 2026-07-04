import { MAP_INK, MAP_MARKER, MAP_PARCHMENT } from '../mapPalette';

export const TOKEN_SIZE = 32;
export const TOKEN_CORNER_OFFSET_X = 40;
export const TOKEN_CORNER_OFFSET_Y = -24;

/** How many bob cycles a walking token makes per road segment, and how tall each bob is. */
const WALK_BOB_CYCLES_PER_SEGMENT = 2;
const WALK_BOB_HEIGHT_PIXELS = 1.5;

/**
 * Where a walking token is drawn part-way along a road segment: linearly
 * along the road, easing off its resting corner offset onto the road
 * mid-segment (and back at each stop), with a light walking bob.
 */
export function walkingTokenPoint(
  fromCenter: { x: number; y: number },
  toCenter: { x: number; y: number },
  progress: number,
  restingOffsetX: number,
  restingOffsetY: number,
): { x: number; y: number } {
  const roadX = fromCenter.x + (toCenter.x - fromCenter.x) * progress;
  const roadY = fromCenter.y + (toCenter.y - fromCenter.y) * progress;
  const restingOffsetScale = 1 - Math.sin(Math.PI * progress);
  const walkingBob = Math.sin(progress * Math.PI * 2 * WALK_BOB_CYCLES_PER_SEGMENT) * WALK_BOB_HEIGHT_PIXELS;
  return {
    x: roadX + restingOffsetX * restingOffsetScale,
    y: roadY + restingOffsetY * restingOffsetScale + walkingBob,
  };
}

/** A roaming group's marker — same two-eyed blot as the old exploration grid, just sized for a node badge. */
export function drawMonsterIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const radius = TOKEN_SIZE * 0.26;
  context.fillStyle = MAP_INK;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = MAP_PARCHMENT;
  context.beginPath();
  context.arc(cx - radius * 0.4, cy - radius * 0.15, radius * 0.18, 0, Math.PI * 2);
  context.arc(cx + radius * 0.4, cy - radius * 0.15, radius * 0.18, 0, Math.PI * 2);
  context.fill();
}

/** The guild's marker — a head-and-cloak token, used on zone road maps and the World Map alike. */
export function drawPlayerToken(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  context.fillStyle = MAP_MARKER;
  context.beginPath();
  context.arc(cx, cy - TOKEN_SIZE * 0.08, TOKEN_SIZE * 0.22, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(cx, cy - TOKEN_SIZE * 0.02);
  context.lineTo(cx - TOKEN_SIZE * 0.18, cy + TOKEN_SIZE * 0.28);
  context.lineTo(cx + TOKEN_SIZE * 0.18, cy + TOKEN_SIZE * 0.28);
  context.closePath();
  context.fill();
}
