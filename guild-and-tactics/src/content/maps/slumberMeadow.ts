import { parseBattleMapFromRows } from '../../sim/grid/BattleMap';

/**
 * Open, rainy meadow west of the heartland crossroads — wide sightlines,
 * rain pools mid-field, barely any cover. The blue sleep-flowers live in
 * the quest text (and in the Man-Eater Bloom's spores), not the terrain.
 * Legend in BattleMap.ts: . grass · , path · r/R raised rock · t tree · ~ water
 */
export const SLUMBER_MEADOW_MAP = parseBattleMapFromRows('slumber_meadow', 'Slumber Meadow', [
  '............',
  '...t....t...',
  '..,,,,,,,...',
  '..,......,..',
  't.,..~~..,..',
  '..,..~~..,.t',
  '..,......,..',
  '..,,,,,,,,..',
  '............',
  '.t.......t..',
  '............',
  't..........t',
]);
