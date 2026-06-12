import type { Battle } from '../sim/battle/Battle';
import type { BattleEvent } from '../sim/battle/BattleEvents';

function unitName(battle: Battle, unitIdentifier: string): string {
  return battle.getUnitByIdentifier(unitIdentifier)?.displayName ?? unitIdentifier;
}

/** One human-readable combat-log line per event; undefined = nothing to log. */
export function formatBattleEventAsLogLine(
  battle: Battle,
  event: BattleEvent,
): string | undefined {
  switch (event.kind) {
    case 'turnStarted':
      return `— ${unitName(battle, event.unitIdentifier)}'s turn —`;
    case 'turnEnded':
      return undefined;
    case 'unitMoved':
      return undefined;
    case 'skillUsed': {
      const skill = battle.getSkillByIdentifier(event.skillIdentifier);
      return `${unitName(battle, event.unitIdentifier)} uses ${skill.displayName}.`;
    }
    case 'damageDealt': {
      const criticalNote = event.wasCriticalHit ? ' Critical hit!' : '';
      return `${unitName(battle, event.defenderIdentifier)} takes ${event.amount} damage.${criticalNote}`;
    }
    case 'attackMissed':
      return `${unitName(battle, event.attackerIdentifier)} misses ${unitName(battle, event.defenderIdentifier)}.`;
    case 'healingReceived':
      return `${unitName(battle, event.targetIdentifier)} recovers ${event.amount} hit points.`;
    case 'manaRestored':
      return `${unitName(battle, event.targetIdentifier)} recovers ${event.amount} mana points.`;
    case 'itemUsed': {
      const item = battle.getItemByIdentifier(event.itemIdentifier);
      return `${unitName(battle, event.unitIdentifier)} uses a ${item.displayName} on ${unitName(battle, event.targetIdentifier)}.`;
    }
    case 'statModifierApplied': {
      const signedAmount = event.amount >= 0 ? `+${event.amount}` : `${event.amount}`;
      return `${unitName(battle, event.targetIdentifier)} gains ${signedAmount} ${event.statistic} for ${event.durationTurns} turns.`;
    }
    case 'unitKnockedOut':
      return `${unitName(battle, event.unitIdentifier)} is knocked out!`;
    case 'battleEnded':
      return event.outcome === 'victory' ? 'Victory! The clearing is safe.' : 'The guild has fallen...';
  }
}
