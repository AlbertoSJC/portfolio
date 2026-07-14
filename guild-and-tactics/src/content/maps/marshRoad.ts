import { parseBattleMapFromRows } from '@/sim/grid/BattleMap';

/** Soggy lowland east of Wanderer's Rest — pools force ground units around. */
export const MARSH_ROAD_MAP = parseBattleMapFromRows('marsh_road', 'Marsh Road', [
  'tt...~~.....',
  't....~~~....',
  '...,,,,,,...',
  '..,,....,,..',
  '..,..~~..,..',
  '..,..~~..,.t',
  '..,......,..',
  '..,,,,,,,,..',
  '....~~......',
  '...t~~...t..',
  '............',
  'tt........tt',
]);
