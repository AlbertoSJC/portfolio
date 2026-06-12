import {
  BATTLE_PARTY_CAPACITY,
  GUILD_ROSTER_CAPACITY,
  canAffordGoldCost,
  countConsumable,
  countEquipmentPieces,
  hasRoomInRoster,
  type GuildMember,
  type GuildState,
  type RecruitOffer,
} from '../../sim/guild/GuildState';
import type { QuestDefinition } from '../../sim/guild/QuestDefinition';
import type { ConsumableItemDefinition } from '../../sim/items/ConsumableItemDefinition';
import { sellPriceForItem } from '../../sim/items/ConsumableItemDefinition';
import {
  EQUIPMENT_SLOT_DISPLAY_NAMES,
  sellPriceForEquipment,
  type EquipmentDefinition,
  type EquipmentSlot,
} from '../../sim/items/EquipmentDefinition';
import { experienceRequiredToLevelUpFrom } from '../../sim/progression/ExperienceAndLevels';
import { storeStockOf } from '../../sim/guild/StoreStock';
import type { BattleMap } from '../../sim/grid/BattleMap';
import type { SkillDefinition } from '../../sim/battle/SkillDefinition';
import type { BaseClassIdentifier } from '../../sim/units/Unit';
import type { BaseClassDefinition, RaceDefinition } from '../../sim/units/UnitDefinitions';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import {
  buildCharacterSheetContent,
  describeStatisticBonuses,
} from './CharacterSheet';
import { createItemIconCanvas, iconKindForConsumable, iconKindForEquipment } from './ItemIcons';
import { createMemberPortraitCanvas } from './MemberPortrait';
import { ModalDialog } from './ModalDialog';

export interface VillageCallbacks {
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onBuyEquipment: (equipmentIdentifier: string) => void;
  onSellEquipment: (equipmentIdentifier: string) => void;
  onHireRecruit: (recruitMemberIdentifier: string) => void;
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: BaseClassIdentifier) => void;
}

/** Content the village needs for display, injected so the UI stays data-driven. */
export interface VillageContentTables {
  quests: Record<string, QuestDefinition>;
  items: Record<string, ConsumableItemDefinition>;
  equipment: Record<string, EquipmentDefinition>;
  skills: Record<string, SkillDefinition>;
  battleMapsByIdentifier: Record<string, { map: BattleMap }>;
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
}

type VillageTab = 'tavern' | 'store' | 'recruitment' | 'roster';

type StoreFilter = 'all' | 'consumables' | EquipmentSlot;

const STORE_FILTER_LABELS: [StoreFilter, string][] = [
  ['all', 'All'],
  ['consumables', 'Consumables'],
  ['weapon', 'Weapons'],
  ['armor', 'Armor'],
  ['accessory', 'Accessories'],
];

type VillageModalState =
  | { kind: 'questDetail'; questIdentifier: string }
  | {
      kind: 'characterSheet';
      memberIdentifier: string;
      expandedEquipmentSlot: EquipmentSlot | undefined;
    };

const DIFFICULTY_RANK_LABELS: Record<number, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
};

