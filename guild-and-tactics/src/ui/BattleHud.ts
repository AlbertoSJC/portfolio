import type { Battle, BattleOutcome } from '../sim/battle/Battle';
import type { SkillDefinition } from '../sim/battle/SkillDefinition';
import { ITEM_USE_RANGE } from '../sim/battle/combatConstants';
import {
  describeConsumableEffect,
  type ConsumableItemDefinition,
} from '../sim/items/ConsumableItemDefinition';
import { effectiveStatistic, type Unit } from '../sim/units/Unit';
import { canUnitAffordSkill } from '../sim/battle/SkillExecution';
import type { UserInterfaceSounds } from './UserInterfaceSounds';

const COMBAT_LOG_MAXIMUM_LINES = 60;

export interface ActionMenuCallbacks {
  onMoveChosen: () => void;
  onSkillChosen: (skillIdentifier: string) => void;
  onItemChosen: (itemIdentifier: string) => void;
  onEndTurnChosen: () => void;
  onCancelChosen: () => void;
  /** Hovering an item button previews its use range. */
  onItemPreviewStart: (itemIdentifier: string) => void;
  /** Hovering the Move button previews reachable tiles. */
  onMovePreviewStart: () => void;
  /** Hovering a skill button previews its targetable tiles. */
  onSkillPreviewStart: (skillIdentifier: string) => void;
  onPreviewEnd: () => void;
  /** Hovering a name in the turn-order strip inspects and spotlights that unit. */
  onTurnOrderUnitHoverStart: (unitIdentifier: string) => void;
  onTurnOrderUnitHoverEnd: () => void;
}

export type ActionMenuMode =
  | 'unitCommands'
  | 'choosingTarget'
  | 'choosingFacing'
  | 'enemyActing'
  | 'battleOver';

interface MenuButtonOptions {
  isDisabled?: boolean;
  playsCancelSound?: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

function requiredElement<ElementType extends HTMLElement>(elementId: string): ElementType {
  const element = document.getElementById(elementId);
  if (element === null) {
    throw new Error(`Missing required HUD element "#${elementId}"`);
  }
  return element as ElementType;
}

function buildUnitSummaryHtml(unit: Unit): string {
  const hitPointFraction = unit.currentHitPoints / unit.baseStatistics.hitPointsMaximum;
  const manaPointFraction =
    unit.baseStatistics.manaPointsMaximum === 0
      ? 0
      : unit.currentManaPoints / unit.baseStatistics.manaPointsMaximum;
  const activeModifierSummary = unit.activeStatModifiers
    .map((modifier) => `${modifier.sourceSkillName} (${modifier.remainingTurns})`)
    .join(', ');
  return `
    <h2>${unit.displayName}</h2>
    <div>${unit.raceLabel} ${unit.classLabel} · Level ${unit.level}</div>
    <div>HP ${unit.currentHitPoints} / ${unit.baseStatistics.hitPointsMaximum}</div>
    <div class="resource-bar"><div class="resource-bar-fill hit-points" style="width:${hitPointFraction * 100}%"></div></div>
    <div>MP ${unit.currentManaPoints} / ${unit.baseStatistics.manaPointsMaximum}</div>
    <div class="resource-bar"><div class="resource-bar-fill mana-points" style="width:${manaPointFraction * 100}%"></div></div>
    <div>ATK ${effectiveStatistic(unit, 'attack')} · DEF ${effectiveStatistic(unit, 'defense')} · MAG ${effectiveStatistic(unit, 'magicPower')} · RES ${effectiveStatistic(unit, 'magicResistance')}</div>
    <div>Speed ${effectiveStatistic(unit, 'speed')} · Move ${unit.baseStatistics.movementRange}${unit.canFly ? ' (flies)' : ''} · Evasion ${Math.round(unit.baseStatistics.evasion * 100)}%</div>
    ${activeModifierSummary === '' ? '' : `<div>Buffs: ${activeModifierSummary}</div>`}
  `;
}

function describeSkillEffect(skill: SkillDefinition): string {
  const effect = skill.effect;
  switch (effect.kind) {
    case 'damage': {
      const elementNote = effect.element === undefined ? '' : ` ${effect.element}`;
      const flankingNote =
        effect.flankingPowerBonus === undefined
          ? ''
          : ` (+${Math.round(effect.flankingPowerBonus * 100)}% power from side/back)`;
      return `${Math.round(effect.powerMultiplier * 100)}%${elementNote} ${effect.damageSource} damage${flankingNote}`;
    }
    case 'heal':
      return `Restores ${Math.round(effect.powerMultiplier * 100)}% of magic power as hit points`;
    case 'statModifier': {
      const signedAmount = effect.amount >= 0 ? `+${effect.amount}` : `${effect.amount}`;
      return `${signedAmount} ${effect.statistic} for ${effect.durationTurns} turns`;
    }
  }
}

/**
 * The HTML overlay: turn-order strip, unit panels, action menu with skill
 * info box, combat log, and the victory/defeat overlay. Reads the Battle,
 * never writes to it — player intent flows out through the callbacks.
 */
export class BattleHud {
  private readonly turnOrderStripElement = requiredElement<HTMLDivElement>('turn-order-strip');
  private readonly activeUnitPanelElement = requiredElement<HTMLDivElement>('active-unit-panel');
  private readonly inspectedUnitPanelElement =
    requiredElement<HTMLDivElement>('inspected-unit-panel');
  private readonly actionMenuElement = requiredElement<HTMLDivElement>('action-menu');
  private readonly skillInfoBoxElement = requiredElement<HTMLDivElement>('skill-info-box');
  private readonly combatLogElement = requiredElement<HTMLDivElement>('combat-log');
  private readonly outcomeOverlayElement = requiredElement<HTMLDivElement>('battle-outcome-overlay');
  private readonly callbacks: ActionMenuCallbacks;
  private readonly sounds: UserInterfaceSounds;

