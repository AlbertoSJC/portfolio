import { drawUnitMiniature } from '../../render/SpriteRegistry';

const PORTRAIT_WIDTH_PIXELS = 72;
const PORTRAIT_HEIGHT_PIXELS = 84;
/** Where the miniature's feet stand inside the portrait. */
const PORTRAIT_ANCHOR_Y_PIXELS = 70;

/**
 * A small canvas portrait of a guild member, drawn with the same
 * procedural miniature the battlefield uses — so the roster, recruitment
 * hall, and party muster all show the exact figure that will fight.
 */
export function createMemberPortraitCanvas(
  raceDisplayName: string,
  classDisplayName: string,
): HTMLCanvasElement {
  const portraitCanvas = document.createElement('canvas');
  portraitCanvas.width = PORTRAIT_WIDTH_PIXELS;
  portraitCanvas.height = PORTRAIT_HEIGHT_PIXELS;
  portraitCanvas.className = 'member-portrait';
  const drawingContext = portraitCanvas.getContext('2d');
  if (drawingContext !== null) {
    drawUnitMiniature(
      drawingContext,
      { raceLabel: raceDisplayName, classLabel: classDisplayName, team: 'guild' },
      PORTRAIT_WIDTH_PIXELS / 2,
      PORTRAIT_ANCHOR_Y_PIXELS,
    );
  }
  return portraitCanvas;
}
