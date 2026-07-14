import type { SkillDefinition } from '@/sim/battle/SkillDefinition';
import type { GuildState } from '@/sim/guild/GuildState';
import type { ConsumableItemDefinition } from '@/sim/items/ConsumableItemDefinition';
import type { EquipmentDefinition, EquipmentSlot } from '@/sim/items/EquipmentDefinition';
import type { BaseClassIdentifier, ClassIdentifier } from '@/sim/units/Unit';
import type { AdvancedClassDefinition, BaseClassDefinition, RaceDefinition } from '@/sim/units/UnitDefinitions';
import type { UserInterfaceSounds } from '../UserInterfaceSounds';
import { buildCharacterSheetContent } from '../village/character/CharacterSheet';
import { buildClassPickerContent } from '../village/character/ClassPicker';
import { buildInventoryViewModel } from '../village/presenters/ItemCardPresenters';
import { buildRecruitCardViewModels, buildRosterCardViewModels } from '../village/presenters/MemberPresenters';
import { createCardList, createHintParagraph, createSectionTitle } from '../village/views/DomPrimitives';
import { renderItemCard } from '../village/views/ItemCardView';
import { renderRecruitCard, renderRosterCard } from '../village/views/MemberCardViews';
import { renderPillBar } from '../village/views/PillBarView';
import { createSoundedButton } from '../village/views/SoundedButton';

export interface GuildMenuCallbacks {
  onHireRecruit: (recruitMemberIdentifier: string) => void;
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: ClassIdentifier) => void;
  onSetSecondarySkillClass: (memberIdentifier: string, classIdentifier: BaseClassIdentifier | undefined) => void;
}

export interface GuildMenuContentTables {
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  advancedClasses: Record<string, AdvancedClassDefinition>;
  equipment: Record<string, EquipmentDefinition>;
  skills: Record<string, SkillDefinition>;
  items: Record<string, ConsumableItemDefinition>;
}

/**
 * Where a GuildMenu instance's content actually gets displayed — a global
 * modal (reachable from the World Map or any zone) or a panel docked
 * directly into a Town screen. `onOpen` forces it visible; `onUpdate` only
 * matters while it's already showing (the host decides what "showing"
 * means for itself — e.g. `ModalDialog.isOpen()`, or a Town screen's own
 * "which building is selected" state).
 */
export interface GuildMenuHost {
  onOpen: (content: HTMLElement) => void;
  onUpdate: (content: HTMLElement) => void;
}

type GuildMenuTab = 'roster' | 'inventory' | 'recruitment';

type GuildMenuView =
  | { kind: 'tabs' }
  | {
      kind: 'characterSheet';
      memberIdentifier: string;
      expandedEquipmentSlot: EquipmentSlot | undefined;
      view: 'sheet' | 'classPicker';
    };

/**
 * The guild's roster/inventory/recruitment. Reachable as a global modal
 * from anywhere (the world map or any zone) — the guild has no home
 * location to host this as a building — and, separately, also embeddable
 * directly inside a Town screen's own content panel, picking the Guild
 * Hall building. The `host` decides which of those this instance is; this
 * class only ever builds content and hands it to `host.onOpen`/`onUpdate`,
 * never touching a `ModalDialog` (or any other display mechanism) itself.
 * This is a relocation of VillageScreen's old Guild Hall + Recruitment
 * logic, not new behavior.
 */
export class GuildMenu {
  private readonly sounds: UserInterfaceSounds;
  private readonly content: GuildMenuContentTables;
  private readonly callbacks: GuildMenuCallbacks;
  private readonly host: GuildMenuHost;
  private activeTab: GuildMenuTab = 'roster';
  private view: GuildMenuView = { kind: 'tabs' };
  private lastRenderedGuild: GuildState | undefined;

  constructor(
    sounds: UserInterfaceSounds,
    content: GuildMenuContentTables,
    callbacks: GuildMenuCallbacks,
    host: GuildMenuHost,
  ) {
    this.sounds = sounds;
    this.content = content;
    this.callbacks = callbacks;
    this.host = host;
  }

  /** Forces the menu visible (resetting to the Roster tab) — call when the player chooses to open it. */
  open(guild: GuildState): void {
    this.activeTab = 'roster';
    this.view = { kind: 'tabs' };
    this.lastRenderedGuild = guild;
    this.host.onOpen(this.buildContent(guild));
  }

  /** Re-renders in place if currently shown — call after any guild state change. */
  refresh(guild: GuildState): void {
    this.lastRenderedGuild = guild;
    this.host.onUpdate(this.buildContent(guild));
  }

  private rerender(): void {
    if (this.lastRenderedGuild !== undefined) {
      this.refresh(this.lastRenderedGuild);
    }
  }