  constructor(callbacks: ActionMenuCallbacks, sounds: UserInterfaceSounds) {
    this.callbacks = callbacks;
    this.sounds = sounds;
    for (const panel of [
      this.turnOrderStripElement,
      this.activeUnitPanelElement,
      this.inspectedUnitPanelElement,
      this.actionMenuElement,
      this.skillInfoBoxElement,
      this.combatLogElement,
    ]) {
      panel.classList.add('hud-panel');
    }
    this.inspectedUnitPanelElement.classList.add('hidden');
    this.skillInfoBoxElement.classList.add('hidden');
  }

  renderTurnOrderStrip(battle: Battle): void {
    const forecastUnits = battle.getTurnOrderForecast();
    const activeUnit = battle.getActiveUnit();
    this.turnOrderStripElement.replaceChildren(
      ...forecastUnits.map((unit, forecastIndex) => {
        const entry = document.createElement('span');
        entry.className = `turn-order-entry team-${unit.team}`;
        if (forecastIndex === 0 && unit.identifier === activeUnit.identifier) {
          entry.classList.add('is-active');
        }
        entry.textContent = unit.displayName;
        entry.addEventListener('mouseenter', () => {
          this.sounds.playMenuHover();
          this.callbacks.onTurnOrderUnitHoverStart(unit.identifier);
        });
        entry.addEventListener('mouseleave', () => {
          this.callbacks.onTurnOrderUnitHoverEnd();
        });
        return entry;
      }),
    );
  }

  renderActiveUnitPanel(unit: Unit): void {
    this.activeUnitPanelElement.innerHTML = buildUnitSummaryHtml(unit);
  }

  /** Shows full details of whatever unit the cursor is over — friend or foe. */
  renderInspectedUnitPanel(unit: Unit | undefined): void {
    if (unit === undefined) {
      this.inspectedUnitPanelElement.classList.add('hidden');
      return;
    }
    this.inspectedUnitPanelElement.classList.remove('hidden');
    this.inspectedUnitPanelElement.innerHTML = `
      <p class="menu-section-title">${unit.team === 'enemy' ? 'Enemy' : 'Ally'}</p>
      ${buildUnitSummaryHtml(unit)}
    `;
  }

  renderActionMenu(battle: Battle, mode: ActionMenuMode): void {
    this.actionMenuElement.replaceChildren();
    this.hideSkillInfoBox();
    if (mode === 'enemyActing') {
      this.appendMenuTitle('Enemy turn…');
      return;
    }
    if (mode === 'battleOver') {
      return;
    }
    if (mode === 'choosingTarget') {
      this.appendMenuTitle('Choose a target tile');
      this.appendMenuButton('Cancel', this.callbacks.onCancelChosen, { playsCancelSound: true });
      return;
    }
    if (mode === 'choosingFacing') {
      this.appendMenuTitle('Click an arrow around the unit to choose its facing');
      this.appendMenuButton('Cancel', this.callbacks.onCancelChosen, { playsCancelSound: true });
      return;
    }

    const activeUnit = battle.getActiveUnit();
    this.appendMenuButton('Move', this.callbacks.onMoveChosen, {
      isDisabled: activeUnit.hasMovedThisTurn,
      onHoverStart: () => this.callbacks.onMovePreviewStart(),
      onHoverEnd: () => this.callbacks.onPreviewEnd(),
    });
    this.appendMenuTitle('Actions');
    for (const skill of battle.getSkillsOfActiveUnit()) {
      const unaffordable = !canUnitAffordSkill(activeUnit, skill);
      const label =
        skill.manaPointCost === 0
          ? skill.displayName
          : `${skill.displayName} (${skill.manaPointCost} MP)`;
      this.appendMenuButton(label, () => this.callbacks.onSkillChosen(skill.identifier), {
        isDisabled: activeUnit.hasActedThisTurn || unaffordable,
        onHoverStart: () => {
          this.showSkillInfoBox(skill);
          this.callbacks.onSkillPreviewStart(skill.identifier);
        },
        onHoverEnd: () => {
          this.hideSkillInfoBox();
          this.callbacks.onPreviewEnd();
        },
      });
    }
    const pouchEntries = battle.getItemPouchEntries();
    if (pouchEntries.length > 0) {
      this.appendMenuTitle('Items');
      for (const pouchEntry of pouchEntries) {
        this.appendMenuButton(
          `${pouchEntry.item.displayName} ×${pouchEntry.count}`,
          () => this.callbacks.onItemChosen(pouchEntry.item.identifier),
          {
            isDisabled: activeUnit.hasActedThisTurn,
            onHoverStart: () => {
              this.showItemInfoBox(pouchEntry.item);
              this.callbacks.onItemPreviewStart(pouchEntry.item.identifier);
            },
            onHoverEnd: () => {
              this.hideSkillInfoBox();
              this.callbacks.onPreviewEnd();
            },
          },
        );
      }
    }
    this.appendMenuButton('End Turn', this.callbacks.onEndTurnChosen);
  }

