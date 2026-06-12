import type { Battle } from '../sim/battle/Battle';
import { tileAt } from '../sim/grid/BattleMap';
import type { CardinalDirection, GridPosition } from '../sim/grid/GridPosition';
import { arePositionsEqual, positionKey } from '../sim/grid/GridPosition';
import { isKnockedOut, type Unit } from '../sim/units/Unit';
import {
  HEIGHT_LEVEL_PIXEL_OFFSET,
  TILE_HALF_HEIGHT_PIXELS,
  TILE_HALF_WIDTH_PIXELS,
  gridToScreen,
  screenToGrid,
  type ScreenPoint,
} from './IsometricProjection';
import {
  MINIATURE_HEIGHT_PIXELS,
  drawUnitMiniature,
  fillColorForTerrain,
} from './SpriteRegistry';

const CANVAS_MARGIN_PIXELS = 80;
const HIT_POINT_BAR_WIDTH_PIXELS = 44;
const HIT_POINT_BAR_HEIGHT_PIXELS = 6;
/** Gap between the top of a miniature and its hit-point bar. */
const HIT_POINT_BAR_RAISE_PIXELS = 6;
/** Spotlight ring drawn around a miniature's middle. */
const SPOTLIGHT_RING_RADIUS_PIXELS = 26;
const SPOTLIGHT_RING_CENTER_LIFT_PIXELS = 16;

/** The floor wedge showing which way a unit faces. */
const FACING_WEDGE_TIP_DISTANCE_PIXELS = 34;
const FACING_WEDGE_BASE_DISTANCE_PIXELS = 16;
const FACING_WEDGE_HALF_WIDTH_PIXELS = 11;
const FACING_WEDGE_FILL_COLOR = 'rgba(255, 255, 255, 0.95)';
const FACING_WEDGE_OUTLINE_COLOR = '#111111';

/** The four clickable arrows shown while choosing end-of-turn facing. */
const FACING_CHOOSER_ARROW_CENTER_FRACTION = 0.62;
const FACING_CHOOSER_TIP_EXTENT_PIXELS = 20;
const FACING_CHOOSER_HALF_WIDTH_PIXELS = 13;
const FACING_CHOOSER_ARROW_COLOR = 'rgba(255, 255, 255, 0.85)';
const FACING_CHOOSER_HOVERED_COLOR = '#ffe066';

/** Marker for the unit hovered in the turn-order strip. */
const SPOTLIGHT_COLOR = '#5ff0e0';
const SPOTLIGHT_OUTLINE_WIDTH_PIXELS = 3;

const MOVE_HIGHLIGHT_COLOR = 'rgba(80, 140, 255, 0.45)';
const TARGET_HIGHLIGHT_COLOR = 'rgba(255, 90, 70, 0.45)';
const AREA_PREVIEW_COLOR = 'rgba(255, 60, 40, 0.7)';
const ACTIVE_UNIT_MARKER_COLOR = '#ffe066';
const TILE_OUTLINE_COLOR = 'rgba(0, 0, 0, 0.25)';
const TILE_SIDE_DARKENING = 'rgba(0, 0, 0, 0.35)';

export type TileHighlightKind = 'movement' | 'targeting';

/** Everything the controller wants drawn on top of the battle this frame. */
export interface BattleViewState {
  highlightedTiles: readonly GridPosition[];
  highlightKind: TileHighlightKind | undefined;
  /** Tiles a hovered area skill would hit — drawn stronger than plain targeting. */
  areaPreviewTiles: readonly GridPosition[];
  hoveredTile: GridPosition | undefined;
  /** When set, four clickable facing arrows render around the active unit. */
  facingChooser?: {
    hoveredDirection: CardinalDirection | undefined;
  };
  /** Live preview: draw the active unit facing this way before committing. */
  activeUnitFacingPreview?: CardinalDirection;
  /** Unit hovered in the turn-order strip, marked on the map. */
  spotlightedUnitIdentifier?: string;
}

/**
 * Draws the whole battle onto one canvas every frame. Pure read access to
 * the Battle; all interaction state (highlights) is handed in by the
 * controller.
 */
