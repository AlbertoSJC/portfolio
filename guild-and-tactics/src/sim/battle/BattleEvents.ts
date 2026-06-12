import type { GridPosition } from '../grid/GridPosition';

/**
 * Everything noteworthy a command produced, in order. The UI renders these
 * as combat-log lines and floating text; the sim never touches the DOM.
 */
export type BattleEvent =
  | { kind: 'unitMoved'; unitIdentifier: string; from: GridPosition; to: GridPosition }
  | {
      kind: 'skillUsed';
      unitIdentifier: string;
      skillIdentifier: string;
      targetTile: GridPosition;
    }
  | {
      kind: 'damageDealt';
      attackerIdentifier: string;
      defenderIdentifier: string;
      amount: number;
      wasCriticalHit: boolean;
    }
  | { kind: 'attackMissed'; attackerIdentifier: string; defenderIdentifier: string }
  | { kind: 'healingReceived'; healerIdentifier: string; targetIdentifier: string; amount: number }
  | {
      kind: 'statModifierApplied';
      targetIdentifier: string;
      statistic: string;
      amount: number;
      durationTurns: number;
    }
  | { kind: 'unitKnockedOut'; unitIdentifier: string }
  | { kind: 'turnStarted'; unitIdentifier: string }
  | { kind: 'turnEnded'; unitIdentifier: string }
  | { kind: 'battleEnded'; outcome: 'victory' | 'defeat' };
