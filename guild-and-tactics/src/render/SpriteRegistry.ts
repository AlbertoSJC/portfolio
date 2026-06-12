/**
 * The single place that maps game identity (race/class/team) to visuals
 * (PRD §9 — art is a swappable skin; replacing these procedural miniatures
 * with real sprites later means changing only this module).
 *
 * M1+ placeholders: small vector "board-game miniatures" drawn on canvas.
 * Race = body silhouette, class = held item, team = base plate color, so
 * any unit reads at one glance with zero asset files.
 */

export interface UnitAppearanceDescriptor {
  raceLabel: string;
  classLabel: string;
  team: string;
}

// ── Palette ─────────────────────────────────────────────────────────────

const RACE_BODY_COLORS: Record<string, string> = {
  Human: '#caa472',
  Werecat: '#8e6fae',
  Werelizard: '#5e9456',
  Undead: '#9aa7b0',
  Feryan: '#d28f4a',
};
const FALLBACK_BODY_COLOR = '#888888';

const TEAM_BASE_PLATE_COLORS: Record<string, string> = {
  guild: '#3f7fd4',
  enemy: '#c03b3b',
};

const FIGURE_OUTLINE_COLOR = '#15181e';
const SKULL_FACE_COLOR = '#e3e9ec';
const WING_COLOR = '#ece5d3';
const BLADE_COLOR = '#dde3e8';
const GUARD_AND_CROSS_COLOR = '#d9b13b';
const STAFF_WOOD_COLOR = '#8a6233';
const MAGE_ORB_COLOR = '#7fd4ff';
const WOLF_EYE_COLOR = '#ff5a4a';
const STONELING_ROCK_COLOR = '#7d7d7d';
const STONELING_CRACK_COLOR = '#55585c';
const GNARLROOT_BARK_COLOR = '#4a3a2a';
const GNARLROOT_LEAF_COLOR = '#6f8f3c';

const TERRAIN_FILL_COLORS: Record<string, string> = {
  grass: '#5d8a4a',
  path: '#a98f5e',
  rock: '#7d7d7d',
  water: '#3f6fa3',
  tree: '#2f5b33',
};

// ── Key dimensions (px, relative to the tile-floor anchor point) ────────

const BASE_PLATE_RADIUS_X = 19;
const BASE_PLATE_RADIUS_Y = 8;
const TORSO_HEIGHT = 19;
const TORSO_HALF_WIDTH = 8;
const HEAD_RADIUS = 7;
/** Total visual height; the renderer uses it to place the hit-point bar. */
export const MINIATURE_HEIGHT_PIXELS = 44;

interface HumanoidFeatures {
  pointedEars?: boolean;
  tail?: boolean;
  bulkyFrame?: boolean;
  snout?: boolean;
  gauntFrame?: boolean;
  skullFace?: boolean;
  wings?: boolean;
  eagleHindquarters?: boolean;
}

const RACE_FEATURES: Record<string, HumanoidFeatures> = {
  Human: {},
  Werecat: { pointedEars: true, tail: true },
  Werelizard: { bulkyFrame: true, snout: true, tail: true },
  Undead: { gauntFrame: true, skullFace: true },
  Feryan: { wings: true, eagleHindquarters: true },
};

type HeldItem = 'sword' | 'dagger' | 'orbStaff' | 'crossStaff' | 'none';

const CLASS_HELD_ITEMS: Record<string, HeldItem> = {
  Warrior: 'sword',
  Thief: 'dagger',
  Mage: 'orbStaff',
  Priest: 'crossStaff',
};

export function fillColorForTerrain(terrain: string): string {
  return TERRAIN_FILL_COLORS[terrain] ?? FALLBACK_BODY_COLOR;
}

/**
 * Draws a unit miniature standing on the tile-floor anchor point
 * (anchorX, anchorY) — the projected center of the tile's floor diamond.
 */
