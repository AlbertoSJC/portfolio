import type { GridPosition } from '../sim/grid/GridPosition';

/** Half-dimensions of one floor diamond in screen pixels. */
export const TILE_HALF_WIDTH_PIXELS = 52;
export const TILE_HALF_HEIGHT_PIXELS = 26;
/** Vertical pixel offset per map height level. */
export const HEIGHT_LEVEL_PIXEL_OFFSET = 20;

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Center of a tile's floor diamond, before the camera offset. */
export function gridToScreen(position: GridPosition, heightLevel: number): ScreenPoint {
  return {
    x: (position.column - position.row) * TILE_HALF_WIDTH_PIXELS,
    y:
      (position.column + position.row) * TILE_HALF_HEIGHT_PIXELS -
      heightLevel * HEIGHT_LEVEL_PIXEL_OFFSET,
  };
}

/**
 * Inverse projection ignoring height (callers test candidate tiles around
 * the result to resolve raised terrain).
 */
export function screenToGrid(screenPoint: ScreenPoint): GridPosition {
  const halfSum = screenPoint.y / TILE_HALF_HEIGHT_PIXELS;
  const halfDifference = screenPoint.x / TILE_HALF_WIDTH_PIXELS;
  return {
    column: Math.round((halfSum + halfDifference) / 2),
    row: Math.round((halfSum - halfDifference) / 2),
  };
}

/** Painter's-algorithm sort key: tiles farther down-right draw later (on top). */
export function drawOrderKey(position: GridPosition): number {
  return position.column + position.row;
}
