import { BATTLE_PARTY_CAPACITY, type GuildState } from '../../../sim/guild/GuildState';
import type { ZoneDefinition } from '../../../sim/guild/ZoneDefinition';
import type { ZoneRoamingGroupLocation } from '../../../sim/guild/ZoneSession';
import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { ModalDialog } from '../../village/ModalDialog';
import { buildMusterCardViewModels, type MemberContentTables } from '../../village/presenters/MemberPresenters';
import { createHintParagraph } from '../../village/views/DomPrimitives';
import { renderMusterCard } from '../../village/views/MemberCardViews';
import { createSoundedButton } from '../../village/views/SoundedButton';
import { runTravelAnimationLoop } from '../travelAnimationLoop';
import { createZoneRoadMapCanvas, type ZoneWalkAnimation } from './ZoneRoadMapCanvas';

export interface ZoneScreenCallbacks {
  onLocationClicked: (locationIdentifier: string) => void;
  onOpenGuildMenu: () => void;
  onReturnToWorldMap: () => void;
}

interface CollisionMusterState {
  encounterLabel: string;
  onConfirm: (deployedMemberIdentifiers: string[]) => void;
}

/**
 * The walkable road-network map for one zone: a full-bleed map with a
 * location plaque, status pill, and corner buttons (Guild, World Map)
 * instead of a header bar. Its only modal is the "muster your patrol"
 * prompt that appears the instant a roaming group is caught — the Tavern
 * lives on its own full-screen `TownScreen` now, not a popup here.
 */
export class ZoneScreen {
  private readonly rootElement: HTMLElement;
  private readonly sounds: UserInterfaceSounds;
  private readonly content: MemberContentTables;
  private readonly callbacks: ZoneScreenCallbacks;
  private readonly modal: ModalDialog;
  private lastGuild: GuildState | undefined;
  private musterState: CollisionMusterState | undefined;
  private readonly selectedMemberIdentifiers = new Set<string>();
  private playerLocationIdentifier: string | undefined;
  private activeGroupLocations: readonly ZoneRoamingGroupLocation[] = [];
  private walkAnimation: ZoneWalkAnimation | undefined;
  private redrawGrid: (() => void) | undefined;

  constructor(
    rootElement: HTMLElement,
    sounds: UserInterfaceSounds,
    content: MemberContentTables,
    callbacks: ZoneScreenCallbacks,
  ) {
    this.rootElement = rootElement;
    this.sounds = sounds;
    this.content = content;
    this.callbacks = callbacks;
    this.modal = new ModalDialog(document.body, sounds);
  }

  render(
    zone: ZoneDefinition,
    guild: GuildState,
    playerLocationIdentifier: string,
    activeGroupLocations: readonly ZoneRoamingGroupLocation[],
  ): void {
    this.lastGuild = guild;
    this.playerLocationIdentifier = playerLocationIdentifier;
    this.activeGroupLocations = activeGroupLocations;
    this.rootElement.replaceChildren();

    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-fullbleed-canvas-container';
    mapContainer.appendChild(
      createZoneRoadMapCanvas(
        zone,
        this.sounds,
        (locationIdentifier) => this.callbacks.onLocationClicked(locationIdentifier),
        () => ({
          playerLocationIdentifier: this.playerLocationIdentifier ?? playerLocationIdentifier,
          activeRoamingGroupLocations: this.activeGroupLocations,
          walkAnimation: this.walkAnimation,
        }),
        (redraw) => {
          this.redrawGrid = redraw;
        },
      ),
    );
    this.rootElement.appendChild(mapContainer);

    const plaque = document.createElement('div');
    plaque.className = 'map-location-plaque';
    plaque.innerHTML = `
      <h1>${zone.displayName}</h1>
      <p>${zone.description}</p>
    `;
    this.rootElement.appendChild(plaque);

    const statusPill = document.createElement('div');
    statusPill.className = 'map-status-pill';
    statusPill.innerHTML = `<span>Gold: <strong>${guild.gold}</strong></span>`;
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
    cornerButtons.appendChild(
      createSoundedButton(this.sounds, {
        label: 'World Map',
        className: 'map-corner-button',
        onClick: () => this.callbacks.onReturnToWorldMap(),
      }),
    );
    this.rootElement.appendChild(cornerButtons);

    this.synchronizeModal();
  }

