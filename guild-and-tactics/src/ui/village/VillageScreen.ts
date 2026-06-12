import { BATTLE_PARTY_CAPACITY, GUILD_ROSTER_CAPACITY } from '../../sim/guild/GuildState';
import type { GuildState, GuildMember, RecruitOffer } from '../../sim/guild/GuildState';
import type { QuestDefinition } from '../../sim/guild/QuestDefinition';
import type { ConsumableItemDefinition } from '../../sim/items/ConsumableItemDefinition';
import { sellPriceForItem } from '../../sim/items/ConsumableItemDefinition';
import { experienceRequiredToLevelUpFrom } from '../../sim/progression/ExperienceAndLevels';
import { canAffordGoldCost, countConsumable, hasRoomInRoster } from '../../sim/guild/GuildState';
import type { BattleMap } from '../../sim/grid/BattleMap';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';

export interface VillageCallbacks {
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onHireRecruit: (recruitMemberIdentifier: string) => void;
}

/** Content the village needs for display, injected so the UI stays data-driven. */
export interface VillageContentTables {
  quests: Record<string, QuestDefinition>;
  items: Record<string, ConsumableItemDefinition>;
  battleMapsByIdentifier: Record<string, { map: BattleMap }>;
  raceDisplayNames: Record<string, string>;
  classDisplayNames: Record<string, string>;
}

