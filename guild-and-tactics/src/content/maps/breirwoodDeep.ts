import { parseBattleMapFromRows } from '@/sim/grid/BattleMap';

/**
 * Deep Breirwood: old-growth walls of trees, a pilgrim path winding
 * through, and a raised shrine mound (Breir's and Taurk's) at the north.
 * Legend in BattleMap.ts: . grass · , path · r/R raised rock · t tree · ~ water
 */
export const BREIRWOOD_DEEP_MAP = parseBattleMapFromRows('breirwood_deep', 'Breirwood Deep', [
  'tt.t....t.tt',
  't....rr....t',
  '.....rR.....',
  '..,,,,,,,...',
  't.,......t.t',
  '..,..t......',
  't.,......t.t',
  '..,,,,,....t',
  't.....,.....',
  '......,....t',
  't...........',
  'tt.t.....ttt',
]);
