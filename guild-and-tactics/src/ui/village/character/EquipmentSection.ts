import { countEquipmentPieces, type GuildMember, type GuildState } from '../../../sim/guild/GuildState';
import {
  ALL_EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_DISPLAY_NAMES,
  canClassEquip,
  type EquipmentDefinition,
  type EquipmentSlot,
} from '../../../sim/items/EquipmentDefinition';
import { describeStatisticBonuses } from '../presenters/StatisticDescriptions';
import type { CharacterSheetCallbacks, CharacterSheetContentTables } from './CharacterSheetTypes';

export function buildEquipmentSection(
  member: GuildMember,
  guild: GuildState,
  content: CharacterSheetContentTables,
  expandedSlotPicker: EquipmentSlot | undefined,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const section = document.createElement('div');
  section.className = 'character-sheet-equipment';

  const title = document.createElement('p');
  title.className = 'menu-section-title';
  title.textContent = 'Equipment';
  section.appendChild(title);

  for (const slot of ALL_EQUIPMENT_SLOTS) {
    section.appendChild(
      buildEquipmentSlotRow(member, guild, content, slot, expandedSlotPicker === slot, callbacks),
    );
  }
  return section;
}

function buildEquipmentSlotRow(
  member: GuildMember,
  guild: GuildState,
  content: CharacterSheetContentTables,
  slot: EquipmentSlot,
  isPickerExpanded: boolean,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const equippedIdentifier = member.equippedItemIdentifiers[slot];
  const equippedDefinition =
    equippedIdentifier === undefined ? undefined : content.equipment[equippedIdentifier];

  const slotRow = document.createElement('div');
  slotRow.className = 'equipment-slot-row';
  slotRow.appendChild(
    buildEquipmentSlotSummary(member.identifier, slot, equippedDefinition, isPickerExpanded, callbacks),
  );

  if (isPickerExpanded) {
    slotRow.appendChild(buildSlotPicker(member, guild, content, slot, callbacks));
  }
  return slotRow;
}

function buildEquipmentSlotSummary(
  memberIdentifier: string,
  slot: EquipmentSlot,
  equippedDefinition: EquipmentDefinition | undefined,
  isPickerExpanded: boolean,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const summary = document.createElement('div');
  summary.className = 'equipment-slot-summary';

  const slotNameEl = document.createElement('span');
  slotNameEl.className = 'equipment-slot-name';
  slotNameEl.textContent = EQUIPMENT_SLOT_DISPLAY_NAMES[slot];

  const itemEl = document.createElement('span');
  if (equippedDefinition === undefined) {
    itemEl.textContent = '—';
  } else {
    itemEl.textContent = `${equippedDefinition.displayName} `;
    const bonusEl = document.createElement('em');
    bonusEl.textContent = `(${describeStatisticBonuses(equippedDefinition.statisticBonuses)})`;
    itemEl.appendChild(bonusEl);
  }

  const buttonsEl = document.createElement('div');
  buttonsEl.className = 'equipment-slot-buttons';
  const changeButton = document.createElement('button');
  changeButton.textContent = isPickerExpanded ? 'Close' : 'Change';
  changeButton.addEventListener('click', () => callbacks.onToggleSlotPicker(slot));
  buttonsEl.appendChild(changeButton);
  if (equippedDefinition !== undefined) {
    const unequipButton = document.createElement('button');
    unequipButton.textContent = 'Unequip';
    unequipButton.addEventListener('click', () => callbacks.onUnequipSlot(memberIdentifier, slot));
    buttonsEl.appendChild(unequipButton);
  }

  summary.append(slotNameEl, itemEl, buttonsEl);
  return summary;
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
      canClassEquip(equipment, member.classIdentifier),
  );

  if (equippableChoices.length === 0) {
    const emptyNote = document.createElement('p');
    emptyNote.className = 'village-hint';
    emptyNote.textContent = 'Nothing suitable in the guild stores — visit the Store tab.';
    pickerElement.appendChild(emptyNote);
    return pickerElement;
  }

  for (const equipment of equippableChoices) {
    const count = countEquipmentPieces(guild, equipment.identifier);
    pickerElement.appendChild(
      buildEquipmentChoiceRow(equipment, count, () =>
        callbacks.onEquipItem(member.identifier, equipment.identifier),
      ),
    );
  }
  return pickerElement;
}

function buildEquipmentChoiceRow(
  equipment: EquipmentDefinition,
  count: number,
  onEquip: () => void,
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'equipment-choice-row';

  const infoEl = document.createElement('span');
  infoEl.textContent = `${equipment.displayName} ×${count} `;
  const bonusEl = document.createElement('em');
  bonusEl.textContent = `(${describeStatisticBonuses(equipment.statisticBonuses)})`;
  infoEl.appendChild(bonusEl);

  const equipButton = document.createElement('button');
  equipButton.textContent = 'Equip';
  equipButton.addEventListener('click', onEquip);

  row.append(infoEl, equipButton);
  return row;
}