  private showSkillInfoBox(skill: SkillDefinition): void {
    const rangeDescription = skill.targetingRange === 0 ? 'Self' : `${skill.targetingRange} tiles`;
    const areaDescription =
      skill.areaOfEffectRadius === 0 ? 'Single target' : `${skill.areaOfEffectRadius}-tile burst`;
    this.skillInfoBoxElement.classList.remove('hidden');
    this.skillInfoBoxElement.innerHTML = `
      <h3>${skill.displayName}</h3>
      <p>${skill.description}</p>
      <p class="skill-info-details">
        ${describeSkillEffect(skill)}<br>
        Range: ${rangeDescription} · ${areaDescription} · Cost: ${skill.manaPointCost} MP
      </p>
    `;
  }

  private showItemInfoBox(item: ConsumableItemDefinition): void {
    this.skillInfoBoxElement.classList.remove('hidden');
    this.skillInfoBoxElement.innerHTML = `
      <h3>${item.displayName}</h3>
      <p>${item.description}</p>
      <p class="skill-info-details">
        ${describeConsumableEffect(item)}<br>
        Range: ${ITEM_USE_RANGE} tile (any ally, or self) · Uses the turn's action
      </p>
    `;
  }

  private hideSkillInfoBox(): void {
    this.skillInfoBoxElement.classList.add('hidden');
  }

  appendCombatLogLine(logLine: string): void {
    const paragraph = document.createElement('p');
    paragraph.textContent = logLine;
    this.combatLogElement.appendChild(paragraph);
    while (this.combatLogElement.childElementCount > COMBAT_LOG_MAXIMUM_LINES) {
      this.combatLogElement.firstElementChild?.remove();
    }
    this.combatLogElement.scrollTop = this.combatLogElement.scrollHeight;
  }

  showOutcomeOverlay(
    outcome: Exclude<BattleOutcome, 'ongoing'>,
    summaryLines: readonly string[],
    continueButtonLabel: string,
    onContinue: () => void,
  ): void {
    this.outcomeOverlayElement.classList.remove('hidden');
    this.outcomeOverlayElement.replaceChildren();
    const headline = document.createElement('div');
    headline.textContent = outcome === 'victory' ? 'Victory!' : 'Defeat…';
    const summaryBlock = document.createElement('div');
    summaryBlock.className = 'outcome-summary';
    for (const summaryLine of summaryLines) {
      const lineParagraph = document.createElement('p');
      lineParagraph.textContent = summaryLine;
      summaryBlock.appendChild(lineParagraph);
    }
    const continueButton = document.createElement('button');
    continueButton.textContent = continueButtonLabel;
    continueButton.addEventListener('click', () => {
      this.sounds.playMenuConfirm();
      onContinue();
    });
    this.outcomeOverlayElement.append(headline, summaryBlock, continueButton);
  }

  hideOutcomeOverlay(): void {
    this.outcomeOverlayElement.classList.add('hidden');
  }

  private appendMenuTitle(titleText: string): void {
    const title = document.createElement('p');
    title.className = 'menu-section-title';
    title.textContent = titleText;
    this.actionMenuElement.appendChild(title);
  }

  private appendMenuButton(
    label: string,
    onClick: () => void,
    options: MenuButtonOptions = {},
  ): void {
    const button = document.createElement('button');
    button.textContent = label;
    button.disabled = options.isDisabled ?? false;
    button.addEventListener('click', () => {
      if (options.playsCancelSound === true) {
        this.sounds.playMenuCancel();
      } else {
        this.sounds.playMenuConfirm();
      }
      onClick();
    });
    button.addEventListener('mouseenter', () => {
      if (!button.disabled) {
        this.sounds.playMenuHover();
      }
      options.onHoverStart?.();
    });
    button.addEventListener('mouseleave', () => {
      options.onHoverEnd?.();
    });
    this.actionMenuElement.appendChild(button);
  }
}
