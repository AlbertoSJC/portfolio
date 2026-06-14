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
import type { SkillDefinition } from '../../sim/battle/SkillDefinition';
import type { BaseClassIdentifier, ClassIdentifier } from '../../sim/units/Unit';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  RaceDefinition,
} from '../../sim/units/UnitDefinitions';
import { createMemberPortraitCanvas } from './MemberPortrait';
import { describeStatisticBonuses } from './presenters/StatisticDescriptions';

export interface CharacterSheetCallbacks {
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onToggleSlotPicker: (slot: EquipmentSlot) => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: ClassIdentifier) => void;
  onOpenClassPicker: () => void;
}

export interface ClassPickerCallbacks {
  onGoBack: () => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: ClassIdentifier) => void;
}

export interface CharacterSheetContentTables {
  races: Record<string, RaceDefinition>;
  baseClasses: Record<string, BaseClassDefinition>;
  advancedClasses: Record<string, AdvancedClassDefinition>;
  equipment: Record<string, EquipmentDefinition>;
  skills: Record<string, SkillDefinition>;
}

export function buildCharacterSheetContent(
  member: GuildMember,
  guild: GuildState,
  content: CharacterSheetContentTables,
  expandedSlotPicker: EquipmentSlot | undefined,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const race = content.races[member.raceIdentifier];
  const classDefinition =
    content.baseClasses[member.classIdentifier] ??
    content.advancedClasses[member.classIdentifier];
  const sheetElement = document.createElement('div');
  sheetElement.className = 'character-sheet';
  if (race === undefined || classDefinition === undefined) {
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
    baseClass: classDefinition,
    level: member.level,
    position: { column: 0, row: 0 },
    facing: 'north',
    equipment: equippedDefinitions,
  }).baseStatistics;

  const header = document.createElement('div');
  header.className = 'character-sheet-header';
  header.appendChild(createMemberPortraitCanvas(race.displayName, classDefinition.displayName));
  const experienceRequired = experienceRequiredToLevelUpFrom(member.level);
  const headerText = document.createElement('div');
  const nameRow = document.createElement('div');
  nameRow.className = 'character-sheet-name-row';
  const nameHeading = document.createElement('h2');
  nameHeading.textContent = member.displayName;
  const classChangeButton = document.createElement('button');
  classChangeButton.textContent = 'Class Change';
  classChangeButton.addEventListener('click', callbacks.onOpenClassPicker);
  nameRow.appendChild(nameHeading);
  nameRow.appendChild(classChangeButton);
  headerText.appendChild(nameRow);
  headerText.insertAdjacentHTML('beforeend', `
    <p>${race.displayName} ${classDefinition.displayName} · Level ${member.level}</p>
    <p>XP ${member.experiencePoints} / ${experienceRequired}</p>
    <div class="resource-bar"><div class="resource-bar-fill experience" style="width:${Math.min(100, (member.experiencePoints / experienceRequired) * 100)}%"></div></div>
  `);
  header.appendChild(headerText);
  sheetElement.appendChild(header);

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

  sheetElement.appendChild(buildSkillsSection(classDefinition, content));
  return sheetElement;
}

function buildSkillsSection(
  classDefinition: BaseClassDefinition | AdvancedClassDefinition,
  content: CharacterSheetContentTables,
): HTMLElement {
  const skillsSection = document.createElement('div');
  skillsSection.className = 'character-sheet-skills';
  const skillsTitle = document.createElement('p');
  skillsTitle.className = 'menu-section-title';
  skillsTitle.textContent = `Skills — ${classDefinition.displayName}`;
  skillsSection.appendChild(skillsTitle);
  for (const skillIdentifier of ['basic_attack', ...classDefinition.skillIdentifiers]) {
    const skill = content.skills[skillIdentifier];
    if (skill === undefined) {
      continue;
    }
    const skillRow = document.createElement('div');
    skillRow.className = 'skill-row';
    const costNote = skill.manaPointCost === 0 ? '' : ` · ${skill.manaPointCost} MP`;
    const rangeNote = skill.targetingRange === 0 ? 'Self' : `Range ${skill.targetingRange}`;
    skillRow.innerHTML = `
      <strong>${skill.displayName}</strong>
      <span>${skill.description}</span>
      <em>${rangeNote}${costNote}</em>
    `;
    skillsSection.appendChild(skillRow);
  }
  return skillsSection;
}