/**
 * Wanderer's Rest: the guild-loop screen. Renders from GuildState and
 * content tables, never mutates them — player intent flows out through
 * the callbacks and the GameController re-renders after each change.
 */
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

    const tabBar = document.createElement('nav');
    tabBar.className = 'village-tab-bar';
    const tabLabels: [VillageTab, string][] = [
      ['tavern', 'Tavern'],
      ['store', 'Store'],
      ['recruitment', 'Recruitment Hall'],
      ['roster', 'Roster'],
    ];
    for (const [tab, label] of tabLabels) {
      const tabButton = document.createElement('button');
      tabButton.textContent = label;
      tabButton.className = tab === this.activeTab ? 'is-active' : '';
      tabButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      tabButton.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.activeTab = tab;
        this.render(guild);
      });
      tabBar.appendChild(tabButton);
    }
    this.rootElement.appendChild(tabBar);

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
    }
    this.rootElement.appendChild(tabContent);
    this.synchronizeModalWithState(guild);
  }

  private rerender(): void {
    if (this.lastRenderedGuild !== undefined) {
      this.render(this.lastRenderedGuild);
    }
  }

  // ── Modal management ─────────────────────────────────────────────────

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
      this.modal.open(modalContent, () => {
        this.modalState = undefined;
      });
    }
  }

  private buildModalContent(
    guild: GuildState,
    modalState: VillageModalState,
  ): HTMLElement | undefined {
    if (modalState.kind === 'questDetail') {
      const quest = this.content.quests[modalState.questIdentifier];
      return quest === undefined ? undefined : this.buildQuestDetailContent(guild, quest);
    }
    const member = guild.roster.find(
      (rosterMember) => rosterMember.identifier === modalState.memberIdentifier,
    );
    if (member === undefined) {
      return undefined;
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
      },
    );
  }

  // ── Tavern ───────────────────────────────────────────────────────────

  private renderTavern(container: HTMLElement, guild: GuildState): void {
    const boardHint = document.createElement('p');
    boardHint.className = 'village-hint';
    boardHint.textContent = 'Postings on the board — pick one to read it and muster a party.';
    container.appendChild(boardHint);

    const questList = document.createElement('div');
    questList.className = 'village-card-list';
    for (const questIdentifier of guild.questIdentifiersOnBoard) {
      const quest = this.content.quests[questIdentifier];
      if (quest === undefined) {
        continue;
      }
      const mapEntry = this.content.battleMapsByIdentifier[quest.battleMapIdentifier];
      const questCard = document.createElement('button');
      questCard.className = 'village-card';
      questCard.innerHTML = `
        <h3>${quest.displayName} <span class="difficulty-stars">${DIFFICULTY_RANK_LABELS[quest.difficultyRank] ?? ''}</span></h3>
        <p>${mapEntry?.map.displayName ?? quest.battleMapIdentifier} · ${quest.enemySpawns.length} foes</p>
        <p>Reward: ${quest.rewardGold} gold · ${quest.rewardExperience} XP</p>
      `;
      questCard.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      questCard.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.modalState = { kind: 'questDetail', questIdentifier };
        this.rerender();
      });
      questList.appendChild(questCard);
    }
    container.appendChild(questList);
  }

  private buildQuestDetailContent(guild: GuildState, quest: QuestDefinition): HTMLElement {
    const mapEntry = this.content.battleMapsByIdentifier[quest.battleMapIdentifier];
    const questContent = document.createElement('div');
    questContent.className = 'quest-detail';
    questContent.innerHTML = `
      <h2>${quest.displayName} <span class="difficulty-stars">${DIFFICULTY_RANK_LABELS[quest.difficultyRank] ?? ''}</span></h2>
      <p class="quest-description">${quest.description}</p>
      <p>${mapEntry?.map.displayName ?? quest.battleMapIdentifier} · ${quest.enemySpawns.length} foes · Reward: ${quest.rewardGold} gold, ${quest.rewardExperience} XP</p>
      <p class="menu-section-title">Muster the party — ${this.selectedMemberIdentifiers.size} / ${BATTLE_PARTY_CAPACITY} selected</p>
    `;

    const musterGrid = document.createElement('div');
    musterGrid.className = 'muster-grid';
    for (const member of guild.roster) {
      musterGrid.appendChild(this.buildMusterCard(member));
    }
    questContent.appendChild(musterGrid);

    const embarkButton = document.createElement('button');
    embarkButton.className = 'primary-action-button';
    const selectedCount = this.selectedMemberIdentifiers.size;
    embarkButton.textContent =
      selectedCount === 0 ? 'Select at least one member' : `Embark with ${selectedCount}`;
    embarkButton.disabled = selectedCount === 0;
    embarkButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
    embarkButton.addEventListener('click', () => {
      this.sounds.playMenuConfirm();
      this.callbacks.onEmbarkQuest(quest.identifier, [...this.selectedMemberIdentifiers]);
    });
    questContent.appendChild(embarkButton);
    return questContent;
  }

  private buildMusterCard(member: GuildMember): HTMLElement {
    const isSelected = this.selectedMemberIdentifiers.has(member.identifier);
    const musterCard = document.createElement('button');
    musterCard.className = `muster-card ${isSelected ? 'is-selected' : ''}`;
    musterCard.appendChild(this.buildPortraitFor(member));
    const cardText = document.createElement('div');
    cardText.innerHTML = `
      <strong>${member.displayName}</strong>
      <span>${this.describeMember(member)}</span>
    `;
    musterCard.appendChild(cardText);
    musterCard.addEventListener('mouseenter', () => this.sounds.playMenuHover());
    musterCard.addEventListener('click', () => {
      if (isSelected) {
        this.selectedMemberIdentifiers.delete(member.identifier);
        this.sounds.playMenuCancel();
      } else {
        if (this.selectedMemberIdentifiers.size >= BATTLE_PARTY_CAPACITY) {
          this.sounds.playMenuCancel();
          return;
        }
        this.selectedMemberIdentifiers.add(member.identifier);
        this.sounds.playMenuConfirm();
      }
      this.rerender();
    });
    return musterCard;
  }

  // ── Store ────────────────────────────────────────────────────────────

  private renderStore(container: HTMLElement, guild: GuildState): void {
    const filterBar = document.createElement('nav');
    filterBar.className = 'store-filter-bar';
    for (const [filter, label] of STORE_FILTER_LABELS) {
      const filterButton = document.createElement('button');
      filterButton.textContent = label;
      filterButton.className = filter === this.storeFilter ? 'is-active' : '';
      filterButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      filterButton.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.storeFilter = filter;
        this.rerender();
      });
      filterBar.appendChild(filterButton);
    }
    container.appendChild(filterBar);

    const storeList = document.createElement('div');
    storeList.className = 'village-card-list';

    if (this.storeFilter === 'all' || this.storeFilter === 'consumables') {
      for (const item of Object.values(this.content.items)) {
        storeList.appendChild(
          this.buildStoreCard(
            guild,
            createItemIconCanvas(iconKindForConsumable(item)),
            item.displayName,
            item.description,
            `Price: ${item.priceInGold} gold · Stock: ${storeStockOf(guild, item.identifier)} · Owned: ${countConsumable(guild, item.identifier)}`,
            item.priceInGold,
            sellPriceForItem(item),
            storeStockOf(guild, item.identifier),
            countConsumable(guild, item.identifier) > 0,
            () => this.callbacks.onBuyItem(item.identifier),
            () => this.callbacks.onSellItem(item.identifier),
          ),
        );
      }
    }

    for (const equipment of Object.values(this.content.equipment)) {
      const matchesFilter = this.storeFilter === 'all' || this.storeFilter === equipment.slot;
      if (!matchesFilter) {
        continue;
      }
      const classRestrictionNote =
        equipment.allowedBaseClasses === undefined
          ? 'Anyone'
          : equipment.allowedBaseClasses
              .map((classIdentifier) => this.content.baseClasses[classIdentifier]?.displayName ?? classIdentifier)
              .join(', ');
      storeList.appendChild(
        this.buildStoreCard(
          guild,
          createItemIconCanvas(iconKindForEquipment(equipment)),
          `${equipment.displayName} (${describeStatisticBonuses(equipment.statisticBonuses)})`,
          equipment.description,
          `${EQUIPMENT_SLOT_DISPLAY_NAMES[equipment.slot]} · ${classRestrictionNote} · Price: ${equipment.priceInGold} gold · Stock: ${storeStockOf(guild, equipment.identifier)} · In stores: ${countEquipmentPieces(guild, equipment.identifier)}`,
          equipment.priceInGold,
          sellPriceForEquipment(equipment),
          storeStockOf(guild, equipment.identifier),
          countEquipmentPieces(guild, equipment.identifier) > 0,
          () => this.callbacks.onBuyEquipment(equipment.identifier),
          () => this.callbacks.onSellEquipment(equipment.identifier),
        ),
      );
    }
    container.appendChild(storeList);
  }

  private buildStoreCard(
    guild: GuildState,
    iconCanvas: HTMLCanvasElement,
    title: string,
    description: string,
    detailLine: string,
    buyPrice: number,
    sellPrice: number,
    stockRemaining: number,
    canSell: boolean,
    onBuy: () => void,
    onSell: () => void,
  ): HTMLElement {
    const storeCard = document.createElement('div');
    storeCard.className = 'village-card with-portrait';
    storeCard.appendChild(iconCanvas);
    const cardBody = document.createElement('div');
    cardBody.innerHTML = `<h3>${title}</h3><p>${description}</p><p>${detailLine}</p>`;
    storeCard.appendChild(cardBody);
    const buttonRow = document.createElement('div');
    buttonRow.className = 'village-card-buttons';
    const buyButton = document.createElement('button');
    buyButton.textContent = stockRemaining < 1 ? 'Out of stock' : `Buy (${buyPrice}g)`;
    buyButton.disabled = !canAffordGoldCost(guild, buyPrice) || stockRemaining < 1;
    buyButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
    buyButton.addEventListener('click', () => {
      this.sounds.playMenuConfirm();
      onBuy();
    });
    const sellButton = document.createElement('button');
    sellButton.textContent = `Sell (${sellPrice}g)`;
    sellButton.disabled = !canSell;
    sellButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
    sellButton.addEventListener('click', () => {
      this.sounds.playMenuConfirm();
      onSell();
    });
    buttonRow.append(buyButton, sellButton);
    cardBody.appendChild(buttonRow);
    return storeCard;
  }

  // ── Recruitment hall ─────────────────────────────────────────────────

  private renderRecruitment(container: HTMLElement, guild: GuildState): void {
    if (guild.recruitsOnOffer.length === 0) {
      const emptyNote = document.createElement('p');
      emptyNote.className = 'village-hint';
      emptyNote.textContent = 'The hall is quiet. New faces arrive after the next completed quest.';
      container.appendChild(emptyNote);
      return;
    }
    const recruitList = document.createElement('div');
    recruitList.className = 'village-card-list';
    for (const recruitOffer of guild.recruitsOnOffer) {
      recruitList.appendChild(this.buildRecruitCard(guild, recruitOffer));
    }
    container.appendChild(recruitList);
  }

  private buildRecruitCard(guild: GuildState, recruitOffer: RecruitOffer): HTMLElement {
    const recruitCard = document.createElement('div');
    recruitCard.className = 'village-card with-portrait';
    recruitCard.appendChild(this.buildPortraitFor(recruitOffer.member));
    const cardBody = document.createElement('div');
    cardBody.innerHTML = `
      <h3>${recruitOffer.member.displayName}</h3>
      <p>${this.describeMember(recruitOffer.member)}</p>
      <p>Hiring fee: ${recruitOffer.hireCostInGold} gold</p>
    `;
    const hireButton = document.createElement('button');
    const rosterFull = !hasRoomInRoster(guild);
    hireButton.textContent = rosterFull ? 'Roster full' : `Hire (${recruitOffer.hireCostInGold}g)`;
    hireButton.disabled = rosterFull || !canAffordGoldCost(guild, recruitOffer.hireCostInGold);
    hireButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
    hireButton.addEventListener('click', () => {
      this.sounds.playMenuConfirm();
      this.callbacks.onHireRecruit(recruitOffer.member.identifier);
    });
    cardBody.appendChild(hireButton);
    recruitCard.appendChild(cardBody);
    return recruitCard;
  }

  // ── Roster ───────────────────────────────────────────────────────────

  private renderRoster(container: HTMLElement, guild: GuildState): void {
    container.appendChild(this.buildGuildStoresSummary(guild));

    const rosterHint = document.createElement('p');
    rosterHint.className = 'village-hint';
    rosterHint.textContent = 'Select a member to open their character sheet and manage equipment.';
    container.appendChild(rosterHint);

    const rosterList = document.createElement('div');
    rosterList.className = 'village-card-list';
    for (const member of guild.roster) {
      const experienceRequired = experienceRequiredToLevelUpFrom(member.level);
      const equippedNames = Object.values(member.equippedItemIdentifiers)
        .map((equipmentIdentifier) => this.content.equipment[equipmentIdentifier]?.displayName)
        .filter((displayName) => displayName !== undefined)
        .join(', ');
      const memberCard = document.createElement('button');
      memberCard.className = 'village-card with-portrait';
      memberCard.appendChild(this.buildPortraitFor(member));
      const cardBody = document.createElement('div');
      cardBody.innerHTML = `
        <h3>${member.displayName}</h3>
        <p>${this.describeMember(member)}</p>
        <p>XP: ${member.experiencePoints} / ${experienceRequired}</p>
        <div class="resource-bar"><div class="resource-bar-fill experience" style="width:${Math.min(100, (member.experiencePoints / experienceRequired) * 100)}%"></div></div>
        <p>${equippedNames === '' ? 'No equipment' : equippedNames}</p>
      `;
      memberCard.appendChild(cardBody);
      memberCard.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      memberCard.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.modalState = {
          kind: 'characterSheet',
          memberIdentifier: member.identifier,
          expandedEquipmentSlot: undefined,
        };
        this.rerender();
      });
      rosterList.appendChild(memberCard);
    }
    container.appendChild(rosterList);
  }

  private buildGuildStoresSummary(guild: GuildState): HTMLElement {
    const consumableSummary = Object.entries(guild.consumableInventory)
      .map(([itemIdentifier, count]) => {
        const item = this.content.items[itemIdentifier];
        return `${item?.displayName ?? itemIdentifier} ×${count}`;
      })
      .join(' · ');
    const equipmentSummary = Object.entries(guild.equipmentInventory)
      .map(([equipmentIdentifier, count]) => {
        const equipment = this.content.equipment[equipmentIdentifier];
        return `${equipment?.displayName ?? equipmentIdentifier} ×${count}`;
      })
      .join(' · ');
    const summaryElement = document.createElement('div');
    summaryElement.className = 'guild-stores-summary';
    summaryElement.innerHTML = `
      <p class="menu-section-title">Guild stores</p>
      <p>Consumables: ${consumableSummary === '' ? '—' : consumableSummary}</p>
      <p>Unequipped gear: ${equipmentSummary === '' ? '—' : equipmentSummary}</p>
    `;
    return summaryElement;
  }

  // ── Shared helpers ───────────────────────────────────────────────────

  private buildPortraitFor(member: GuildMember): HTMLCanvasElement {
    const raceDisplayName =
      this.content.races[member.raceIdentifier]?.displayName ?? member.raceIdentifier;
    const classDisplayName =
      this.content.baseClasses[member.baseClassIdentifier]?.displayName ??
      member.baseClassIdentifier;
    return createMemberPortraitCanvas(raceDisplayName, classDisplayName);
  }

  private describeMember(member: GuildMember): string {
    const raceName = this.content.races[member.raceIdentifier]?.displayName ?? member.raceIdentifier;
    const className =
      this.content.baseClasses[member.baseClassIdentifier]?.displayName ??
      member.baseClassIdentifier;
    return `${raceName} ${className} · Level ${member.level}`;
  }
}
