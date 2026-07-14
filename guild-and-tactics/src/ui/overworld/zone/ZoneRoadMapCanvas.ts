import type { ZoneDefinition } from '@/sim/guild/ZoneDefinition';
import type { ZoneRoamingGroupLocation } from '@/sim/guild/ZoneSession';
import type { UserInterfaceSounds } from '@/ui/UserInterfaceSounds';
import { createOverworldMapCanvas, type MapEdge, type MapNodeEntry } from '../OverworldMapCanvas';
import {
  drawMonsterIcon,
  drawPlayerToken,
  TOKEN_CORNER_OFFSET_X,
  TOKEN_CORNER_OFFSET_Y,
  walkingTokenPoint,
} from '../mapTokens';

const MONSTER_STACK_OFFSET_X = 14;

/** One walking step in flight: everyone's previous stop, and how far along the segment the walk is (0..1). */
export interface ZoneWalkAnimation {
  progress: number;
  playerFromLocationIdentifier: string;
  /** Each active roaming group's location before this step, by group identifier. */
  groupFromLocationIdentifiers: Record<string, string>;
}

/** Everything the canvas needs to place the player and patrol tokens, resting or mid-walk. */
export interface ZoneTokenDrawState {
  playerLocationIdentifier: string;
  activeRoamingGroupLocations: readonly ZoneRoamingGroupLocation[];
  walkAnimation?: ZoneWalkAnimation;
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

function drawZoneTokens(
  context: CanvasRenderingContext2D,
  centers: Map<string, { x: number; y: number }>,
  state: ZoneTokenDrawState,
): void {
  const stackIndexByLocation = new Map<string, number>();
  for (const group of state.activeRoamingGroupLocations) {
    const restingCenter = centers.get(group.locationIdentifier);
    if (restingCenter === undefined) continue;
    const stackIndex = stackIndexByLocation.get(group.locationIdentifier) ?? 0;
    stackIndexByLocation.set(group.locationIdentifier, stackIndex + 1);
    const restingOffsetX = -TOKEN_CORNER_OFFSET_X + stackIndex * MONSTER_STACK_OFFSET_X;

    const fromLocationIdentifier = state.walkAnimation?.groupFromLocationIdentifiers[group.groupIdentifier];
    const fromCenter = fromLocationIdentifier === undefined ? undefined : centers.get(fromLocationIdentifier);
    if (state.walkAnimation !== undefined && fromCenter !== undefined) {
      const walkingPoint = walkingTokenPoint(
        fromCenter,
        restingCenter,
        state.walkAnimation.progress,
        restingOffsetX,
        TOKEN_CORNER_OFFSET_Y,
      );
      drawMonsterIcon(context, walkingPoint.x, walkingPoint.y);
    } else {
      drawMonsterIcon(context, restingCenter.x + restingOffsetX, restingCenter.y + TOKEN_CORNER_OFFSET_Y);
    }
  }

  const playerRestingCenter = centers.get(state.playerLocationIdentifier);
  if (playerRestingCenter === undefined) return;
  const playerFromCenter =
    state.walkAnimation === undefined ? undefined : centers.get(state.walkAnimation.playerFromLocationIdentifier);
  if (state.walkAnimation !== undefined && playerFromCenter !== undefined) {
    const walkingPoint = walkingTokenPoint(
      playerFromCenter,
      playerRestingCenter,
      state.walkAnimation.progress,
      TOKEN_CORNER_OFFSET_X,
      TOKEN_CORNER_OFFSET_Y,
    );
    drawPlayerToken(context, walkingPoint.x, walkingPoint.y);
  } else {
    drawPlayerToken(context, playerRestingCenter.x + TOKEN_CORNER_OFFSET_X, playerRestingCenter.y + TOKEN_CORNER_OFFSET_Y);
  }
}

/**
 * The walkable road-network map for one zone: builds on the shared
 * World Map/Town node-graph renderer (`createOverworldMapCanvas`), adding
 * roaming-group and player tokens on top via `afterRender`. Token
 * positions come from `getTokenDrawState` on every repaint, so the caller
 * can animate a walk (player and patrols gliding in lockstep) by mutating
 * that state and invoking the `registerRedraw` hook.
 */
export function createZoneRoadMapCanvas(
  zone: ZoneDefinition,
  sounds: UserInterfaceSounds,
  onLocationClicked: (locationIdentifier: string) => void,
  getTokenDrawState: () => ZoneTokenDrawState,
  registerRedraw?: (redraw: () => void) => void,
): HTMLCanvasElement {
  return createOverworldMapCanvas(
    buildNodeEntries(zone),
    sounds,
    onLocationClicked,
    buildEdges(zone),
    (context, centers) => drawZoneTokens(context, centers, getTokenDrawState()),
    registerRedraw,
  );
}
