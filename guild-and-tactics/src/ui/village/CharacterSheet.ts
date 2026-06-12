import {
  countEquipmentPieces,
  type GuildMember,
  type GuildState,
} from '../../sim/guild/GuildState';
import { equippedDefinitionsForMember } from '../../sim/guild/MemberEquipment';
import {
  ALL_EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_DISPLAY_NAMES,
  canClassEquip,
  type EquipmentDefinition,
  type EquipmentSlot,
} from '../../sim/items/EquipmentDefinition';
import { experienceRequiredToLevelUpFrom } from '../../sim/progression/ExperienceAndLevels';
import { createUnitFromCharacter } from '../../sim/units/UnitFactory';
import type { UnitStatistics } from '../../sim/units/Unit';
import type { BaseClassDefinition, RaceDefinition } from '../../sim/units/UnitDefinitions';
import { createMemberPortraitCanvas } from './MemberPortrait';

export interface CharacterSheetCallbacks {
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onToggleSlotPicker: (slot: EquipmentSlot) => void;
}

export interface CharacterSheetContentTables {
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  equipment: Record<string, EquipmentDefinition>;
}

const STATISTIC_SHORT_LABELS: Record<keyof UnitStatistics, string> = {
  hitPointsMaximum: 'HP',
  manaPointsMaximum: 'MP',
  attack: 'ATK',
  defense: 'DEF',
  magicPower: 'MAG',
  magicResistance: 'RES',
  speed: 'SPD',
  movementRange: 'MOVE',
  jumpHeight: 'JUMP',
  evasion: 'EVA',
};

export function describeStatisticBonuses(bonuses: Partial<UnitStatistics>): string {
  const bonusDescriptions: string[] = [];
  for (const [statisticName, amount] of Object.entries(bonuses) as [keyof UnitStatistics, number][]) {
    if (amount === 0) {
      continue;
    }
    const displayAmount =
      statisticName === 'evasion' ? `${Math.round(amount * 100)}%` : `${Math.abs(amount)}`;
    bonusDescriptions.push(
      `${amount > 0 ? '+' : '−'}${displayAmount} ${STATISTIC_SHORT_LABELS[statisticName]}`,
    );
  }
  return bonusDescriptions.join(', ');
}

/**
 * The full character sheet shown in the village modal: portrait, derived
 * battle statistics (equipment included), equipment slots with a change
 * picker, and the guild stores at a glance.
 */
export function buildCharacterSheetContent(
  member: GuildMember,
  guild: GuildState,
  content: CharacterSheetContentTables,
  expandedSlotPicker: EquipmentSlot | undefined,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const race = content.races[member.raceIdentifier];
  const baseClass = content.baseClasses[member.baseClassIdentifier];
  const sheetElement = document.createElement('div');
  sheetElement.className = 'character-sheet';
  if (race === undefined || baseClass === undefined) {
    sheetElement.textContent = 'Broken member data.';
    return sheetElement;
  }

  const equippedDefinitions = equippedDefinitionsForMember(
    member.equippedItemIdentifiers,
    content.equipment,
  );
  const battleStatistics = createUnitFromCharacter({
    identifier: 'sheet_preview',
    displayName: member.displayName,
    team: 'guild',
    race,
    baseClass,
    level: member.level,
    position: { column: 0, row: 0 },
    facing: 'north',
    equipment: equippedDefinitions,
  }).baseStatistics;

  // ── Header ─────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'character-sheet-header';
  header.appendChild(createMemberPortraitCanvas(race.displayName, baseClass.displayName));
  const experienceRequired = experienceRequiredToLevelUpFrom(member.level);
  const headerText = document.createElement('div');
  headerText.innerHTML = `
    <h2>${member.displayName}</h2>
    <p>${race.displayName} ${baseClass.displayName} · Level ${member.level}</p>
    <p>XP ${member.experiencePoints} / ${experienceRequired}</p>
    <div class="resource-bar"><div class="resource-bar-fill experience" style="width:${Math.min(100, (member.experiencePoints / experienceRequired) * 100)}%"></div></div>
  `;
  header.appendChild(headerText);
  sheetElement.appendChild(header);

  // ── Battle statistics (equipment folded in) ────────────────────────────
  const statisticsGrid = document.createElement('div');
  statisticsGrid.className = 'character-sheet-statistics';
  const statisticEntries: [string, string][] = [
    ['HP', `${battleStatistics.hitPointsMaximum}`],
    ['MP', `${battleStatistics.manaPointsMaximum}`],
    ['ATK', `${battleStatistics.attack}`],
    ['DEF', `${battleStatistics.defense}`],
    ['MAG', `${battleStatistics.magicPower}`],
    ['RES', `${battleStatistics.magicResistance}`],
    ['SPD', `${battleStatistics.speed}`],
    ['MOVE', `${battleStatistics.movementRange}${race.canFly ? ' (flies)' : ''}`],
    ['JUMP', `${battleStatistics.jumpHeight}`],
    ['EVA', `${Math.round(battleStatistics.evasion * 100)}%`],
  ];
  for (const [statisticLabel, statisticValue] of statisticEntries) {
    const statisticCell = document.createElement('div');
    statisticCell.innerHTML = `<span>${statisticLabel}</span><strong>${statisticValue}</strong>`;
    statisticsGrid.appendChild(statisticCell);
  }
  sheetElement.appendChild(statisticsGrid);

  // ── Equipment slots ────────────────────────────────────────────────────
  const equipmentSection = document.createElement('div');
  equipmentSection.className = 'character-sheet-equipment';
  const equipmentTitle = document.createElement('p');
  equipmentTitle.className = 'menu-section-title';
  equipmentTitle.textContent = 'Equipment';
  equipmentSection.appendChild(equipmentTitle);

  for (const slot of ALL_EQUIPMENT_SLOTS) {
    equipmentSection.appendChild(
      buildEquipmentSlotRow(member, guild, content, slot, expandedSlotPicker === slot, callbacks),
    );
  }
  sheetElement.appendChild(equipmentSection);
  return sheetElement;
}

