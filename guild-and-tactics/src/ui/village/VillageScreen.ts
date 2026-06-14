import { BATTLE_PARTY_CAPACITY, GUILD_ROSTER_CAPACITY, type GuildState } from '../../sim/guild/GuildState';
import type { QuestDefinition } from '../../sim/guild/QuestDefinition';
import type { ConsumableItemDefinition } from '../../sim/items/ConsumableItemDefinition';
import type { EquipmentDefinition, EquipmentSlot } from '../../sim/items/EquipmentDefinition';
import type { BattleMap } from '../../sim/grid/BattleMap';
import type { SkillDefinition } from '../../sim/battle/SkillDefinition';
import type { ClassIdentifier } from '../../sim/units/Unit';
import type { AdvancedClassDefinition, BaseClassDefinition, RaceDefinition } from '../../sim/units/UnitDefinitions';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import { buildCharacterSheetContent, buildClassPickerContent } from './CharacterSheet';
import { ModalDialog } from './ModalDialog';
import { buildQuestCardViewModels, buildQuestDetailViewModel } from './presenters/TavernPresenters';
import {
  buildInventoryViewModel,
  buildStoreCardViewModels,
  STORE_FILTER_ENTRIES,
  type StoreFilter,
} from './presenters/ItemCardPresenters';
import {
  buildMusterCardViewModels,
  buildRecruitCardViewModels,
  buildRosterCardViewModels,
} from './presenters/MemberPresenters';
import { renderQuestCard, renderQuestDetail } from './views/QuestViews';
import { renderItemCard, renderStoreCard } from './views/ItemCardView';
import { renderRecruitCard, renderRosterCard } from './views/MemberCardViews';
import { renderPillBar } from './views/PillBarView';
import { createCardList, createHintParagraph, createSectionTitle } from './views/DomPrimitives';

export interface VillageCallbacks {
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onBuyEquipment: (equipmentIdentifier: string) => void;
  onSellEquipment: (equipmentIdentifier: string) => void;
  onHireRecruit: (recruitMemberIdentifier: string) => void;
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: ClassIdentifier) => void;
}

export interface VillageContentTables {
  quests: Record<string, QuestDefinition>;
  items: Record<string, ConsumableItemDefinition>;
  equipment: Record<string, EquipmentDefinition>;
  skills: Record<string, SkillDefinition>;
  battleMapsByIdentifier: Record<string, { map: BattleMap }>;
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  advancedClasses: Record<string, AdvancedClassDefinition>;
}

type VillageTab = 'tavern' | 'store' | 'recruitment' | 'roster' | 'inventory';

type VillageModalState =
  | { kind: 'questDetail'; questIdentifier: string }
  | {
      kind: 'characterSheet';
      memberIdentifier: string;
      expandedEquipmentSlot: EquipmentSlot | undefined;
      view: 'sheet' | 'classPicker';
    };

const TAB_ENTRIES: { identifier: VillageTab; label: string }[] = [
  { identifier: 'tavern', label: 'Tavern' },
  { identifier: 'store', label: 'Store' },
  { identifier: 'recruitment', label: 'Recruitment Hall' },
  { identifier: 'roster', label: 'Roster' },
  { identifier: 'inventory', label: 'Inventory' },
];

export class VillageScreen {
  private readonly rootElement: HTMLElement;
  private readonly sounds: UserInterfaceSounds;
  private readonly callbacks: VillageCallbacks;
  private readonly content: VillageContentTables;
  private readonly modal: ModalDialog;
  private activeTab: VillageTab = 'tavern';
  private storeFilter: StoreFilter = 'all';
  private modalState: VillageModalState | undefined;
  private readonly selectedMemberIdentifiers = new Set<string>();
  private lastRenderedGuild: GuildState | undefined;

  constructor(
    rootElement: HTMLElement,
    sounds: UserInterfaceSounds,
    content: VillageContentTables,
    callbacks: VillageCallbacks,
  ) {
    this.rootElement = rootElement;
    this.sounds = sounds;
    this.content = content;
    this.callbacks = callbacks;
    this.modal = new ModalDialog(document.body, sounds);
  }