  /** Repaints the map's tokens in place (no walk) — e.g. after a roaming group is defeated. */
  rerenderGrid(playerLocationIdentifier: string, activeGroupLocations: readonly ZoneRoamingGroupLocation[]): void {
    this.playerLocationIdentifier = playerLocationIdentifier;
    this.activeGroupLocations = activeGroupLocations;
    this.redrawGrid?.();
  }

  /**
   * Glides the player token one road segment while every patrol token
   * glides one patrol stop in lockstep, then reports arrival. The sim has
   * already moved when this is called — `from*` are the pre-step
   * positions, and the screen's resting state is the post-step positions
   * throughout, so any mid-walk repaint stays consistent. Returns a cancel
   * function for teardown mid-walk.
   */
  animateWalkStep(
    fromPlayerLocationIdentifier: string,
    fromGroupLocations: readonly ZoneRoamingGroupLocation[],
    toPlayerLocationIdentifier: string,
    toGroupLocations: readonly ZoneRoamingGroupLocation[],
    durationMilliseconds: number,
    onArrived: () => void,
  ): () => void {
    const groupFromLocationIdentifiers: Record<string, string> = {};
    for (const group of fromGroupLocations) {
      groupFromLocationIdentifiers[group.groupIdentifier] = group.locationIdentifier;
    }
    this.playerLocationIdentifier = toPlayerLocationIdentifier;
    this.activeGroupLocations = toGroupLocations;
    return runTravelAnimationLoop(
      durationMilliseconds,
      (progress) => {
        this.walkAnimation = {
          progress,
          playerFromLocationIdentifier: fromPlayerLocationIdentifier,
          groupFromLocationIdentifiers,
        };
        this.redrawGrid?.();
      },
      () => {
        this.walkAnimation = undefined;
        this.redrawGrid?.();
        onArrived();
      },
    );
  }

  openCollisionMuster(encounterLabel: string, onConfirm: (deployedMemberIdentifiers: string[]) => void): void {
    this.musterState = { encounterLabel, onConfirm };
    this.selectedMemberIdentifiers.clear();
    this.synchronizeModal();
  }

  closeModal(): void {
    this.musterState = undefined;
    this.modal.forceClose();
  }

  private rerenderModal(): void {
    this.synchronizeModal();
  }

  private synchronizeModal(): void {
    if (this.musterState === undefined || this.lastGuild === undefined) {
      if (this.modal.isOpen()) {
        this.modal.close();
      }
      return;
    }
    const content = this.buildCollisionMusterContent(this.lastGuild, this.musterState);
    if (this.modal.isOpen()) {
      this.modal.refreshContent(content);
    } else {
      this.modal.open(content, () => {
        this.musterState = undefined;
      });
    }
  }

  private buildCollisionMusterContent(guild: GuildState, state: CollisionMusterState): HTMLElement {
    const root = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'guild-menu-title';
    title.textContent = state.encounterLabel;
    root.appendChild(title);
    root.appendChild(createHintParagraph('They have noticed you. Muster a patrol to fight, or close this to keep moving.'));

    const musterCards = buildMusterCardViewModels(guild, this.selectedMemberIdentifiers, this.content);
    const musterGrid = document.createElement('div');
    musterGrid.className = 'muster-grid';
    for (const card of musterCards) {
      musterGrid.appendChild(
        renderMusterCard(card, this.sounds, () => this.toggleMusterMember(card.memberIdentifier)),
      );
    }
    root.appendChild(musterGrid);

    root.appendChild(
      createSoundedButton(this.sounds, {
        label:
          this.selectedMemberIdentifiers.size === 0
            ? 'Select at least one member'
            : `Fight with ${this.selectedMemberIdentifiers.size}`,
        isDisabled: this.selectedMemberIdentifiers.size === 0,
        className: 'primary-action-button',
        onClick: () => {
          const deployed = [...this.selectedMemberIdentifiers];
          this.closeModal();
          state.onConfirm(deployed);
        },
      }),
    );
    return root;
  }

  private toggleMusterMember(memberIdentifier: string): void {
    const isSelected = this.selectedMemberIdentifiers.has(memberIdentifier);
    if (isSelected) {
      this.selectedMemberIdentifiers.delete(memberIdentifier);
      this.sounds.playMenuCancel();
    } else {
      if (this.selectedMemberIdentifiers.size >= BATTLE_PARTY_CAPACITY) {
        this.sounds.playMenuCancel();
        return;
      }
      this.selectedMemberIdentifiers.add(memberIdentifier);
      this.sounds.playMenuConfirm();
    }
    this.rerenderModal();
  }
}