export function drawUnitMiniature(
  drawingContext: CanvasRenderingContext2D,
  descriptor: UnitAppearanceDescriptor,
  anchorX: number,
  anchorY: number,
): void {
  drawBasePlate(drawingContext, descriptor.team, anchorX, anchorY);
  const monsterDrawer = MONSTER_DRAWERS[descriptor.classLabel];
  if (descriptor.raceLabel === 'Creature of the Darkness') {
    (monsterDrawer ?? drawUnknownCreature)(drawingContext, anchorX, anchorY);
    return;
  }
  drawHumanoid(
    drawingContext,
    anchorX,
    anchorY,
    RACE_BODY_COLORS[descriptor.raceLabel] ?? FALLBACK_BODY_COLOR,
    RACE_FEATURES[descriptor.raceLabel] ?? {},
  );
  drawHeldItem(drawingContext, CLASS_HELD_ITEMS[descriptor.classLabel] ?? 'none', anchorX, anchorY);
}

// ── Shared pieces ───────────────────────────────────────────────────────

function drawBasePlate(
  drawingContext: CanvasRenderingContext2D,
  team: string,
  anchorX: number,
  anchorY: number,
): void {
  drawingContext.beginPath();
  drawingContext.ellipse(anchorX, anchorY, BASE_PLATE_RADIUS_X, BASE_PLATE_RADIUS_Y, 0, 0, Math.PI * 2);
  drawingContext.fillStyle = TEAM_BASE_PLATE_COLORS[team] ?? FALLBACK_BODY_COLOR;
  drawingContext.fill();
  drawingContext.strokeStyle = FIGURE_OUTLINE_COLOR;
  drawingContext.stroke();
}

function outlineAndFill(drawingContext: CanvasRenderingContext2D, fillColor: string): void {
  drawingContext.fillStyle = fillColor;
  drawingContext.fill();
  drawingContext.strokeStyle = FIGURE_OUTLINE_COLOR;
  drawingContext.stroke();
}

// ── The parametric humanoid (all five races) ────────────────────────────

function drawHumanoid(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
  bodyColor: string,
  features: HumanoidFeatures,
): void {
  const widthAdjust = features.bulkyFrame ? 4 : features.gauntFrame ? -2 : 0;
  const hipHalfWidth = TORSO_HALF_WIDTH + widthAdjust;
  const shoulderHalfWidth = hipHalfWidth - 3;
  // Feryans are a torso rising from an eagle rear body, so the torso sits forward.
  const torsoX = features.eagleHindquarters ? anchorX + 5 : anchorX;
  const hipY = anchorY - 3;
  const shoulderY = hipY - TORSO_HEIGHT;
  const headCenterY = shoulderY - HEAD_RADIUS + 1;

  if (features.eagleHindquarters) {
    // Rear eagle body behind the torso, with two hind-leg strokes.
    drawingContext.beginPath();
    drawingContext.ellipse(anchorX - 8, anchorY - 8, 12, 7, 0, 0, Math.PI * 2);
    outlineAndFill(drawingContext, bodyColor);
    drawingContext.beginPath();
    drawingContext.moveTo(anchorX - 14, anchorY - 3);
    drawingContext.lineTo(anchorX - 14, anchorY + 1);
    drawingContext.moveTo(anchorX - 6, anchorY - 2);
    drawingContext.lineTo(anchorX - 6, anchorY + 2);
    drawingContext.strokeStyle = FIGURE_OUTLINE_COLOR;
    drawingContext.stroke();
  }

  if (features.wings) {
    for (const wingDirection of [-1, 1]) {
      drawingContext.beginPath();
      drawingContext.moveTo(torsoX + wingDirection * 4, shoulderY + 4);
      drawingContext.quadraticCurveTo(
        torsoX + wingDirection * 22,
        shoulderY - 14,
        torsoX + wingDirection * 9,
        shoulderY + 9,
      );
      drawingContext.closePath();
      outlineAndFill(drawingContext, WING_COLOR);
    }
  }

  if (features.tail) {
    drawingContext.beginPath();
    drawingContext.moveTo(torsoX - hipHalfWidth + 2, hipY);
    drawingContext.quadraticCurveTo(torsoX - hipHalfWidth - 9, hipY - 2, torsoX - hipHalfWidth - 7, hipY - 12);
    drawingContext.strokeStyle = bodyColor;
    drawingContext.lineWidth = 3;
    drawingContext.stroke();
    drawingContext.lineWidth = 1;
  }

  // Torso: a tapered trapezoid from hips to shoulders.
  drawingContext.beginPath();
  drawingContext.moveTo(torsoX - hipHalfWidth, hipY);
  drawingContext.lineTo(torsoX + hipHalfWidth, hipY);
  drawingContext.lineTo(torsoX + shoulderHalfWidth, shoulderY);
  drawingContext.lineTo(torsoX - shoulderHalfWidth, shoulderY);
  drawingContext.closePath();
  outlineAndFill(drawingContext, bodyColor);

  // Head.
  const headRadius = features.bulkyFrame ? HEAD_RADIUS + 1 : HEAD_RADIUS;
  drawingContext.beginPath();
  drawingContext.arc(torsoX, headCenterY, headRadius, 0, Math.PI * 2);
  outlineAndFill(drawingContext, features.skullFace ? SKULL_FACE_COLOR : bodyColor);

  if (features.skullFace) {
    drawingContext.fillStyle = FIGURE_OUTLINE_COLOR;
    for (const eyeDirection of [-1, 1]) {
      drawingContext.beginPath();
      drawingContext.arc(torsoX + eyeDirection * 2.6, headCenterY - 1, 1.4, 0, Math.PI * 2);
      drawingContext.fill();
    }
  }

  if (features.pointedEars) {
    for (const earDirection of [-1, 1]) {
      drawingContext.beginPath();
      drawingContext.moveTo(torsoX + earDirection * 2, headCenterY - headRadius + 1);
      drawingContext.lineTo(torsoX + earDirection * 7, headCenterY - headRadius - 7);
      drawingContext.lineTo(torsoX + earDirection * 6.5, headCenterY - headRadius + 3);
      drawingContext.closePath();
      outlineAndFill(drawingContext, bodyColor);
    }
  }

  if (features.snout) {
    drawingContext.beginPath();
    drawingContext.ellipse(torsoX + headRadius + 2, headCenterY + 2, 5, 3.5, 0, 0, Math.PI * 2);
    outlineAndFill(drawingContext, bodyColor);
  }
}

