import type { BattleMap } from '../../../sim/grid/BattleMap';
import { BATTLE_PARTY_CAPACITY, type GuildState } from '../../../sim/guild/GuildState';
import type { QuestDefinition } from '../../../sim/guild/QuestDefinition';
import type { ZoneDefinition } from '../../../sim/guild/ZoneDefinition';
import type { ConsumableItemDefinition } from '../../../sim/items/ConsumableItemDefinition';
import type { EquipmentDefinition } from '../../../sim/items/EquipmentDefinition';
import type { BaseClassDefinition, RaceDefinition } from '../../../sim/units/UnitDefinitions';
import type { UserInterfaceSounds } from '../../UserInterfaceSounds';
import { ModalDialog } from '../../village/ModalDialog';
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
}

export interface TownScreenCallbacks {
  onOpenGuildMenu: () => void;
  onLeaveTown: () => void;
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onBuyEquipment: (equipmentIdentifier: string) => void;
  onSellEquipment: (equipmentIdentifier: string) => void;
}

type TownModalState =
  | { kind: 'tavern'; questDetailIdentifier: string | undefined }
  | { kind: 'store'; storeFilter: StoreFilter };

const TOWN_BUILDINGS: MapNodeEntry[] = [
  { identifier: 'tavern', label: 'Tavern', sublabel: 'Quests', kind: 'tavern' },
  { identifier: 'store', label: 'Store', sublabel: 'Buy & Sell', kind: 'store' },
  { identifier: 'guild', label: 'Guild Hall', sublabel: 'Roster', kind: 'guild' },
];

/**
 * A zone's town: a full-bleed building-map (Tavern + Store + Guild Hall),
 * the way walking onto the tavern tile used to just pop a two-tab modal.
 * Mirrors the old (retired) `VillageScreen`'s pattern. The Guild Hall node
 * opens the same global Guild menu reachable everywhere else — it's shown
 * here as a building (clearer in a town context) rather than only as a
 * corner button; the guild itself still has no fixed home.
 */
export class TownScreen {
  private readonly rootElement: HTMLElement;
  private readonly sounds: UserInterfaceSounds;
  private readonly content: ZoneContentTables;
  private readonly callbacks: TownScreenCallbacks;
  private readonly modal: ModalDialog;
  private currentZone: ZoneDefinition | undefined;
  private lastGuild: GuildState | undefined;
  private modalState: TownModalState | undefined;
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
    this.modal = new ModalDialog(document.body, sounds);
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

    this.synchronizeModal();
  }

  /** Re-renders with fresh guild data (e.g. after a purchase) without touching the open modal's identity. */
  refreshGuild(guild: GuildState): void {
    if (this.currentZone === undefined) return;
    this.render(this.currentZone, guild);
  }

  /** Opens the Tavern's quest board directly — call right after entering Town. */
  openTavern(): void {
    this.openBuilding('tavern');
  }

  private openBuilding(buildingIdentifier: string): void {
    if (buildingIdentifier === 'guild') {
      this.callbacks.onOpenGuildMenu();
      return;
    }
    this.selectedMemberIdentifiers.clear();
    if (buildingIdentifier === 'tavern') {
      this.modalState = { kind: 'tavern', questDetailIdentifier: undefined };
    } else if (buildingIdentifier === 'store') {
      this.modalState = { kind: 'store', storeFilter: 'all' };
    } else {
      return;
    }
    this.synchronizeModal();
  }

  private rerenderModal(): void {
    this.synchronizeModal();
  }

  private synchronizeModal(): void {
    if (this.modalState === undefined || this.lastGuild === undefined || this.currentZone === undefined) {
      if (this.modal.isOpen()) {
        this.modal.close();
      }
      return;
    }
    const content = this.buildModalContent(this.lastGuild, this.currentZone, this.modalState);
    if (this.modal.isOpen()) {
      this.modal.refreshContent(content);
    } else {
      this.modal.open(content, () => {
        this.modalState = undefined;
      });
    }
  }

  private buildModalContent(guild: GuildState, zone: ZoneDefinition, state: TownModalState): HTMLElement {
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
          if (this.modalState?.kind === 'tavern') {
            this.modalState.questDetailIdentifier = viewModel.questIdentifier;
          }
          this.selectedMemberIdentifiers.clear();
          this.rerenderModal();
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
        this.modalState = undefined;
        this.modal.forceClose();
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
          if (this.modalState?.kind === 'store') {
            this.modalState.storeFilter = filter;
          }
          this.rerenderModal();
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
    this.rerenderModal();
  }
}
