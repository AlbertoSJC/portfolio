import type { SkillDefinition } from '../../../sim/battle/SkillDefinition';
import type { BattleMap } from '../../../sim/grid/BattleMap';
import { BATTLE_PARTY_CAPACITY, type GuildState } from '../../../sim/guild/GuildState';
import type { QuestDefinition } from '../../../sim/guild/QuestDefinition';
import type { ZoneDefinition } from '../../../sim/guild/ZoneDefinition';
import type { ConsumableItemDefinition } from '../../../sim/items/ConsumableItemDefinition';
import type { EquipmentDefinition } from '../../../sim/items/EquipmentDefinition';
import type { AdvancedClassDefinition, BaseClassDefinition, RaceDefinition } from '../../../sim/units/UnitDefinitions';
import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { GuildMenu, type GuildMenuCallbacks } from '../../guild/GuildMenu';
import {
  buildStoreCardViewModels,
  STORE_FILTER_ENTRIES,
  type StoreFilter,
} from '../../village/presenters/ItemCardPresenters';
import { buildMusterCardViewModels } from '../../village/presenters/MemberPresenters';
import { buildQuestCardViewModels, buildQuestDetailViewModel } from '../../village/presenters/TavernPresenters';
import { createCardList, createHintParagraph } from '../../village/views/DomPrimitives';
import { renderStoreCard } from '../../village/views/ItemCardView';
import { renderPillBar } from '../../village/views/PillBarView';
import { renderQuestCard, renderQuestDetail } from '../../village/views/QuestViews';
import { createSoundedButton } from '../../village/views/SoundedButton';
import { createOverworldMapCanvas, type MapNodeEntry } from '../OverworldMapCanvas';

export interface ZoneContentTables {
  quests: Record<string, QuestDefinition>;
  items: Record<string, ConsumableItemDefinition>;
  equipment: Record<string, EquipmentDefinition>;
  battleMapsByIdentifier: Record<string, { map: BattleMap }>;
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  advancedClasses: Record<string, AdvancedClassDefinition>;
  skills: Record<string, SkillDefinition>;
}

export interface TownScreenCallbacks extends GuildMenuCallbacks {
  onLeaveTown: () => void;
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onBuyEquipment: (equipmentIdentifier: string) => void;
  onSellEquipment: (equipmentIdentifier: string) => void;
}

type TownContentState =
  | { kind: 'tavern'; questDetailIdentifier: string | undefined }
  | { kind: 'store'; storeFilter: StoreFilter }
  | { kind: 'guild' };

type TownPanelContentState = Exclude<TownContentState, { kind: 'guild' }>;

// Pushed down (high y) so the upper half of the screen is free for the
// content panel — the building nodes stay visible and clickable below it,
// no matter what (or whether) the panel is currently showing.
const TOWN_BUILDINGS: MapNodeEntry[] = [
  { identifier: 'tavern', label: 'Tavern', sublabel: 'Quests', kind: 'tavern', position: { x: 0.12, y: 0.86 } },
  { identifier: 'store', label: 'Store', sublabel: 'Buy & Sell', kind: 'store', position: { x: 0.5, y: 0.86 } },
  { identifier: 'guild', label: 'Guild Hall', sublabel: 'Roster', kind: 'guild', position: { x: 0.88, y: 0.86 } },
];

/**
 * A zone's town: a full-bleed building-map (Tavern + Store + Guild Hall),
 * its nodes pushed toward the bottom of the screen. Picking a building
 * shows its content — quest board, store, or the Guild's roster/inventory/
 * recruitment — directly in the freed-up space above the nodes, as a
 * panel that's part of this same screen, not a separate modal/overlay
 * layer — the nodes stay visible and clickable the whole time, so
 * switching between buildings never requires closing anything first.
 * Guild Hall reuses `GuildMenu`'s content-building (the same class also
 * used for the global "Guild" corner button reachable from the World Map/
 * Zone screens, where there's no docked panel to embed it in — that path
 * still opens it as a modal), just hosted in this panel instead of a
 * modal, via `GuildMenuHost`'s onOpen/onUpdate hooks.
 */