// ── Class items (held at the figure's right side) ───────────────────────

function drawHeldItem(
  drawingContext: CanvasRenderingContext2D,
  heldItem: HeldItem,
  anchorX: number,
  anchorY: number,
): void {
  const itemX = anchorX + 13;
  switch (heldItem) {
    case 'sword': {
      drawingContext.beginPath();
      drawingContext.moveTo(itemX, anchorY - 30);
      drawingContext.lineTo(itemX, anchorY - 7);
      drawingContext.strokeStyle = BLADE_COLOR;
      drawingContext.lineWidth = 3;
      drawingContext.stroke();
      drawingContext.beginPath();
      drawingContext.moveTo(itemX - 4, anchorY - 12);
      drawingContext.lineTo(itemX + 4, anchorY - 12);
      drawingContext.strokeStyle = GUARD_AND_CROSS_COLOR;
      drawingContext.stroke();
      drawingContext.lineWidth = 1;
      return;
    }
    case 'dagger': {
      drawingContext.beginPath();
      drawingContext.moveTo(itemX + 4, anchorY - 20);
      drawingContext.lineTo(itemX - 2, anchorY - 7);
      drawingContext.strokeStyle = BLADE_COLOR;
      drawingContext.lineWidth = 2.5;
      drawingContext.stroke();
      drawingContext.lineWidth = 1;
      return;
    }
    case 'orbStaff':
    case 'crossStaff': {
      drawingContext.beginPath();
      drawingContext.moveTo(itemX, anchorY - 32);
      drawingContext.lineTo(itemX, anchorY - 4);
      drawingContext.strokeStyle = STAFF_WOOD_COLOR;
      drawingContext.lineWidth = 2.5;
      drawingContext.stroke();
      drawingContext.lineWidth = 1;
      if (heldItem === 'orbStaff') {
        drawingContext.beginPath();
        drawingContext.arc(itemX, anchorY - 34, 3.5, 0, Math.PI * 2);
        outlineAndFill(drawingContext, MAGE_ORB_COLOR);
      } else {
        drawingContext.beginPath();
        drawingContext.moveTo(itemX, anchorY - 38);
        drawingContext.lineTo(itemX, anchorY - 30);
        drawingContext.moveTo(itemX - 3.5, anchorY - 35);
        drawingContext.lineTo(itemX + 3.5, anchorY - 35);
        drawingContext.strokeStyle = GUARD_AND_CROSS_COLOR;
        drawingContext.lineWidth = 2.5;
        drawingContext.stroke();
        drawingContext.lineWidth = 1;
      }
      return;
    }
    case 'none':
      return;
  }
}

