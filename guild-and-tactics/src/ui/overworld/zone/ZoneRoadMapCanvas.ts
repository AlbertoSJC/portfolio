import type { ZoneDefinition } from '../../../sim/guild/ZoneDefinition';
import type { ZoneRoamingGroupLocation } from '../../../sim/guild/ZoneSession';
import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { createOverworldMapCanvas, type MapEdge, type MapNodeEntry } from '../OverworldMapCanvas';
import { MAP_INK, MAP_MARKER, MAP_PARCHMENT } from '../../mapPalette';

const MONSTER_COLOR = MAP_INK;
const TOKEN_SIZE = 32;
const TOKEN_CORNER_OFFSET_X = 40;
const TOKEN_CORNER_OFFSET_Y = -24;
const MONSTER_STACK_OFFSET_X = 14;

/** A roaming group's marker — same two-eyed blot as the old exploration grid, just sized for a node badge. */
function drawMonsterIcon(context: CanvasRenderingContext2D, cx: number, cy: number): void {
  const radius = TOKEN_SIZE * 0.26;
  context.fillStyle = MONSTER_COLOR;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = MAP_PARCHMENT;
  context.beginPath();
  context.arc(cx - radius * 0.4, cy - radius * 0.15, radius * 0.18, 0, Math.PI * 2);
  context.arc(cx + radius * 0.4, cy - radius * 0.15, radius * 0.18, 0, Math.PI * 2);
  context.fill();
}

/** The player's marker — same head-and-cloak token as the old exploration grid. */
function drawPlayerToken(context: CanvasRenderingContext2D, cx: number, cy: number): void {
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

function buildNodeEntries(zone: ZoneDefinition): MapNodeEntry[] {
  return zone.locations.map((location) => ({
    identifier: location.identifier,
    label: location.displayName,
    sublabel: location.kind === 'tavern' ? 'Tavern' : 'Landmark',
    kind: location.kind === 'tavern' ? 'tavern' : 'landmark',
    position: location.position,
  }));
}

function buildEdges(zone: ZoneDefinition): MapEdge[] {
  return zone.roads.map((road) => ({
    fromNodeIdentifier: road.fromLocationIdentifier,
    toNodeIdentifier: road.toLocationIdentifier,
  }));
}

/**
 * The walkable road-network map for one zone: builds on the shared
 * World Map/Town node-graph renderer (`createOverworldMapCanvas`), adding
 * roaming-group and player tokens on top via `afterRender` — this module's
 * only job is that mapping plus the two ported icon-drawing functions
 * above.
 */
export function createZoneRoadMapCanvas(
  zone: ZoneDefinition,
  playerLocationIdentifier: string,
  activeRoamingGroupLocations: readonly ZoneRoamingGroupLocation[],
  sounds: UserInterfaceSounds,
  onLocationClicked: (locationIdentifier: string) => void,
): HTMLCanvasElement {
  const nodes = buildNodeEntries(zone);
  const edges = buildEdges(zone);

  return createOverworldMapCanvas(
    nodes,
    sounds,
    onLocationClicked,
    edges,
    (context, centers) => {
      const groupsByLocation = new Map<string, number>();
      for (const group of activeRoamingGroupLocations) {
        const center = centers.get(group.locationIdentifier);
        if (center === undefined) continue;
        const stackIndex = groupsByLocation.get(group.locationIdentifier) ?? 0;
        groupsByLocation.set(group.locationIdentifier, stackIndex + 1);
        drawMonsterIcon(
          context,
          center.x - TOKEN_CORNER_OFFSET_X + stackIndex * MONSTER_STACK_OFFSET_X,
          center.y + TOKEN_CORNER_OFFSET_Y,
        );
      }

      const playerCenter = centers.get(playerLocationIdentifier);
      if (playerCenter !== undefined) {
        drawPlayerToken(context, playerCenter.x + TOKEN_CORNER_OFFSET_X, playerCenter.y + TOKEN_CORNER_OFFSET_Y);
      }
    },
  );
}