type VillageTab = 'tavern' | 'store' | 'recruitment' | 'roster';

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
  private activeTab: VillageTab = 'tavern';
  private selectedQuestIdentifier: string | undefined;
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
  }

  private rerender(): void {
    if (this.lastRenderedGuild !== undefined) {
      this.render(this.lastRenderedGuild);
    }
  }

  // ── Tavern ───────────────────────────────────────────────────────────

  private renderTavern(container: HTMLElement, guild: GuildState): void {
    const questList = document.createElement('div');
    questList.className = 'village-card-list';
    for (const questIdentifier of guild.questIdentifiersOnBoard) {
      const quest = this.content.quests[questIdentifier];
      if (quest === undefined) {
        continue;
      }
      const mapEntry = this.content.battleMapsByIdentifier[quest.battleMapIdentifier];
      const questCard = document.createElement('button');
      questCard.className = `village-card ${questIdentifier === this.selectedQuestIdentifier ? 'is-selected' : ''}`;
      questCard.innerHTML = `
        <h3>${quest.displayName} <span class="difficulty-stars">${DIFFICULTY_RANK_LABELS[quest.difficultyRank] ?? ''}</span></h3>
        <p>${mapEntry?.map.displayName ?? quest.battleMapIdentifier} · ${quest.enemySpawns.length} foes</p>
        <p>Reward: ${quest.rewardGold} gold · ${quest.rewardExperience} XP</p>
      `;
      questCard.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      questCard.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.selectedQuestIdentifier = questIdentifier;
        this.rerender();
      });
      questList.appendChild(questCard);
    }
    container.appendChild(questList);

    const selectedQuest =
      this.selectedQuestIdentifier === undefined
        ? undefined
        : this.content.quests[this.selectedQuestIdentifier];
    if (selectedQuest === undefined) {
      const hint = document.createElement('p');
      hint.className = 'village-hint';
      hint.textContent = 'Pick a posting from the board to read it and muster a party.';
      container.appendChild(hint);
      return;
    }

    const questDetail = document.createElement('section');
    questDetail.className = 'quest-detail';
    questDetail.innerHTML = `
      <h2>${selectedQuest.displayName}</h2>
      <p class="quest-description">${selectedQuest.description}</p>
      <p class="menu-section-title">Muster the party (up to ${BATTLE_PARTY_CAPACITY})</p>
    `;

    const partyPicker = document.createElement('div');
    partyPicker.className = 'party-picker';
    for (const member of guild.roster) {
      const memberLabel = document.createElement('label');
      memberLabel.className = 'party-picker-member';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.selectedMemberIdentifiers.has(member.identifier);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          if (this.selectedMemberIdentifiers.size >= BATTLE_PARTY_CAPACITY) {
            checkbox.checked = false;
            this.sounds.playMenuCancel();
            return;
          }
          this.selectedMemberIdentifiers.add(member.identifier);
          this.sounds.playMenuConfirm();
        } else {
          this.selectedMemberIdentifiers.delete(member.identifier);
          this.sounds.playMenuCancel();
        }
        this.rerender();
      });
      memberLabel.appendChild(checkbox);
      memberLabel.appendChild(
        document.createTextNode(` ${member.displayName} — ${this.describeMember(member)}`),
      );
      partyPicker.appendChild(memberLabel);
    }
    questDetail.appendChild(partyPicker);

    const embarkButton = document.createElement('button');
    embarkButton.className = 'primary-action-button';
    const selectedCount = this.selectedMemberIdentifiers.size;
    embarkButton.textContent =
      selectedCount === 0 ? 'Select at least one member' : `Embark with ${selectedCount}`;
    embarkButton.disabled = selectedCount === 0;
    embarkButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
    embarkButton.addEventListener('click', () => {
      this.sounds.playMenuConfirm();
      this.callbacks.onEmbarkQuest(selectedQuest.identifier, [...this.selectedMemberIdentifiers]);
    });
    questDetail.appendChild(embarkButton);
    container.appendChild(questDetail);
  }

  // ── Store ────────────────────────────────────────────────────────────

  private renderStore(container: HTMLElement, guild: GuildState): void {
    const storeList = document.createElement('div');
    storeList.className = 'village-card-list';
    for (const item of Object.values(this.content.items)) {
      const ownedCount = countConsumable(guild, item.identifier);
      const itemCard = document.createElement('div');
      itemCard.className = 'village-card';
      itemCard.innerHTML = `
        <h3>${item.displayName}</h3>
        <p>${item.description}</p>
        <p>Price: ${item.priceInGold} gold · Owned: ${ownedCount}</p>
      `;
      const buttonRow = document.createElement('div');
      buttonRow.className = 'village-card-buttons';
      const buyButton = document.createElement('button');
      buyButton.textContent = `Buy (${item.priceInGold}g)`;
      buyButton.disabled = !canAffordGoldCost(guild, item.priceInGold);
      buyButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      buyButton.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.callbacks.onBuyItem(item.identifier);
      });
      const sellButton = document.createElement('button');
      sellButton.textContent = `Sell (${sellPriceForItem(item)}g)`;
      sellButton.disabled = ownedCount === 0;
      sellButton.addEventListener('mouseenter', () => this.sounds.playMenuHover());
      sellButton.addEventListener('click', () => {
        this.sounds.playMenuConfirm();
        this.callbacks.onSellItem(item.identifier);
      });
      buttonRow.append(buyButton, sellButton);
      itemCard.appendChild(buttonRow);
      storeList.appendChild(itemCard);
    }
    container.appendChild(storeList);
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
    recruitCard.className = 'village-card';
    recruitCard.innerHTML = `
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
    recruitCard.appendChild(hireButton);
    return recruitCard;
  }

  // ── Roster ───────────────────────────────────────────────────────────

  private renderRoster(container: HTMLElement, guild: GuildState): void {
    const rosterList = document.createElement('div');
    rosterList.className = 'village-card-list';
    for (const member of guild.roster) {
      const experienceRequired = experienceRequiredToLevelUpFrom(member.level);
      const memberCard = document.createElement('div');
      memberCard.className = 'village-card';
      memberCard.innerHTML = `
        <h3>${member.displayName}</h3>
        <p>${this.describeMember(member)}</p>
        <p>XP: ${member.experiencePoints} / ${experienceRequired} to next level</p>
        <div class="resource-bar"><div class="resource-bar-fill experience" style="width:${Math.min(100, (member.experiencePoints / experienceRequired) * 100)}%"></div></div>
      `;
      rosterList.appendChild(memberCard);
    }
    container.appendChild(rosterList);
  }

  private describeMember(member: GuildMember): string {
    const raceName = this.content.raceDisplayNames[member.raceIdentifier] ?? member.raceIdentifier;
    const className =
      this.content.classDisplayNames[member.baseClassIdentifier] ?? member.baseClassIdentifier;
    return `${raceName} ${className} · Level ${member.level}`;
  }
}