function buildEquipmentSlotRow(
  member: GuildMember,
  guild: GuildState,
  content: CharacterSheetContentTables,
  slot: EquipmentSlot,
  isPickerExpanded: boolean,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const slotRow = document.createElement('div');
  slotRow.className = 'equipment-slot-row';

  const equippedIdentifier = member.equippedItemIdentifiers[slot];
  const equippedDefinition =
    equippedIdentifier === undefined ? undefined : content.equipment[equippedIdentifier];

  const slotSummary = document.createElement('div');
  slotSummary.className = 'equipment-slot-summary';
  slotSummary.innerHTML = `
    <span class="equipment-slot-name">${EQUIPMENT_SLOT_DISPLAY_NAMES[slot]}</span>
    <span>${
      equippedDefinition === undefined
        ? '—'
        : `${equippedDefinition.displayName} <em>(${describeStatisticBonuses(equippedDefinition.statisticBonuses)})</em>`
    }</span>
  `;
  const slotButtons = document.createElement('div');
  slotButtons.className = 'equipment-slot-buttons';
  const changeButton = document.createElement('button');
  changeButton.textContent = isPickerExpanded ? 'Close' : 'Change';
  changeButton.addEventListener('click', () => callbacks.onToggleSlotPicker(slot));
  slotButtons.appendChild(changeButton);
  if (equippedDefinition !== undefined) {
    const unequipButton = document.createElement('button');
    unequipButton.textContent = 'Unequip';
    unequipButton.addEventListener('click', () =>
      callbacks.onUnequipSlot(member.identifier, slot),
    );
    slotButtons.appendChild(unequipButton);
  }
  slotSummary.appendChild(slotButtons);
  slotRow.appendChild(slotSummary);

  if (isPickerExpanded) {
    slotRow.appendChild(buildSlotPicker(member, guild, content, slot, callbacks));
  }
  return slotRow;
}

function buildSlotPicker(
  member: GuildMember,
  guild: GuildState,
  content: CharacterSheetContentTables,
  slot: EquipmentSlot,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const pickerElement = document.createElement('div');
  pickerElement.className = 'equipment-slot-picker';
  const equippableChoices = Object.values(content.equipment).filter(
    (equipment) =>
      equipment.slot === slot &&
      countEquipmentPieces(guild, equipment.identifier) > 0 &&
      canClassEquip(equipment, member.baseClassIdentifier),
  );
  if (equippableChoices.length === 0) {
    const emptyNote = document.createElement('p');
    emptyNote.className = 'village-hint';
    emptyNote.textContent = 'Nothing suitable in the guild stores — visit the Store tab.';
    pickerElement.appendChild(emptyNote);
    return pickerElement;
  }
  for (const equipment of equippableChoices) {
    const choiceRow = document.createElement('div');
    choiceRow.className = 'equipment-choice-row';
    choiceRow.innerHTML = `
      <span>${equipment.displayName} ×${countEquipmentPieces(guild, equipment.identifier)}
        <em>(${describeStatisticBonuses(equipment.statisticBonuses)})</em></span>
    `;
    const equipButton = document.createElement('button');
    equipButton.textContent = 'Equip';
    equipButton.addEventListener('click', () =>
      callbacks.onEquipItem(member.identifier, equipment.identifier),
    );
    choiceRow.appendChild(equipButton);
    pickerElement.appendChild(choiceRow);
  }
  return pickerElement;
}