export class BattleRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly drawingContext: CanvasRenderingContext2D;
  private cameraOffset: ScreenPoint = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const drawingContext = canvas.getContext('2d');
    if (drawingContext === null) {
      throw new Error('Canvas 2D context unavailable');
    }
    this.drawingContext = drawingContext;
  }

  sizeCanvasToMap(battle: Battle): void {
    const mapPixelWidth =
      (battle.map.widthInTiles + battle.map.heightInTiles) * TILE_HALF_WIDTH_PIXELS;
    const mapPixelHeight =
      (battle.map.widthInTiles + battle.map.heightInTiles) * TILE_HALF_HEIGHT_PIXELS;
    this.canvas.width = mapPixelWidth + CANVAS_MARGIN_PIXELS * 2;
    this.canvas.height = mapPixelHeight + CANVAS_MARGIN_PIXELS * 2 + HEIGHT_LEVEL_PIXEL_OFFSET * 2;
    this.cameraOffset = {
      x: battle.map.heightInTiles * TILE_HALF_WIDTH_PIXELS + CANVAS_MARGIN_PIXELS,
      y: CANVAS_MARGIN_PIXELS + HEIGHT_LEVEL_PIXEL_OFFSET * 2,
    };
  }

  canvasPointToGridPosition(canvasX: number, canvasY: number): GridPosition {
    return screenToGrid({
      x: canvasX - this.cameraOffset.x,
      y: canvasY - this.cameraOffset.y,
    });
  }

  render(battle: Battle, viewState: BattleViewState): void {
    this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const highlightedTileKeys = new Set(viewState.highlightedTiles.map(positionKey));
    const areaPreviewTileKeys = new Set(viewState.areaPreviewTiles.map(positionKey));

    // Tiles draw row+column ascending so nearer tiles paint over farther ones.
    for (let row = 0; row < battle.map.heightInTiles; row += 1) {
      for (let column = 0; column < battle.map.widthInTiles; column += 1) {
        const position = { column, row };
        this.drawTile(
          battle,
          position,
          highlightedTileKeys,
          viewState.highlightKind,
          areaPreviewTileKeys,
          viewState.hoveredTile,
        );
      }
    }

    const activeUnit = battle.getActiveUnit();
    const drawableUnits = battle.units
      .filter((unit) => !isKnockedOut(unit))
      .sort(
        (first, second) =>
          first.position.column + first.position.row - (second.position.column + second.position.row),
      );
    for (const unit of drawableUnits) {
      const isActiveUnit = unit.identifier === activeUnit.identifier;
      const facingOverride = isActiveUnit ? viewState.activeUnitFacingPreview : undefined;
      const isSpotlighted = unit.identifier === viewState.spotlightedUnitIdentifier;
      this.drawUnit(battle, unit, isActiveUnit, facingOverride, isSpotlighted);
    }

    if (viewState.facingChooser !== undefined) {
      this.drawFacingChooser(battle, activeUnit.position, viewState.facingChooser.hoveredDirection);
    }
  }

  private tileScreenCenter(battle: Battle, position: GridPosition): ScreenPoint {
    const tile = tileAt(battle.map, position);
    const projected = gridToScreen(position, tile.heightLevel);
    return { x: projected.x + this.cameraOffset.x, y: projected.y + this.cameraOffset.y };
  }

  private traceTileDiamond(center: ScreenPoint): void {
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(center.x, center.y - TILE_HALF_HEIGHT_PIXELS);
    this.drawingContext.lineTo(center.x + TILE_HALF_WIDTH_PIXELS, center.y);
    this.drawingContext.lineTo(center.x, center.y + TILE_HALF_HEIGHT_PIXELS);
    this.drawingContext.lineTo(center.x - TILE_HALF_WIDTH_PIXELS, center.y);
    this.drawingContext.closePath();
  }

  private drawTile(
    battle: Battle,
    position: GridPosition,
    highlightedTileKeys: ReadonlySet<string>,
    highlightKind: TileHighlightKind | undefined,
    areaPreviewTileKeys: ReadonlySet<string>,
    hoveredTile: GridPosition | undefined,
  ): void {
    const tile = tileAt(battle.map, position);
    const center = this.tileScreenCenter(battle, position);

    // Raised tiles get a darker "cliff side" below the floor diamond.
    if (tile.heightLevel > 0) {
      const cliffDepth = tile.heightLevel * HEIGHT_LEVEL_PIXEL_OFFSET;
      this.drawingContext.fillStyle = TILE_SIDE_DARKENING;
      this.drawingContext.beginPath();
      this.drawingContext.moveTo(center.x - TILE_HALF_WIDTH_PIXELS, center.y);
      this.drawingContext.lineTo(center.x, center.y + TILE_HALF_HEIGHT_PIXELS);
      this.drawingContext.lineTo(center.x + TILE_HALF_WIDTH_PIXELS, center.y);
      this.drawingContext.lineTo(center.x + TILE_HALF_WIDTH_PIXELS, center.y + cliffDepth);
      this.drawingContext.lineTo(center.x, center.y + TILE_HALF_HEIGHT_PIXELS + cliffDepth);
      this.drawingContext.lineTo(center.x - TILE_HALF_WIDTH_PIXELS, center.y + cliffDepth);
      this.drawingContext.closePath();
      this.drawingContext.fill();
    }

    this.traceTileDiamond(center);
    this.drawingContext.fillStyle = fillColorForTerrain(tile.terrain);
    this.drawingContext.fill();
    this.drawingContext.strokeStyle = TILE_OUTLINE_COLOR;
    this.drawingContext.stroke();

    if (highlightedTileKeys.has(positionKey(position)) && highlightKind !== undefined) {
      this.traceTileDiamond(center);
      this.drawingContext.fillStyle =
        highlightKind === 'movement' ? MOVE_HIGHLIGHT_COLOR : TARGET_HIGHLIGHT_COLOR;
      this.drawingContext.fill();
    }

    if (areaPreviewTileKeys.has(positionKey(position))) {
      this.traceTileDiamond(center);
      this.drawingContext.fillStyle = AREA_PREVIEW_COLOR;
      this.drawingContext.fill();
    }

    if (hoveredTile !== undefined && arePositionsEqual(position, hoveredTile)) {
      this.traceTileDiamond(center);
      this.drawingContext.lineWidth = 2;
      this.drawingContext.strokeStyle = '#ffffff';
      this.drawingContext.stroke();
      this.drawingContext.lineWidth = 1;
    }
  }

  /** Normalized screen-space direction of each cardinal in the isometric projection. */
  private screenDirectionVector(facing: CardinalDirection): ScreenPoint {
    const screenDirections: Record<CardinalDirection, ScreenPoint> = {
      north: { x: TILE_HALF_WIDTH_PIXELS, y: -TILE_HALF_HEIGHT_PIXELS },
      south: { x: -TILE_HALF_WIDTH_PIXELS, y: TILE_HALF_HEIGHT_PIXELS },
      east: { x: TILE_HALF_WIDTH_PIXELS, y: TILE_HALF_HEIGHT_PIXELS },
      west: { x: -TILE_HALF_WIDTH_PIXELS, y: -TILE_HALF_HEIGHT_PIXELS },
    };
    const direction = screenDirections[facing];
    const length = Math.hypot(direction.x, direction.y);
    return { x: direction.x / length, y: direction.y / length };
  }

  private traceWedge(
    tileCenter: ScreenPoint,
    facing: CardinalDirection,
    tipDistancePixels: number,
    baseDistancePixels: number,
    halfWidthPixels: number,
  ): void {
    const direction = this.screenDirectionVector(facing);
    const perpendicular = { x: -direction.y, y: direction.x };
    const tip = {
      x: tileCenter.x + direction.x * tipDistancePixels,
      y: tileCenter.y + direction.y * tipDistancePixels,
    };
    const baseCenter = {
      x: tileCenter.x + direction.x * baseDistancePixels,
      y: tileCenter.y + direction.y * baseDistancePixels,
    };
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(tip.x, tip.y);
    this.drawingContext.lineTo(
      baseCenter.x + perpendicular.x * halfWidthPixels,
      baseCenter.y + perpendicular.y * halfWidthPixels,
    );
    this.drawingContext.lineTo(
      baseCenter.x - perpendicular.x * halfWidthPixels,
      baseCenter.y - perpendicular.y * halfWidthPixels,
    );
    this.drawingContext.closePath();
  }

  /** Four clickable arrows around the active unit while choosing end-of-turn facing. */
  private drawFacingChooser(
    battle: Battle,
    unitPosition: GridPosition,
    hoveredDirection: CardinalDirection | undefined,
  ): void {
    const tileCenter = this.tileScreenCenter(battle, unitPosition);
    const distanceToNeighborCenter = Math.hypot(TILE_HALF_WIDTH_PIXELS, TILE_HALF_HEIGHT_PIXELS) * 2;
    const arrowBaseDistance = distanceToNeighborCenter * FACING_CHOOSER_ARROW_CENTER_FRACTION;
    for (const direction of ['north', 'east', 'south', 'west'] as const) {
      const isHovered = direction === hoveredDirection;
      this.traceWedge(
        tileCenter,
        direction,
        arrowBaseDistance + FACING_CHOOSER_TIP_EXTENT_PIXELS,
        arrowBaseDistance - FACING_CHOOSER_TIP_EXTENT_PIXELS,
        FACING_CHOOSER_HALF_WIDTH_PIXELS * (isHovered ? 1.3 : 1),
      );
      this.drawingContext.fillStyle = isHovered
        ? FACING_CHOOSER_HOVERED_COLOR
        : FACING_CHOOSER_ARROW_COLOR;
      this.drawingContext.fill();
      this.drawingContext.strokeStyle = FACING_WEDGE_OUTLINE_COLOR;
      this.drawingContext.lineWidth = 2;
      this.drawingContext.stroke();
      this.drawingContext.lineWidth = 1;
    }
  }

  private drawUnit(
    battle: Battle,
    unit: Unit,
    isActiveUnit: boolean,
    facingOverride: CardinalDirection | undefined,
    isSpotlighted: boolean,
  ): void {
    const center = this.tileScreenCenter(battle, unit.position);

    if (isActiveUnit) {
      this.traceTileDiamond(center);
      this.drawingContext.lineWidth = 2;
      this.drawingContext.strokeStyle = ACTIVE_UNIT_MARKER_COLOR;
      this.drawingContext.stroke();
      this.drawingContext.lineWidth = 1;
    }

    if (isSpotlighted) {
      // Tile outline plus a ring over the figure so the unit pops out of the crowd.
      this.traceTileDiamond(center);
      this.drawingContext.lineWidth = SPOTLIGHT_OUTLINE_WIDTH_PIXELS;
      this.drawingContext.strokeStyle = SPOTLIGHT_COLOR;
      this.drawingContext.stroke();
      this.drawingContext.beginPath();
      this.drawingContext.arc(
        center.x,
        center.y - SPOTLIGHT_RING_CENTER_LIFT_PIXELS,
        SPOTLIGHT_RING_RADIUS_PIXELS,
        0,
        Math.PI * 2,
      );
      this.drawingContext.stroke();
      this.drawingContext.lineWidth = 1;
    }

    // Facing wedge on the tile floor, pointing where the unit looks.
    const facingShown = facingOverride ?? unit.facing;
    this.traceWedge(
      center,
      facingShown,
      FACING_WEDGE_TIP_DISTANCE_PIXELS,
      FACING_WEDGE_BASE_DISTANCE_PIXELS,
      FACING_WEDGE_HALF_WIDTH_PIXELS,
    );
    this.drawingContext.fillStyle = FACING_WEDGE_FILL_COLOR;
    this.drawingContext.fill();
    this.drawingContext.strokeStyle = FACING_WEDGE_OUTLINE_COLOR;
    this.drawingContext.stroke();

    // The miniature itself — race silhouette, class item, team base plate.
    drawUnitMiniature(
      this.drawingContext,
      { raceLabel: unit.raceLabel, classLabel: unit.classLabel, team: unit.team },
      center.x,
      center.y,
    );

    // Hit point bar above the miniature.
    const hitPointFraction = unit.currentHitPoints / unit.baseStatistics.hitPointsMaximum;
    const barLeft = center.x - HIT_POINT_BAR_WIDTH_PIXELS / 2;
    const barTop = center.y - MINIATURE_HEIGHT_PIXELS - HIT_POINT_BAR_RAISE_PIXELS;
    this.drawingContext.fillStyle = '#222222';
    this.drawingContext.fillRect(
      barLeft,
      barTop,
      HIT_POINT_BAR_WIDTH_PIXELS,
      HIT_POINT_BAR_HEIGHT_PIXELS,
    );
    this.drawingContext.fillStyle = hitPointFraction > 0.4 ? '#4caf50' : '#e53935';
    this.drawingContext.fillRect(
      barLeft,
      barTop,
      HIT_POINT_BAR_WIDTH_PIXELS * hitPointFraction,
      HIT_POINT_BAR_HEIGHT_PIXELS,
    );
  }
}
