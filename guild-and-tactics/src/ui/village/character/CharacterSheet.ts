import type { GuildMember, GuildState } from '@/sim/guild/GuildState';
import { equippedDefinitionsForMember } from '@/sim/guild/MemberEquipment';
import type { EquipmentSlot } from '@/sim/items/EquipmentDefinition';
import { experienceRequiredToLevelUpFrom } from '@/sim/progression/ExperienceAndLevels';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  RaceDefinition,
} from '@/sim/units/UnitDefinitions';
import { createUnitFromCharacter } from '@/sim/units/UnitFactory';
import { createMemberPortraitCanvas } from '../MemberPortrait';
import { buildEquipmentSection } from './EquipmentSection';
import { buildSkillsPanel } from './SkillsPanel';
import type { CharacterSheetCallbacks, CharacterSheetContentTables } from './CharacterSheetTypes';

type BattleStatistics = ReturnType<typeof createUnitFromCharacter>['baseStatistics'];

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
  const { baseStatistics } = createUnitFromCharacter({
    identifier: 'sheet_preview',
    displayName: member.displayName,
    team: 'guild',
    race,
    baseClass: classDefinition,
    level: member.level,
    position: { column: 0, row: 0 },
    facing: 'north',
    equipment: equippedDefinitions,
  });

  sheetElement.appendChild(buildTopRow(member, race, classDefinition, baseStatistics, callbacks));
  sheetElement.appendChild(buildSkillsPanel(member, classDefinition, content, callbacks));
  sheetElement.appendChild(buildEquipmentSection(member, guild, content, expandedSlotPicker, callbacks));
  return sheetElement;
}

// ── Top row ──────────────────────────────────────────────────────────────────

function buildTopRow(
  member: GuildMember,
  race: RaceDefinition,
  classDefinition: BaseClassDefinition | AdvancedClassDefinition,
  baseStatistics: BattleStatistics,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const topRow = document.createElement('div');
  topRow.className = 'character-sheet-top';
  topRow.appendChild(buildMemberHeader(member, race, classDefinition, callbacks));
  topRow.appendChild(buildStatisticsGrid(baseStatistics, race));
  return topRow;
}

function buildMemberHeader(
  member: GuildMember,
  race: RaceDefinition,
  classDefinition: BaseClassDefinition | AdvancedClassDefinition,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const header = document.createElement('div');
  header.className = 'character-sheet-header';
  header.appendChild(createMemberPortraitCanvas(race.displayName, classDefinition.displayName));
  header.appendChild(buildIdentityInfo(member, race, classDefinition, callbacks));
  return header;
}

function buildIdentityInfo(
  member: GuildMember,
  race: RaceDefinition,
  classDefinition: BaseClassDefinition | AdvancedClassDefinition,
  callbacks: CharacterSheetCallbacks,
): HTMLElement {
  const container = document.createElement('div');

  const nameRow = document.createElement('div');
  nameRow.className = 'character-sheet-name-row';
  const nameHeading = document.createElement('h2');
  nameHeading.textContent = member.displayName;
  const classChangeButton = document.createElement('button');
  classChangeButton.textContent = 'Class Change';
  classChangeButton.addEventListener('click', callbacks.onOpenClassPicker);
  nameRow.append(nameHeading, classChangeButton);

  const classLine = document.createElement('p');
  classLine.textContent = `${race.displayName} ${classDefinition.displayName} · Level ${member.level}`;

  const experienceRequired = experienceRequiredToLevelUpFrom(member.level);
  const xpLine = document.createElement('p');
  xpLine.textContent = `XP ${member.experiencePoints} / ${experienceRequired}`;

  container.append(nameRow, classLine, xpLine, buildXpBar(member.experiencePoints, experienceRequired));
  return container;
}

function buildXpBar(currentXp: number, requiredXp: number): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'resource-bar';
  const fill = document.createElement('div');
  fill.className = 'resource-bar-fill experience';
  fill.style.width = `${Math.min(100, (currentXp / requiredXp) * 100)}%`;
  bar.appendChild(fill);
  return bar;
}

function buildStatisticsGrid(stats: BattleStatistics, race: RaceDefinition): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'character-sheet-statistics';

  const entries: [string, string][] = [
    ['HP', `${stats.hitPointsMaximum}`],
    ['MP', `${stats.manaPointsMaximum}`],
    ['ATK', `${stats.attack}`],
    ['DEF', `${stats.defense}`],
    ['MAG', `${stats.magicPower}`],
    ['RES', `${stats.magicResistance}`],
    ['SPD', `${stats.speed}`],
    ['MOVE', `${stats.movementRange}${race.canFly ? ' (flies)' : ''}`],
    ['JUMP', `${stats.jumpHeight}`],
    ['EVA', `${Math.round(stats.evasion * 100)}%`],
  ];

  for (const [label, value] of entries) {
    const cell = document.createElement('div');
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const valueEl = document.createElement('strong');
    valueEl.textContent = value;
    cell.append(labelEl, valueEl);
    grid.appendChild(cell);
  }
  return grid;
}
