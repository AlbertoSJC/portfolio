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
    case 'statusEffectApplied': {
      const statusLabel = {
        poison: 'poisoned',
        sleep: 'put to sleep',
        blind: 'blinded',
        slow: 'slowed',
        haste: 'hastened',
        protect: 'warded against blows',
        shell: 'warded against magic',
        regen: 'blessed with regeneration',
        silence: 'silenced',
        doom: 'marked for doom',
        stop: 'frozen in time',
        confuse: 'confused',
        berserk: 'sent into a berserk rage',
      }[event.statusEffect];
      return `${unitName(battle, event.targetIdentifier)} is ${statusLabel} for ${event.durationTurns} turns.`;
    }
    case 'poisonDamageDealt':
      return `${unitName(battle, event.targetIdentifier)} takes ${event.amount} poison damage.`;
    case 'regenHealingRestored':
      return `${unitName(battle, event.targetIdentifier)} regenerates ${event.amount} hit points.`;
    case 'turnSkippedBySleep':
      return `${unitName(battle, event.unitIdentifier)} is fast asleep and cannot move.`;
    case 'turnSkippedByStop':
      return `${unitName(battle, event.unitIdentifier)} is frozen in time and cannot act.`;
    case 'doomTriggered':
      return `Doom claims ${unitName(battle, event.targetIdentifier)}!`;
    case 'berserkAttackResolved':
      return `${unitName(battle, event.unitIdentifier)} rages, out of control!`;
    case 'confusedAttackResolved':
      return `${unitName(battle, event.unitIdentifier)} is confused and lashes out!`;
    case 'unitKnockedOut':
      return `${unitName(battle, event.unitIdentifier)} is knocked out!`;
    case 'guildFled':
      return `${unitName(battle, event.unitIdentifier)} calls the retreat!`;
    case 'battleEnded':
      switch (event.outcome) {
        case 'victory':
          return 'Victory! The clearing is safe.';
        case 'defeat':
          return 'The guild has fallen...';
        case 'fled':
          return 'The guild slips away from the fight.';
      }
  }
}