export class TownScreen {
  private readonly rootElement: HTMLElement;
  private readonly sounds: UserInterfaceSounds;
  private readonly content: ZoneContentTables;
  private readonly callbacks: TownScreenCallbacks;
  private readonly guildMenu: GuildMenu;
  private contentPanelElement: HTMLElement | undefined;
  private currentZone: ZoneDefinition | undefined;
  private lastGuild: GuildState | undefined;
  private contentState: TownContentState | undefined;
  private readonly selectedMemberIdentifiers = new Set<string>();

  constructor(
    rootElement: HTMLElement,
    sounds: UserInterfaceSounds,
    content: ZoneContentTables,
    callbacks: TownScreenCallbacks,
  ) {
    this.rootElement = rootElement;
    this.sounds = sounds;
    this.content = content;
    this.callbacks = callbacks;
    this.guildMenu = new GuildMenu(sounds, content, callbacks, {
      onOpen: (guildContent) => {
        this.contentState = { kind: 'guild' };
        this.showContentPanel(guildContent);
      },
      onUpdate: (guildContent) => {
        if (this.contentState?.kind === 'guild') {
          this.showContentPanel(guildContent);
        }
      },
    });
  }

  render(zone: ZoneDefinition, guild: GuildState): void {
    this.currentZone = zone;
    this.lastGuild = guild;
    this.rootElement.replaceChildren();

    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-fullbleed-canvas-container';
    mapContainer.appendChild(
      createOverworldMapCanvas(TOWN_BUILDINGS, this.sounds, (buildingIdentifier) => {
        this.openBuilding(buildingIdentifier);
      }),
    );
    this.rootElement.appendChild(mapContainer);

    const plaque = document.createElement('div');
    plaque.className = 'map-location-plaque';
    plaque.innerHTML = `
      <h1>${zone.displayName} — Town</h1>
      <p>Wares and work, away from the road.</p>
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
        label: 'Leave Town',
        className: 'map-corner-button',
        onClick: () => this.callbacks.onLeaveTown(),
      }),
    );
    this.rootElement.appendChild(cornerButtons);

    this.contentPanelElement = document.createElement('div');
    this.contentPanelElement.className = 'town-content-panel hidden';
    this.rootElement.appendChild(this.contentPanelElement);

    if (this.contentState?.kind === 'guild') {
      // contentPanelElement was just rebuilt from scratch above — repaint
      // the Guild content into it via the same host hook a tab switch uses.
      this.guildMenu.refresh(guild);
    } else {
      this.renderContentPanel();
    }
  }

  /** Re-renders with fresh guild data (e.g. after a purchase) without losing the open panel's identity. */
  refreshGuild(guild: GuildState): void {
    if (this.currentZone === undefined) return;
    this.render(this.currentZone, guild);
  }

  /** Opens the Tavern's quest board directly — call right after entering Town. */
  openTavern(): void {
    this.openBuilding('tavern');
  }

  private openBuilding(buildingIdentifier: string): void {
    this.selectedMemberIdentifiers.clear();
    if (buildingIdentifier === 'tavern') {
      this.contentState = { kind: 'tavern', questDetailIdentifier: undefined };
      this.renderContentPanel();
    } else if (buildingIdentifier === 'store') {
      this.contentState = { kind: 'store', storeFilter: 'all' };
      this.renderContentPanel();
    } else if (buildingIdentifier === 'guild' && this.lastGuild !== undefined) {
      this.guildMenu.open(this.lastGuild);
    }
  }

  private closeContentPanel(): void {
    this.contentState = undefined;
    this.renderContentPanel();
  }

  private rerenderContent(): void {
    this.renderContentPanel();
  }

  /** Shows the panel with a close button in front of the given content — shared by Tavern/Store and the embedded GuildMenu's host hooks. */
  private showContentPanel(content: HTMLElement): void {
    if (this.contentPanelElement === undefined) return;
    this.contentPanelElement.classList.remove('hidden');
    const closeButton = document.createElement('button');
    closeButton.className = 'town-content-panel-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      this.sounds.playMenuCancel();
      this.closeContentPanel();
    });
    this.contentPanelElement.replaceChildren(closeButton, content);
  }

  /** Rebuilds the Tavern/Store content panel in place, or hides it entirely when nothing is selected. Guild content is handled by GuildMenu's own host hooks instead. */
  private renderContentPanel(): void {
    if (this.contentPanelElement === undefined) return;
    const state = this.contentState;
    if (state === undefined) {
      this.contentPanelElement.classList.add('hidden');
      this.contentPanelElement.replaceChildren();
      return;
    }
    if (state.kind === 'guild') return;
    if (this.lastGuild === undefined || this.currentZone === undefined) return;
    this.showContentPanel(this.buildContentElement(this.lastGuild, this.currentZone, state));
  }

  private buildContentElement(guild: GuildState, zone: ZoneDefinition, state: TownPanelContentState): HTMLElement {
    if (state.kind === 'store') {
      return this.buildStoreContent(guild, zone.identifier, state.storeFilter);
    }
    if (state.questDetailIdentifier !== undefined) {
      const quest = this.content.quests[state.questDetailIdentifier];
      if (quest !== undefined) {
        return this.buildQuestDetailElement(guild, quest);
      }
    }
    return this.buildQuestListContent(guild, zone.identifier);
  }

  private buildQuestListContent(guild: GuildState, zoneIdentifier: string): HTMLElement {
    const root = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'guild-menu-title';
    title.textContent = 'Tavern';
    root.appendChild(title);
    root.appendChild(
      createHintParagraph('Postings on the board — pick one to read it and muster a party.'),
    );
    const questList = createCardList();
    for (const viewModel of buildQuestCardViewModels(guild, zoneIdentifier, this.content)) {
      questList.appendChild(
        renderQuestCard(viewModel, this.sounds, () => {
          if (this.contentState?.kind === 'tavern') {
            this.contentState.questDetailIdentifier = viewModel.questIdentifier;
          }
          this.selectedMemberIdentifiers.clear();
          this.rerenderContent();
        }),
      );
    }
    root.appendChild(questList);
    return root;
  }

  private buildQuestDetailElement(guild: GuildState, quest: QuestDefinition): HTMLElement {
    const viewModel = buildQuestDetailViewModel(quest, this.selectedMemberIdentifiers.size, this.content);
    const musterCards = buildMusterCardViewModels(guild, this.selectedMemberIdentifiers, this.content);
    return renderQuestDetail(viewModel, musterCards, this.sounds, {
      onToggleMember: (memberIdentifier) => this.toggleMusterMember(memberIdentifier),
      onEmbark: () => {
        this.contentState = undefined;
        this.callbacks.onEmbarkQuest(quest.identifier, [...this.selectedMemberIdentifiers]);
      },
    });
  }

  private buildStoreContent(guild: GuildState, zoneIdentifier: string, storeFilter: StoreFilter): HTMLElement {
    const root = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'guild-menu-title';
    title.textContent = 'Store';
    root.appendChild(title);
    root.appendChild(
      renderPillBar({
        entries: STORE_FILTER_ENTRIES,
        activeIdentifier: storeFilter,
        className: 'store-filter-bar',
        sounds: this.sounds,
        onSelect: (filter) => {
          if (this.contentState?.kind === 'store') {
            this.contentState.storeFilter = filter;
          }
          this.rerenderContent();
        },
      }),
    );
    const storeList = createCardList();
    for (const viewModel of buildStoreCardViewModels(guild, zoneIdentifier, this.content, storeFilter)) {
      storeList.appendChild(
        renderStoreCard(viewModel, this.sounds, {
          onBuy: () =>
            viewModel.merchandiseKind === 'consumable'
              ? this.callbacks.onBuyItem(viewModel.merchandiseIdentifier)
              : this.callbacks.onBuyEquipment(viewModel.merchandiseIdentifier),
          onSell: () =>
            viewModel.merchandiseKind === 'consumable'
              ? this.callbacks.onSellItem(viewModel.merchandiseIdentifier)
              : this.callbacks.onSellEquipment(viewModel.merchandiseIdentifier),
        }),
      );
    }
    root.appendChild(storeList);
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
    this.rerenderContent();
  }
}
