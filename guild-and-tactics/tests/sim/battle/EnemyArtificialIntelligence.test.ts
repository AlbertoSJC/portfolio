import { describe, expect, it } from 'vitest';
import { Battle } from '@/sim/battle/Battle';
import { planEnemyTurn } from '@/sim/battle/EnemyArtificialIntelligence';
import { parseBattleMapFromRows } from '@/sim/grid/BattleMap';
import { manhattanDistance } from '@/sim/grid/GridPosition';
import { SKILLS } from '@/content/skills';
import { createTestUnit } from '@tests/mocks/unitMocks';

const OPEN_MAP = parseBattleMapFromRows('ai_arena', 'AI Arena', [
  '........',
  '........',
  '........',
  '........',
  '........',
]);

const FIXED_TEST_SEED = 7;

describe('planEnemyTurn', () => {
  it('attacks a target it can already reach', () => {
    const guildTarget = createTestUnit({ position: { column: 2, row: 2 }, baseStatistics: { speed: 4 } });
    const adjacentEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 3, row: 2 },
      baseStatistics: { speed: 12 },
    });
    const battle = new Battle(OPEN_MAP, [guildTarget, adjacentEnemy], SKILLS, FIXED_TEST_SEED);
    const plan = planEnemyTurn(battle, adjacentEnemy);
    expect(plan.skillIdentifier).toBeDefined();
    expect(plan.skillTargetTile).toEqual(guildTarget.position);
  });

  it('advances toward the nearest foe when no attack is possible', () => {
    const distantGuildUnit = createTestUnit({ position: { column: 0, row: 0 }, baseStatistics: { speed: 4 } });
    const farEnemy = createTestUnit({
      team: 'enemy',
      position: { column: 7, row: 4 },
      baseStatistics: { speed: 12, movementRange: 2 },
    });
    const battle = new Battle(OPEN_MAP, [distantGuildUnit, farEnemy], SKILLS, FIXED_TEST_SEED);
    const plan = planEnemyTurn(battle, farEnemy);
    expect(plan.skillIdentifier).toBeUndefined();
    expect(plan.moveDestination).toBeDefined();
    if (plan.moveDestination !== undefined) {
      const distanceAfterMove = manhattanDistance(plan.moveDestination, distantGuildUnit.position);
      const distanceBefore = manhattanDistance(farEnemy.position, distantGuildUnit.position);
      expect(distanceAfterMove).toBeLessThan(distanceBefore);
    }
  });

  it('prefers the target it can knock out', () => {
    const healthyTarget = createTestUnit({
      identifier: 'healthy',
      position: { column: 2, row: 1 },
      baseStatistics: { speed: 4 },
    });
    const dyingTarget = createTestUnit({
      identifier: 'dying',
      position: { column: 2, row: 3 },
      currentHitPoints: 1,
      baseStatistics: { speed: 4 },
    });
    const enemyBetweenBoth = createTestUnit({
      team: 'enemy',
      position: { column: 2, row: 2 },
      baseStatistics: { speed: 12 },
    });
    const battle = new Battle(
      OPEN_MAP,
      [healthyTarget, dyingTarget, enemyBetweenBoth],
      SKILLS,
      FIXED_TEST_SEED,
    );
    const plan = planEnemyTurn(battle, enemyBetweenBoth);
    expect(plan.skillTargetTile).toEqual(dyingTarget.position);
  });
});
