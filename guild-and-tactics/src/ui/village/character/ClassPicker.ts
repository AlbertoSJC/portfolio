import type { GuildMember } from '../../../sim/guild/GuildState';
import type { BaseClassIdentifier } from '../../../sim/units/Unit';
import type {
  AdvancedClassDefinition,
  RaceDefinition,
} from '../../../sim/units/UnitDefinitions';
import type { CharacterSheetContentTables, ClassPickerCallbacks } from './CharacterSheetTypes';

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
  pickerHeader.append(backButton, pickerTitle);
  pickerElement.appendChild(pickerHeader);

  // ── Tab bar ───────────────────────────────────────────────────────────
  const tabBar = document.createElement('div');
  tabBar.className = 'skills-panel-tab-bar';
  const baseTab = document.createElement('button');
  baseTab.textContent = 'Base Classes';
  baseTab.className = 'is-active';
  const advancedTab = document.createElement('button');
  advancedTab.textContent = 'Advanced Classes';
  tabBar.append(baseTab, advancedTab);
  pickerElement.appendChild(tabBar);

  // ── Base classes list ─────────────────────────────────────────────────
  const baseScroll = document.createElement('div');
  baseScroll.className = 'skills-panel-scroll class-picker-scroll';
  for (const classIdentifier of race.allowedBaseClasses) {
    const baseClass = content.baseClasses[classIdentifier];
    if (baseClass === undefined) continue;
    baseScroll.appendChild(
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

  // ── Advanced classes list ─────────────────────────────────────────────
  const advancedScroll = document.createElement('div');
  advancedScroll.className = 'skills-panel-scroll class-picker-scroll';
  advancedScroll.style.display = 'none';
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
    advancedScroll.appendChild(
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

  baseTab.addEventListener('click', () => {
    baseScroll.style.display = '';
    advancedScroll.style.display = 'none';
    baseTab.classList.add('is-active');
    advancedTab.classList.remove('is-active');
  });
  advancedTab.addEventListener('click', () => {
    baseScroll.style.display = 'none';
    advancedScroll.style.display = '';
    baseTab.classList.remove('is-active');
    advancedTab.classList.add('is-active');
  });

  pickerElement.append(baseScroll, advancedScroll);

  const note = document.createElement('p');
  note.className = 'village-hint';
  note.textContent = 'Switching class keeps level and XP. Gear the new class cannot use returns to the guild inventory.';
  pickerElement.appendChild(note);
  return pickerElement;
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
  info.append(nameEl, descEl);
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
