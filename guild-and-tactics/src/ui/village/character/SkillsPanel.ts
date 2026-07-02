import type { SkillDefinition } from '../../../sim/battle/SkillDefinition';
import type { GuildMember } from '../../../sim/guild/GuildState';
import type { BaseClassIdentifier } from '../../../sim/units/Unit';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  ClassSkillEntry,
} from '../../../sim/units/UnitDefinitions';
import {
  equipmentGrantedSkillIdentifiersForMember,
  isSkillMastered,
  masteredSkillIdentifiersForMember,
  SKILL_USES_TO_MASTER,
} from '../../../sim/guild/SkillMastery';
import { createSkillIconCanvas, iconKindForSkill } from '../SkillIcons';
import type { CharacterSheetCallbacks, CharacterSheetContentTables } from './CharacterSheetTypes';

export function buildSkillsPanel(
  member: GuildMember,
  classDefinition: BaseClassDefinition | AdvancedClassDefinition,
  content: CharacterSheetContentTables,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'skills-panel';

  const tabBar = document.createElement('div');
  tabBar.className = 'skills-panel-tab-bar';
  const primaryBtn = document.createElement('button');
  primaryBtn.textContent = `Primary · ${classDefinition.displayName}`;
  primaryBtn.className = 'is-active';
  const secondaryBtn = document.createElement('button');
  secondaryBtn.textContent = 'Secondary';
  tabBar.append(primaryBtn, secondaryBtn);
  panel.appendChild(tabBar);

  const scrollArea = document.createElement('div');
  scrollArea.className = 'skills-panel-scroll';

  const primaryPanel = buildPrimarySkillList(classDefinition, content, member.level);
  primaryPanel.appendChild(buildGearSkillSection(member, content));
  const secondaryPanel = buildSecondarySkillList(member, content, callbacks);
  secondaryPanel.style.display = 'none';

  primaryBtn.addEventListener('click', () => {
    primaryPanel.style.display = '';
    secondaryPanel.style.display = 'none';
    primaryBtn.classList.add('is-active');
    secondaryBtn.classList.remove('is-active');
  });
  secondaryBtn.addEventListener('click', () => {
    primaryPanel.style.display = 'none';
    secondaryPanel.style.display = '';
    primaryBtn.classList.remove('is-active');
    secondaryBtn.classList.add('is-active');
  });

  scrollArea.append(primaryPanel, secondaryPanel);
  panel.appendChild(scrollArea);
  return panel;
}

function buildPrimarySkillList(
  classDefinition: BaseClassDefinition | AdvancedClassDefinition,
  content: CharacterSheetContentTables,
  memberLevel: number,
): HTMLElement {
  const list = document.createElement('div');
  const basicAttack = content.skills['basic_attack'];
  if (basicAttack !== undefined) {
    list.appendChild(buildSkillRow(basicAttack, true));
  }
  for (const entry of classDefinition.skills) {
    const skill = content.skills[entry.skillIdentifier];
    if (skill === undefined) continue;
    list.appendChild(buildSkillRow(skill, entry.learnedAtLevel <= memberLevel, entry.learnedAtLevel));
  }
  return list;
}

/**
 * Skills tied to gear (PRD §7): granted by a worn item and mastered through
 * use, plus skills already mastered this way (known even without the item).
 */
function buildGearSkillSection(
  member: GuildMember,
  content: CharacterSheetContentTables,
): HTMLElement {
  const section = document.createElement('div');
  const grantedSkillIdentifiers = equipmentGrantedSkillIdentifiersForMember(
    member,
    content.equipment,
  );
  const masteredSkillIdentifiers = masteredSkillIdentifiersForMember(member);
  const gearSkillIdentifiers = [
    ...new Set([...grantedSkillIdentifiers, ...masteredSkillIdentifiers]),
  ];
  if (gearSkillIdentifiers.length === 0) {
    return section;
  }

  const title = document.createElement('p');
  title.className = 'menu-section-title';
  title.textContent = 'Gear skills';
  section.appendChild(title);

  for (const skillIdentifier of gearSkillIdentifiers) {
    const skill = content.skills[skillIdentifier];
    if (skill === undefined) continue;
    const masteryLabel = isSkillMastered(member, skillIdentifier)
      ? 'Mastered'
      : `Mastery ${member.skillMasteryProgress[skillIdentifier] ?? 0}/${SKILL_USES_TO_MASTER}`;
    section.appendChild(buildSkillRow(skill, true, undefined, masteryLabel));
  }
  return section;
}