// ── Creatures of the Darkness ───────────────────────────────────────────

type MonsterDrawer = (
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
) => void;

function drawTwistedWolf(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
): void {
  const bodyColor = '#4a3f55';
  // Four legs under a horizontal body.
  drawingContext.strokeStyle = FIGURE_OUTLINE_COLOR;
  for (const legX of [-10, -5, 4, 9]) {
    drawingContext.beginPath();
    drawingContext.moveTo(anchorX + legX, anchorY - 9);
    drawingContext.lineTo(anchorX + legX, anchorY - 1);
    drawingContext.stroke();
  }
  drawingContext.beginPath();
  drawingContext.ellipse(anchorX - 1, anchorY - 13, 13, 7, 0, 0, Math.PI * 2);
  outlineAndFill(drawingContext, bodyColor);
  // Tail swept up behind.
  drawingContext.beginPath();
  drawingContext.moveTo(anchorX - 13, anchorY - 15);
  drawingContext.quadraticCurveTo(anchorX - 21, anchorY - 22, anchorX - 17, anchorY - 25);
  drawingContext.strokeStyle = bodyColor;
  drawingContext.lineWidth = 3;
  drawingContext.stroke();
  drawingContext.lineWidth = 1;
  // Head with pricked ears and a baleful eye.
  drawingContext.beginPath();
  drawingContext.arc(anchorX + 13, anchorY - 17, 6, 0, Math.PI * 2);
  outlineAndFill(drawingContext, bodyColor);
  for (const earX of [10, 15]) {
    drawingContext.beginPath();
    drawingContext.moveTo(anchorX + earX, anchorY - 21);
    drawingContext.lineTo(anchorX + earX + 1.5, anchorY - 28);
    drawingContext.lineTo(anchorX + earX + 3.5, anchorY - 21);
    drawingContext.closePath();
    outlineAndFill(drawingContext, bodyColor);
  }
  drawingContext.beginPath();
  drawingContext.arc(anchorX + 15, anchorY - 18, 1.5, 0, Math.PI * 2);
  drawingContext.fillStyle = WOLF_EYE_COLOR;
  drawingContext.fill();
}

function drawStoneling(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
): void {
  // A squat pile of living rock: broad slab + boulder head.
  drawingContext.beginPath();
  drawingContext.moveTo(anchorX - 14, anchorY - 1);
  drawingContext.lineTo(anchorX - 11, anchorY - 18);
  drawingContext.lineTo(anchorX + 12, anchorY - 16);
  drawingContext.lineTo(anchorX + 15, anchorY - 2);
  drawingContext.closePath();
  outlineAndFill(drawingContext, STONELING_ROCK_COLOR);
  drawingContext.beginPath();
  drawingContext.arc(anchorX + 1, anchorY - 24, 9, 0, Math.PI * 2);
  outlineAndFill(drawingContext, STONELING_ROCK_COLOR);
  // Cracks.
  drawingContext.strokeStyle = STONELING_CRACK_COLOR;
  drawingContext.beginPath();
  drawingContext.moveTo(anchorX - 7, anchorY - 14);
  drawingContext.lineTo(anchorX - 2, anchorY - 8);
  drawingContext.lineTo(anchorX - 6, anchorY - 3);
  drawingContext.moveTo(anchorX + 6, anchorY - 13);
  drawingContext.lineTo(anchorX + 9, anchorY - 6);
  drawingContext.stroke();
}