export function buildClassPickerContent(
  member: GuildMember,
  race: RaceDefinition,
  content: CharacterSheetContentTables,
  callbacks: ClassPickerCallbacks,
): HTMLElement {
  const pickerElement = document.createElement('div');
  pickerElement.className = 'character-sheet-class-picker';

  const pickerHeader = document.createElement('div');
  pickerHeader.className = 'class-picker-header';
  const backButton = document.createElement('button');
  backButton.textContent = '← Back';
  backButton.addEventListener('click', callbacks.onGoBack);
  const pickerTitle = document.createElement('h2');
  pickerTitle.textContent = `${member.displayName} — Class Change`;
  pickerHeader.appendChild(backButton);
  pickerHeader.appendChild(pickerTitle);
  pickerElement.appendChild(pickerHeader);

  pickerElement.appendChild(buildClassSectionTitle('Base classes'));
  for (const classIdentifier of race.allowedBaseClasses) {
    const baseClass = content.baseClasses[classIdentifier];
    if (baseClass === undefined) continue;
    pickerElement.appendChild(
      buildClassRow({
        displayName: baseClass.displayName,
        description: baseClass.description,
        isCurrentClass: classIdentifier === member.classIdentifier,
        isUnlocked: true,
        prerequisiteLabel: undefined,
        onSwitch: () => callbacks.onChangeClass(member.identifier, classIdentifier as BaseClassIdentifier),
      }),
    );
  }

  pickerElement.appendChild(buildClassSectionTitle('Advanced classes'));
  for (const classIdentifier of race.allowedAdvancedClasses) {
    const advancedClass = content.advancedClasses[classIdentifier];
    if (advancedClass === undefined) continue;
    const { prerequisite } = advancedClass;
    const primaryMet =
      (member.classLevelsReached[prerequisite.primaryBaseClass] ?? 0) >= prerequisite.primaryBaseClassLevel;
    const secondaryMet =
      prerequisite.secondaryBaseClass === undefined ||
      (member.classLevelsReached[prerequisite.secondaryBaseClass] ?? 0) >=
        (prerequisite.secondaryBaseClassLevel ?? 0);
    pickerElement.appendChild(
      buildClassRow({
        displayName: advancedClass.displayName,
        description: advancedClass.description,
        isCurrentClass: classIdentifier === member.classIdentifier,
        isUnlocked: primaryMet && secondaryMet,
        prerequisiteLabel: buildPrerequisiteLabel(advancedClass),
        onSwitch: () => callbacks.onChangeClass(member.identifier, classIdentifier),
      }),
    );
  }

  const note = document.createElement('p');
  note.className = 'village-hint';
  note.textContent = 'Switching class keeps level and XP. Gear the new class cannot use returns to the guild inventory.';
  pickerElement.appendChild(note);
  return pickerElement;
}

function buildClassSectionTitle(title: string): HTMLElement {
  const el = document.createElement('p');
  el.className = 'menu-section-title';
  el.textContent = title;
  return el;
}

function buildPrerequisiteLabel(advancedClass: AdvancedClassDefinition): string {
  const { prerequisite } = advancedClass;
  const primaryLabel = `${capitalize(prerequisite.primaryBaseClass)} Lv.${prerequisite.primaryBaseClassLevel}`;
  if (prerequisite.secondaryBaseClass === undefined) {
    return primaryLabel;
  }
  return `${primaryLabel} + ${capitalize(prerequisite.secondaryBaseClass)} Lv.${prerequisite.secondaryBaseClassLevel ?? 0}`;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildClassRow(options: {
  displayName: string;
  description: string;
  isCurrentClass: boolean;
  isUnlocked: boolean;
  prerequisiteLabel: string | undefined;
  onSwitch: () => void;
}): HTMLElement {
  const { displayName, description, isCurrentClass, isUnlocked, prerequisiteLabel, onSwitch } = options;
  const classRow = document.createElement('div');
  classRow.className = ['class-row', isCurrentClass ? 'is-current' : '', isUnlocked ? '' : 'is-locked']
    .filter(Boolean).join(' ');

  const info = document.createElement('div');
  info.className = 'class-row-info';
  const nameEl = document.createElement('strong');
  nameEl.textContent = `${displayName}${isCurrentClass ? ' · current' : ''}${!isUnlocked ? ' 🔒' : ''}`;
  const descEl = document.createElement('p');
  descEl.className = 'class-description';
  descEl.textContent = description;
  info.appendChild(nameEl);
  info.appendChild(descEl);
  classRow.appendChild(info);

  const action = document.createElement('div');
  action.className = 'class-row-action';
  const switchButton = document.createElement('button');
  if (isCurrentClass) {
    switchButton.textContent = 'Current class';
    switchButton.disabled = true;
  } else if (!isUnlocked) {
    switchButton.textContent = 'Locked';
    switchButton.disabled = true;
  } else {
    switchButton.textContent = `Become ${displayName}`;
    switchButton.addEventListener('click', onSwitch);
  }
  action.appendChild(switchButton);
  if (prerequisiteLabel !== undefined) {
    const prereqEl = document.createElement('em');
    prereqEl.className = 'class-prereq';
    prereqEl.textContent = prerequisiteLabel;
    action.appendChild(prereqEl);
  }
  classRow.appendChild(action);
  return classRow;
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
