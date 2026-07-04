import { type GuildState } from '../../sim/guild/GuildState';
import {
  reputationTierForQuestCount,
  REPUTATION_TIER_LABELS,
  type ReputationTier,
} from '../../sim/guild/ReputationTier';
import { isZoneAccessibleAtTier } from '../../sim/guild/ZoneAccess';
import type { WorldRoad } from '../../sim/guild/WorldTravel';
import type { ZoneDefinition } from '../../sim/guild/ZoneDefinition';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import { createSoundedButton } from '../village/views/SoundedButton';
import { createOverworldMapCanvas, type MapEdge, type MapNodeEntry } from './OverworldMapCanvas';
import { drawPlayerToken, TOKEN_CORNER_OFFSET_X, TOKEN_CORNER_OFFSET_Y, walkingTokenPoint } from './mapTokens';
import { runTravelAnimationLoop } from './travelAnimationLoop';

export interface OverworldCallbacks {
  onZoneSelected: (zoneIdentifier: string) => void;
  onOpenGuildMenu: () => void;
}

/** The travel token mid-road: where it walks from, where to, and how far along it is (0..1). */
interface TravelAnimationState {
  fromZoneIdentifier: string;
  toZoneIdentifier: string;
  progress: number;
}

export class OverworldScreen {
  private readonly rootElement: HTMLElement;
  private readonly sounds: UserInterfaceSounds;
  private readonly zones: Record<string, ZoneDefinition>;
  private readonly worldRoads: readonly WorldRoad[];
  private readonly callbacks: OverworldCallbacks;
  private mapContainer: HTMLElement | undefined;
  private redrawMap: (() => void) | undefined;
  private travelAnimation: TravelAnimationState | undefined;

  constructor(
    rootElement: HTMLElement,
    sounds: UserInterfaceSounds,
    zones: Record<string, ZoneDefinition>,
    worldRoads: readonly WorldRoad[],
    callbacks: OverworldCallbacks,
  ) {
    this.rootElement = rootElement;
    this.sounds = sounds;
    this.zones = zones;
    this.worldRoads = worldRoads;
    this.callbacks = callbacks;
  }

  render(guild: GuildState): void {
    this.rootElement.replaceChildren();

    this.mapContainer = document.createElement('div');
    this.mapContainer.className = 'map-fullbleed-canvas-container';
    this.mapContainer.appendChild(this.buildMapCanvas(guild));
    this.rootElement.appendChild(this.mapContainer);

    const plaque = document.createElement('div');
    plaque.className = 'map-location-plaque';
    plaque.innerHTML = `
      <h1>The Overworld</h1>
      <p>Aentea's held lands — click a zone to travel there by road.</p>
    `;
    this.rootElement.appendChild(plaque);

    const tier = reputationTierForQuestCount(guild.completedQuestCount);
    const statusPill = document.createElement('div');
    statusPill.className = 'map-status-pill';
    statusPill.innerHTML = `
      <span>Gold: <strong>${guild.gold}</strong></span>
      <span class="map-tier-badge map-tier-${tier}">${REPUTATION_TIER_LABELS[tier]} Guild</span>
    `;
    this.rootElement.appendChild(statusPill);

    const cornerButtons = document.createElement('div');
    cornerButtons.className = 'map-corner-buttons';
    cornerButtons.appendChild(
      createSoundedButton(this.sounds, {
        label: 'Guild',
        className: 'map-corner-button',
        onClick: () => this.callbacks.onOpenGuildMenu(),
      }),
    );
    this.rootElement.appendChild(cornerButtons);
  }

  /**
   * Glides the travel token along the road from one zone to the next,
   * then reports arrival. The guild's position is only advanced by the
   * caller *after* arrival, so a mid-animation repaint (resize, guild
   * menu action) always draws a consistent token.
   */
  animateTravelStep(
    fromZoneIdentifier: string,
    toZoneIdentifier: string,
    durationMilliseconds: number,
    onArrived: () => void,
  ): void {
    runTravelAnimationLoop(
      durationMilliseconds,
      (progress) => {
        this.travelAnimation = { fromZoneIdentifier, toZoneIdentifier, progress };
        this.redrawMap?.();
      },
      () => {
        this.travelAnimation = undefined;
        onArrived();
      },
    );
  }

  private buildMapCanvas(guild: GuildState): HTMLCanvasElement {
    const tier = reputationTierForQuestCount(guild.completedQuestCount);
    return createOverworldMapCanvas(
      this.nodeEntries(tier),
      this.sounds,
      (zoneIdentifier) => this.callbacks.onZoneSelected(zoneIdentifier),
      this.edgeEntries(),
      (context, centers) => this.drawGuildToken(context, centers, guild),
      (redraw) => {
        this.redrawMap = redraw;
      },
    );
  }

  private drawGuildToken(
    context: CanvasRenderingContext2D,
    centers: Map<string, { x: number; y: number }>,
    guild: GuildState,
  ): void {
    const animation = this.travelAnimation;
    if (animation !== undefined) {
      const fromCenter = centers.get(animation.fromZoneIdentifier);
      const toCenter = centers.get(animation.toZoneIdentifier);
      if (fromCenter !== undefined && toCenter !== undefined) {
        const walkingPoint = walkingTokenPoint(
          fromCenter,
          toCenter,
          animation.progress,
          TOKEN_CORNER_OFFSET_X,
          TOKEN_CORNER_OFFSET_Y,
        );
        drawPlayerToken(context, walkingPoint.x, walkingPoint.y);
        return;
      }
    }

    const guildCenter =
      guild.currentZoneIdentifier === undefined ? undefined : centers.get(guild.currentZoneIdentifier);
    if (guildCenter !== undefined) {
      drawPlayerToken(context, guildCenter.x + TOKEN_CORNER_OFFSET_X, guildCenter.y + TOKEN_CORNER_OFFSET_Y);
    }
  }

  private nodeEntries(currentTier: ReputationTier): MapNodeEntry[] {
    return Object.values(this.zones).map((zone) => ({
      identifier: zone.identifier,
      label: zone.displayName,
      sublabel: 'Zone',
      kind: 'zone',
      position: zone.worldMapPosition,
      isGuarded: !isZoneAccessibleAtTier(zone, currentTier),
    }));
  }

  private edgeEntries(): MapEdge[] {
    return this.worldRoads.map((road) => ({
      fromNodeIdentifier: road.fromZoneIdentifier,
      toNodeIdentifier: road.toZoneIdentifier,
    }));
  }
}
