import { parseBattleMapFromRows } from '@/sim/grid/BattleMap';

/**
 * The heartland crossroads: two paths meet by the drinking lake, and the
 * goblins' cavern mouth rises as rock at the north edge.
 * Legend in BattleMap.ts: . grass · , path · r/R raised rock · t tree · ~ water
 */
export const CROSSPATHS_FIELD_MAP = parseBattleMapFromRows('crosspaths_field', 'Crosspaths Field', [
  '.....rr.....',
  '....rRr.....',
  '.....,......',
  '.....,......',
  ',,,,,,,,,,,,',
  '.....,..~~~.',
  '.....,..~~~.',
  '.....,...~..',
  '.....,......',
  '.....,......',
  '.....,......',
  't..........t',
]);
