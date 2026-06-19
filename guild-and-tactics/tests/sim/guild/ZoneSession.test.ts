import { describe, expect, it } from 'vitest';
import { ZoneSession } from '../../../src/sim/guild/ZoneSession';
import type { ZoneDefinition } from '../../../src/sim/guild/ZoneDefinition';

const TEST_ZONE: ZoneDefinition = {
  identifier: 'test_zone',
  displayName: 'Test Zone',
  description: 'A zone used only in tests.',
  explorationGridWidth: 5,
  explorationGridHeight: 5,
  obstacleTiles: [],
  entryTile: { column: 0, row: 0 },
  tavernTile: { column: 4, row: 4 },
  roamingGroups: [
    {
      identifier: 'wolf_pack',
      patrolRoute: [
        { column: 2, row: 0 },
        { column: 2, row: 1 },
        { column: 2, row: 2 },
        { column: 2, row: 1 },
      ],
      monsterIdentifiers: ['twisted_wolf'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
  ],
  battleMapIdentifier: 'forest_clearing',
  encounterSpawnTiles: [{ column: 2, row: 1 }],
  rewardGoldPerEncounter: 20,
};

describe('ZoneSession', () => {
  it('starts the player on the entry tile and groups at their first patrol position', () => {
    const session = new ZoneSession(TEST_ZONE);
    expect(session.getPlayerPosition()).toEqual(TEST_ZONE.entryTile);
    expect(session.getActiveRoamingGroupPositions()).toEqual([
      { groupIdentifier: 'wolf_pack', position: { column: 2, row: 0 } },
    ]);
  });

  it('advances every active group one patrol step per player step', () => {
    const session = new ZoneSession(TEST_ZONE);
    session.movePlayerTo({ column: 1, row: 0 });
    expect(session.getActiveRoamingGroupPositions()).toEqual([
      { groupIdentifier: 'wolf_pack', position: { column: 2, row: 1 } },
    ]);
    session.movePlayerTo({ column: 1, row: 1 });
    expect(session.getActiveRoamingGroupPositions()).toEqual([
      { groupIdentifier: 'wolf_pack', position: { column: 2, row: 2 } },
    ]);
  });

  it('loops the patrol route back to the start', () => {
    const session = new ZoneSession(TEST_ZONE);
    for (let step = 0; step < 4; step += 1) {
      session.movePlayerTo({ column: step, row: 0 });
    }
    expect(session.getActiveRoamingGroupPositions()).toEqual([
      { groupIdentifier: 'wolf_pack', position: { column: 2, row: 0 } },
    ]);
  });

  it('reports a collision when the player and a group end up on the same tile', () => {
    // The pack starts at (2,0) and steps to (2,1) on this same move — landing
    // on (2,1) is where the collision happens, not the pack's old tile.
    const session = new ZoneSession(TEST_ZONE);
    const result = session.movePlayerTo({ column: 2, row: 1 });
    expect(result.collidedGroupIdentifier).toBe('wolf_pack');
    expect(result.enteredTavern).toBe(false);
  });

  it('does not collide when the player walks onto a tile the group just left', () => {
    const session = new ZoneSession(TEST_ZONE);
    const result = session.movePlayerTo({ column: 2, row: 0 });
    expect(result.collidedGroupIdentifier).toBeUndefined();
  });

  it('reports entering the tavern tile', () => {
    const session = new ZoneSession(TEST_ZONE);
    const result = session.movePlayerTo({ column: 4, row: 4 });
    expect(result.enteredTavern).toBe(true);
    expect(result.collidedGroupIdentifier).toBeUndefined();
  });

  it('removes a defeated group from collisions and from the active positions list', () => {
    const session = new ZoneSession(TEST_ZONE);
    session.markGroupDefeated('wolf_pack');
    const result = session.movePlayerTo({ column: 2, row: 0 });
    expect(result.collidedGroupIdentifier).toBeUndefined();
    expect(session.getActiveRoamingGroupPositions()).toEqual([]);
  });
});
