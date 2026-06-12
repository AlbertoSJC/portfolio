import { parseBattleMapFromRows } from '../../sim/grid/BattleMap';

/**
 * M1 battle map: a clearing in the werecat forests north of Wanderer's Rest.
 * Legend in BattleMap.ts: . grass · , path · r/R raised rock · t tree · ~ water
 */
export const FOREST_CLEARING_MAP = parseBattleMapFromRows(
  'forest_clearing',
  'Forest Clearing',
  [
    'tt....rr....',
    't......rr..t',
    '..,,,,,,,...',
    '..,....t,...',
    '..,..~~.,..t',
    '..,..~~.,...',
    '..,.....,...',
    't.,,,,,,,...',
    '....r.......',
    '...rR....t..',
    't..rr.......',
    'tt........tt',
  ],
);
