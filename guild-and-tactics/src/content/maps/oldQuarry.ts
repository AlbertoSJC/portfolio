import { parseBattleMapFromRows } from '../../sim/grid/BattleMap';

/** An abandoned stone quarry — tiered rock ledges reward Jump and flight. */
export const OLD_QUARRY_MAP = parseBattleMapFromRows('old_quarry', 'Old Quarry', [
  'tt......rrtt',
  't....rrrRR.t',
  '....rrRRRr..',
  '..,,,,r,,...',
  '..,.....,...',
  '..,.rr..,...',
  '..,.rr..,..t',
  '..,,,,,,,...',
  '....r.......',
  '..rrR....t..',
  't.rr........',
  'tt........tt',
]);