  render(guild: GuildState): void {
    this.lastRenderedGuild = guild;
    this.rootElement.replaceChildren();

    const header = document.createElement('header');
    header.className = 'village-header';
    header.innerHTML = `
      <h1>Wanderer's Rest</h1>
      <div class="village-header-stats">
        <span>Gold: <strong>${guild.gold}</strong></span>
        <span>Members: ${guild.roster.length} / ${GUILD_ROSTER_CAPACITY}</span>
        <span>Quests completed: ${guild.completedQuestCount}</span>
      </div>
    `;
    this.rootElement.appendChild(header);

    this.rootElement.appendChild(
      renderPillBar({
        entries: TAB_ENTRIES,
        activeIdentifier: this.activeTab,
        className: 'village-tab-bar',
        sounds: this.sounds,
        onSelect: (tab) => {
          this.activeTab = tab;
          this.render(guild);
        },
      }),
    );

    const tabContent = document.createElement('main');
    tabContent.className = 'village-tab-content';
    switch (this.activeTab) {
      case 'tavern':
        this.renderTavern(tabContent, guild);
        break;
      case 'store':
        this.renderStore(tabContent, guild);
        break;
      case 'recruitment':
        this.renderRecruitment(tabContent, guild);
        break;
      case 'roster':
        this.renderRoster(tabContent, guild);
        break;
      case 'inventory':
        this.renderInventory(tabContent, guild);
        break;
    }
    this.rootElement.appendChild(tabContent);
    this.synchronizeModalWithState(guild);
  }

  private rerender(): void {
    if (this.lastRenderedGuild !== undefined) {
      this.render(this.lastRenderedGuild);
    }
  }

  private synchronizeModalWithState(guild: GuildState): void {
    if (this.modalState === undefined) {
      if (this.modal.isOpen()) {
        this.modal.close();
      }
      return;
    }
    const modalContent = this.buildModalContent(guild, this.modalState);
    if (modalContent === undefined) {
      this.modalState = undefined;
      this.modal.close();
      return;
    }
    if (this.modal.isOpen()) {
      this.modal.refreshContent(modalContent);
    } else {
      this.modal.open(
        modalContent,
        () => {
          this.modalState = undefined;
        },
        { closeable: this.modalState.kind === 'characterSheet' },
      );
    }
  }

  private buildModalContent(
    guild: GuildState,
    modalState: VillageModalState,
  ): HTMLElement | undefined {
    if (modalState.kind === 'questDetail') {
      const quest = this.content.quests[modalState.questIdentifier];
      if (quest === undefined) return undefined;
      return this.buildQuestDetailContent(guild, quest);
    }
    const member = guild.roster.find(
      (rosterMember) => rosterMember.identifier === modalState.memberIdentifier,
    );
    if (member === undefined) return undefined;
    const race = this.content.races[member.raceIdentifier];
    if (race === undefined) return undefined;

    if (modalState.view === 'classPicker') {
      return buildClassPickerContent(member, race, this.content, {
        onGoBack: () => {
          if (this.modalState?.kind === 'characterSheet') {
            this.modalState.view = 'sheet';
          }
          this.rerender();
        },
        onChangeClass: (memberIdentifier, classIdentifier) => {
          this.sounds.playMenuConfirm();
          this.callbacks.onChangeClass(memberIdentifier, classIdentifier);
        },
      });
    }

    return buildCharacterSheetContent(
      member,
      guild,
      this.content,
      modalState.expandedEquipmentSlot,
      {
        onEquipItem: (memberIdentifier, equipmentIdentifier) => {
          this.sounds.playMenuConfirm();
          this.callbacks.onEquipItem(memberIdentifier, equipmentIdentifier);
        },
        onUnequipSlot: (memberIdentifier, slot) => {
          this.sounds.playMenuCancel();
          this.callbacks.onUnequipSlot(memberIdentifier, slot);
        },
        onToggleSlotPicker: (slot) => {
          this.sounds.playMenuConfirm();
          if (this.modalState?.kind === 'characterSheet') {
            this.modalState.expandedEquipmentSlot =
              this.modalState.expandedEquipmentSlot === slot ? undefined : slot;
          }
          this.rerender();
        },
        onChangeClass: (memberIdentifier, classIdentifier) => {
          this.sounds.playMenuConfirm();
          this.callbacks.onChangeClass(memberIdentifier, classIdentifier);
        },
        onOpenClassPicker: () => {
          this.sounds.playMenuConfirm();
          if (this.modalState?.kind === 'characterSheet') {
            this.modalState.view = 'classPicker';
          }
          this.rerender();
        },
      },
    );
  }

