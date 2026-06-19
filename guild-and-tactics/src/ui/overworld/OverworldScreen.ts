import { type GuildState } from '../../sim/guild/GuildState';
import { reputationTierForQuestCount, REPUTATION_TIER_LABELS } from '../../sim/guild/ReputationTier';
import type { ZoneDefinition } from '../../sim/guild/ZoneDefinition';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import { createSoundedButton } from '../village/views/SoundedButton';
import { createOverworldMapCanvas, type MapNodeEntry } from './OverworldMapCanvas';

export interface OverworldCallbacks {
  onEnterZone: (zoneIdentifier: string) => void;
  onOpenGuildMenu: () => void;
}

export class OverworldScreen {
  private readonly rootElement: HTMLElement;
  private readonly sounds: UserInterfaceSounds;
  private readonly zones: Record<string, ZoneDefinition>;
  private readonly callbacks: OverworldCallbacks;

  constructor(
    rootElement: HTMLElement,
    sounds: UserInterfaceSounds,
    zones: Record<string, ZoneDefinition>,
    callbacks: OverworldCallbacks,
  ) {
    this.rootElement = rootElement;
    this.sounds = sounds;
    this.zones = zones;
    this.callbacks = callbacks;
  }

  render(guild: GuildState): void {
    this.rootElement.replaceChildren();

    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-fullbleed-canvas-container';
    mapContainer.appendChild(
      createOverworldMapCanvas(this.nodeEntries(), this.sounds, (zoneIdentifier) => {
        this.callbacks.onEnterZone(zoneIdentifier);
      }),
    );
    this.rootElement.appendChild(mapContainer);

    const plaque = document.createElement('div');
    plaque.className = 'map-location-plaque';
    plaque.innerHTML = `
      <h1>The Overworld</h1>
      <p>Aentea's held lands — click a road to set out.</p>
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

  private nodeEntries(): MapNodeEntry[] {
    return Object.values(this.zones).map((zone) => ({
      identifier: zone.identifier,
      label: zone.displayName,
      sublabel: 'Zone',
      kind: 'zone',
    }));
  }
}
