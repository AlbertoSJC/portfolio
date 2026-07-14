import type { SkillDefinition } from '@/sim/battle/SkillDefinition';
import type { EquipmentDefinition, EquipmentSlot } from '@/sim/items/EquipmentDefinition';
import type { BaseClassIdentifier, ClassIdentifier } from '@/sim/units/Unit';
import type {
  AdvancedClassDefinition,
  BaseClassDefinition,
  RaceDefinition,
} from '@/sim/units/UnitDefinitions';

export interface CharacterSheetCallbacks {
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onToggleSlotPicker: (slot: EquipmentSlot) => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: ClassIdentifier) => void;
  onOpenClassPicker: () => void;
  onSetSecondarySkillClass: (memberIdentifier: string, classIdentifier: BaseClassIdentifier | undefined) => void;
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