  private renderTavern(container: HTMLElement, guild: GuildState): void {
    container.appendChild(
      createHintParagraph('Postings on the board — pick one to read it and muster a party.'),
    );
    const questList = createCardList();
    for (const viewModel of buildQuestCardViewModels(guild, this.content)) {
      questList.appendChild(
        renderQuestCard(viewModel, this.sounds, () => {
          this.modalState = { kind: 'questDetail', questIdentifier: viewModel.questIdentifier };
          this.rerender();
        }),
      );
    }
    container.appendChild(questList);
  }

  private buildQuestDetailContent(guild: GuildState, quest: QuestDefinition): HTMLElement {
    const viewModel = buildQuestDetailViewModel(
      quest,
      this.selectedMemberIdentifiers.size,
      this.content,
    );
    const musterCards = buildMusterCardViewModels(guild, this.selectedMemberIdentifiers, this.content);
    return renderQuestDetail(viewModel, musterCards, this.sounds, {
      onToggleMember: (memberIdentifier) => {
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
        this.rerender();
      },
      onEmbark: () => {
        this.modalState = undefined;
        this.modal.forceClose();
        this.callbacks.onEmbarkQuest(quest.identifier, [...this.selectedMemberIdentifiers]);
      },
    });
  }

  private renderStore(container: HTMLElement, guild: GuildState): void {
    container.appendChild(
      renderPillBar({
        entries: STORE_FILTER_ENTRIES,
        activeIdentifier: this.storeFilter,
        className: 'store-filter-bar',
        sounds: this.sounds,
        onSelect: (filter) => {
          this.storeFilter = filter;
          this.rerender();
        },
      }),
    );
    const storeList = createCardList();
    for (const viewModel of buildStoreCardViewModels(guild, this.content, this.storeFilter)) {
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
    container.appendChild(storeList);
  }

  private renderRecruitment(container: HTMLElement, guild: GuildState): void {
    const recruitCards = buildRecruitCardViewModels(guild, this.content);
    if (recruitCards.length === 0) {
      container.appendChild(
        createHintParagraph(
          'The hall is quiet. New faces arrive after the next completed quest.',
        ),
      );
      return;
    }
    const recruitList = createCardList();
    for (const viewModel of recruitCards) {
      recruitList.appendChild(
        renderRecruitCard(viewModel, this.sounds, () => {
          this.callbacks.onHireRecruit(viewModel.memberIdentifier);
        }),
      );
    }
    container.appendChild(recruitList);
  }

  private renderRoster(container: HTMLElement, guild: GuildState): void {
    container.appendChild(
      createHintParagraph(
        'Select a member to open their character sheet and manage equipment.',
      ),
    );
    const rosterList = createCardList();
    for (const viewModel of buildRosterCardViewModels(guild, this.content)) {
      rosterList.appendChild(
        renderRosterCard(viewModel, this.sounds, () => {
          this.modalState = {
            kind: 'characterSheet',
            memberIdentifier: viewModel.memberIdentifier,
            expandedEquipmentSlot: undefined,
            view: 'sheet',
          };
          this.rerender();
        }),
      );
    }
    container.appendChild(rosterList);
  }

  private renderInventory(container: HTMLElement, guild: GuildState): void {
    const { consumableCards, equipmentCards } = buildInventoryViewModel(guild, this.content);

    container.appendChild(createSectionTitle('Consumables'));
    const consumablesList = createCardList();
    for (const viewModel of consumableCards) {
      consumablesList.appendChild(renderItemCard(viewModel));
    }
    if (consumablesList.childElementCount === 0) {
      consumablesList.appendChild(
        createHintParagraph('No consumables — the store sells potions and ethers.'),
      );
    }
    container.appendChild(consumablesList);

    container.appendChild(createSectionTitle('Equipment'));
    const equipmentList = createCardList();
    for (const viewModel of equipmentCards) {
      equipmentList.appendChild(renderItemCard(viewModel));
    }
    if (equipmentList.childElementCount === 0) {
      equipmentList.appendChild(
        createHintParagraph('No equipment owned yet — visit the store.'),
      );
    }
    container.appendChild(equipmentList);
  }
}