function buildSkillRow(
  skill: SkillDefinition,
  isUnlocked: boolean,
  learnedAtLevel?: number,
  rightLabelSuffix?: string,
): HTMLElement {
  const skillRow = document.createElement('div');
  skillRow.className = isUnlocked ? 'skill-row' : 'skill-row is-locked';

  const nameEl = document.createElement('strong');
  nameEl.textContent = skill.displayName;

  const descEl = document.createElement('span');
  descEl.textContent = skill.description;

  const costNote = skill.manaPointCost === 0 ? '' : ` · ${skill.manaPointCost} MP`;
  const rangeNote = skill.targetingRange === 0 ? 'Self' : `Range ${skill.targetingRange}`;
  const masteryNote = rightLabelSuffix === undefined ? '' : ` · ${rightLabelSuffix}`;
  const rightLabel = !isUnlocked && learnedAtLevel !== undefined
    ? `Unlocks at Lv.${learnedAtLevel}`
    : `${rangeNote}${costNote}${masteryNote}`;
  const infoEl = document.createElement('em');
  infoEl.textContent = rightLabel;

  skillRow.append(createSkillIconCanvas(iconKindForSkill(skill)), nameEl, descEl, infoEl);
  return skillRow;
}

function buildSecondarySkillList(
  member: GuildMember,
  content: CharacterSheetContentTables,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const list = document.createElement('div');

  const eligibleClassIds = (Object.keys(member.classLevelsReached) as BaseClassIdentifier[]).filter(
    (id) => id !== member.classIdentifier,
  );

  if (eligibleClassIds.length === 0) {
    const hint = document.createElement('p');
    hint.className = 'village-hint';
    hint.textContent = 'Level up in a second base class to unlock a secondary skill set.';
    list.appendChild(hint);
    return list;
  }

  const pickerRow = document.createElement('div');
  pickerRow.className = 'secondary-skill-picker';
  for (const classId of eligibleClassIds) {
    const classDef = content.baseClasses[classId];
    if (classDef === undefined) continue;
    const isSelected = member.secondarySkillClassIdentifier === classId;
    const btn = document.createElement('button');
    btn.textContent = classDef.displayName;
    btn.className = isSelected ? 'is-active' : '';
    btn.addEventListener('click', () =>
      callbacks.onSetSecondarySkillClass(member.identifier, isSelected ? undefined : classId),
    );
    pickerRow.appendChild(btn);
  }
  list.appendChild(pickerRow);

  const activeClassId = member.secondarySkillClassIdentifier;
  if (activeClassId !== undefined && eligibleClassIds.includes(activeClassId)) {
    const activeClass = content.baseClasses[activeClassId];
    const levelReached = member.classLevelsReached[activeClassId] ?? 0;
    if (activeClass !== undefined) {
      const unlockedSkills: ClassSkillEntry[] = activeClass.skills.filter(
        (entry) => entry.learnedAtLevel <= levelReached,
      );
      if (unlockedSkills.length === 0) {
        const hint = document.createElement('p');
        hint.className = 'village-hint';
        hint.textContent = `No skills unlocked yet in ${activeClass.displayName}.`;
        list.appendChild(hint);
      } else {
        for (const entry of unlockedSkills) {
          const skill = content.skills[entry.skillIdentifier];
          if (skill !== undefined) list.appendChild(buildSkillRow(skill, true));
        }
      }
    }
  }

  return list;
}