function drawGnarlroot(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
): void {
  // Splayed roots at the base.
  drawingContext.strokeStyle = GNARLROOT_BARK_COLOR;
  drawingContext.lineWidth = 2.5;
  for (const rootX of [-9, -3, 4, 10]) {
    drawingContext.beginPath();
    drawingContext.moveTo(anchorX, anchorY - 8);
    drawingContext.lineTo(anchorX + rootX, anchorY);
    drawingContext.stroke();
  }
  // Tapered trunk.
  drawingContext.beginPath();
  drawingContext.moveTo(anchorX - 7, anchorY - 6);
  drawingContext.lineTo(anchorX + 7, anchorY - 6);
  drawingContext.lineTo(anchorX + 3, anchorY - 24);
  drawingContext.lineTo(anchorX - 3, anchorY - 24);
  drawingContext.closePath();
  outlineAndFill(drawingContext, GNARLROOT_BARK_COLOR);
  // Branches with sickly leaf tufts.
  for (const branch of [
    { tipX: -11, tipY: -36 },
    { tipX: 0, tipY: -40 },
    { tipX: 11, tipY: -34 },
  ]) {
    drawingContext.beginPath();
    drawingContext.moveTo(anchorX, anchorY - 23);
    drawingContext.lineTo(anchorX + branch.tipX, anchorY + branch.tipY);
    drawingContext.stroke();
    drawingContext.beginPath();
    drawingContext.arc(anchorX + branch.tipX, anchorY + branch.tipY, 4, 0, Math.PI * 2);
    outlineAndFill(drawingContext, GNARLROOT_LEAF_COLOR);
  }
  drawingContext.lineWidth = 1;
}

function drawUnknownCreature(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
): void {
  drawingContext.beginPath();
  drawingContext.ellipse(anchorX, anchorY - 12, 12, 10, 0, 0, Math.PI * 2);
  outlineAndFill(drawingContext, '#4a3f55');
}

function drawTwistedBoar(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
): void {
  const hideColor = '#5d4636';
  drawingContext.strokeStyle = FIGURE_OUTLINE_COLOR;
  for (const legX of [-9, -4, 5, 9]) {
    drawingContext.beginPath();
    drawingContext.moveTo(anchorX + legX, anchorY - 8);
    drawingContext.lineTo(anchorX + legX, anchorY - 1);
    drawingContext.stroke();
  }
  // Heavy barrel body with a humped back.
  drawingContext.beginPath();
  drawingContext.ellipse(anchorX - 1, anchorY - 13, 14, 9, 0, 0, Math.PI * 2);
  outlineAndFill(drawingContext, hideColor);
  // Snouted head low to the ground.
  drawingContext.beginPath();
  drawingContext.arc(anchorX + 13, anchorY - 11, 6, 0, Math.PI * 2);
  outlineAndFill(drawingContext, hideColor);
  // Tusks.
  drawingContext.strokeStyle = BLADE_COLOR;
  drawingContext.lineWidth = 2;
  drawingContext.beginPath();
  drawingContext.moveTo(anchorX + 16, anchorY - 8);
  drawingContext.lineTo(anchorX + 20, anchorY - 13);
  drawingContext.moveTo(anchorX + 12, anchorY - 7);
  drawingContext.lineTo(anchorX + 15, anchorY - 3);
  drawingContext.stroke();
  drawingContext.lineWidth = 1;
}

function drawHollowWisp(
  drawingContext: CanvasRenderingContext2D,
  anchorX: number,
  anchorY: number,
): void {
  const wispGlowColor = '#b9d8ff';
  const wispCoreColor = '#5a78b8';
  // Drifting trail beneath the floating core.
  drawingContext.strokeStyle = wispGlowColor;
  drawingContext.lineWidth = 2;
  drawingContext.beginPath();
  drawingContext.moveTo(anchorX, anchorY - 4);
  drawingContext.quadraticCurveTo(anchorX - 6, anchorY - 12, anchorX - 1, anchorY - 18);
  drawingContext.stroke();
  drawingContext.lineWidth = 1;
  // Pale outer glow and a colder core.
  drawingContext.beginPath();
  drawingContext.arc(anchorX, anchorY - 26, 9, 0, Math.PI * 2);
  outlineAndFill(drawingContext, wispGlowColor);
  drawingContext.beginPath();
  drawingContext.arc(anchorX, anchorY - 26, 4.5, 0, Math.PI * 2);
  drawingContext.fillStyle = wispCoreColor;
  drawingContext.fill();
}

const MONSTER_DRAWERS: Record<string, MonsterDrawer> = {
  'Twisted Wolf': drawTwistedWolf,
  Stoneling: drawStoneling,
  Gnarlroot: drawGnarlroot,
  'Twisted Boar': drawTwistedBoar,
  'Hollow Wisp': drawHollowWisp,
};
