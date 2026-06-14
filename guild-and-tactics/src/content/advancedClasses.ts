import type { AdvancedClassDefinition } from '../sim/units/UnitDefinitions';
import { SHARED_ADVANCED_CLASSES } from './advancedClasses/shared';
import { HUMAN_ADVANCED_CLASSES } from './advancedClasses/human';
import { WERECAT_ADVANCED_CLASSES } from './advancedClasses/werecat';
import { WERELIZARD_ADVANCED_CLASSES } from './advancedClasses/werelizard';
import { UNDEAD_ADVANCED_CLASSES } from './advancedClasses/undead';
import { FERYAN_ADVANCED_CLASSES } from './advancedClasses/feryan';

export {
  PURE_ADVANCED_CLASS_UNLOCK_LEVEL,
  HYBRID_PRIMARY_UNLOCK_LEVEL,
  HYBRID_SECONDARY_UNLOCK_LEVEL,
} from './advancedClasses/shared';

export const ADVANCED_CLASSES: Record<string, AdvancedClassDefinition> = {
  ...SHARED_ADVANCED_CLASSES,
  ...HUMAN_ADVANCED_CLASSES,
  ...WERECAT_ADVANCED_CLASSES,
  ...WERELIZARD_ADVANCED_CLASSES,
  ...UNDEAD_ADVANCED_CLASSES,
  ...FERYAN_ADVANCED_CLASSES,
};