  private buildContent(guild: GuildState): HTMLElement {
    if (this.view.kind === 'characterSheet') {
      return this.buildCharacterSheetView(guild, this.view);
    }
    const root = document.createElement('div');
    const title = document.createElement('h2');
    title.className = 'guild-menu-title';
    title.textContent = 'Guild';
    root.appendChild(title);
    root.appendChild(
      renderPillBar({
        entries: [
          { identifier: 'roster', label: 'Roster' },
          { identifier: 'inventory', label: 'Inventory' },
          { identifier: 'recruitment', label: 'Recruitment' },
        ],
        activeIdentifier: this.activeTab,
        className: 'store-filter-bar',
        sounds: this.sounds,
        onSelect: (tab) => {
          this.activeTab = tab as GuildMenuTab;
          this.rerender();
        },
      }),
    );
    switch (this.activeTab) {
      case 'roster':
        this.appendRoster(root, guild);
        break;
      case 'inventory':
        this.appendInventory(root, guild);
        break;
      case 'recruitment':
        this.appendRecruitment(root, guild);
        break;
    }
    return root;
  }

  private appendRoster(container: HTMLElement, guild: GuildState): void {
    container.appendChild(
      createHintParagraph('Select a member to open their character sheet and manage equipment.'),
    );
    const rosterList = createCardList();
    for (const viewModel of buildRosterCardViewModels(guild, this.content)) {
      rosterList.appendChild(
        renderRosterCard(viewModel, this.sounds, () => {
          this.view = {
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

  private appendInventory(container: HTMLElement, guild: GuildState): void {
    const { consumableCards, equipmentCards } = buildInventoryViewModel(guild, this.content);

    container.appendChild(createSectionTitle('Consumables'));
    const consumablesList = createCardList();
    for (const viewModel of consumableCards) {
      consumablesList.appendChild(renderItemCard(viewModel));
    }
    if (consumablesList.childElementCount === 0) {
      consumablesList.appendChild(createHintParagraph('No consumables — visit a tavern store.'));
    }
    container.appendChild(consumablesList);

    container.appendChild(createSectionTitle('Equipment'));
    const equipmentList = createCardList();
    for (const viewModel of equipmentCards) {
      equipmentList.appendChild(renderItemCard(viewModel));
    }
    if (equipmentList.childElementCount === 0) {
      equipmentList.appendChild(createHintParagraph('No equipment owned yet — visit a tavern store.'));
    }
    container.appendChild(equipmentList);
  }

  private appendRecruitment(container: HTMLElement, guild: GuildState): void {
    const recruitCards = buildRecruitCardViewModels(guild, this.content);
    if (recruitCards.length === 0) {
      container.appendChild(
        createHintParagraph('No one new is looking for work. Check back after the next victory.'),
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

  private buildCharacterSheetView(
    guild: GuildState,
    view: { memberIdentifier: string; expandedEquipmentSlot: EquipmentSlot | undefined; view: 'sheet' | 'classPicker' },
  ): HTMLElement {
    const member = guild.roster.find((rosterMember) => rosterMember.identifier === view.memberIdentifier);
    const race = member === undefined ? undefined : this.content.races[member.raceIdentifier];
    if (member === undefined || race === undefined) {
      this.view = { kind: 'tabs' };
      return this.buildContent(guild);
    }

    const wrapper = document.createElement('div');
    wrapper.appendChild(
      createSoundedButton(this.sounds, {
        label: '← Back to Roster',
        className: 'guild-menu-back-button',
        playsCancelSound: true,
        onClick: () => {
          this.view = { kind: 'tabs' };
          this.activeTab = 'roster';
          this.rerender();
        },
      }),
    );

    if (view.view === 'classPicker') {
      wrapper.appendChild(
        buildClassPickerContent(member, race, this.content, {
          onGoBack: () => {
            if (this.view.kind === 'characterSheet') {
              this.view.view = 'sheet';
            }
            this.rerender();
          },
          onChangeClass: (memberIdentifier, classIdentifier) => {
            this.sounds.playMenuConfirm();
            this.callbacks.onChangeClass(memberIdentifier, classIdentifier);
          },
        }),
      );
      return wrapper;
    }

    wrapper.appendChild(
      buildCharacterSheetContent(member, guild, this.content, view.expandedEquipmentSlot, {
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
          if (this.view.kind === 'characterSheet') {
            this.view.expandedEquipmentSlot = this.view.expandedEquipmentSlot === slot ? undefined : slot;
          }
          this.rerender();
        },
        onChangeClass: (memberIdentifier, classIdentifier) => {
          this.sounds.playMenuConfirm();
          this.callbacks.onChangeClass(memberIdentifier, classIdentifier);
        },
        onOpenClassPicker: () => {
          this.sounds.playMenuConfirm();
          if (this.view.kind === 'characterSheet') {
            this.view.view = 'classPicker';
          }
          this.rerender();
        },
        onSetSecondarySkillClass: (memberIdentifier, classIdentifier) => {
          this.sounds.playMenuConfirm();
          this.callbacks.onSetSecondarySkillClass(memberIdentifier, classIdentifier);
        },
      }),
    );
    return wrapper;
  }
}
