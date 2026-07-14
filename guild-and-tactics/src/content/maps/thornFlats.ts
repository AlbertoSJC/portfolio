import { parseBattleMapFromRows } from '@/sim/grid/BattleMap';

/**
 * Thorns Plain's signature landscape: grass broken by impassable thorn
 * brakes (tree tiles) that pinch movement into lanes — the terrain itself
 * is the bandits' favorite weapon.
 * Legend in BattleMap.ts: . grass · , path · r/R raised rock · t tree · ~ water
 */
export const THORN_FLATS_MAP = parseBattleMapFromRows('thorn_flats', 'Thorn Flats', [
  '............',
  '..tt....tt..',
  '............',
  '.t..tt..t...',
  '.t......t...',
  '....rr......',
  '.t......tt..',
  '...tt.......',
  '.t......t...',
  '............',
  '............',
  '..t......t..',
]);
