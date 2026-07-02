import { describe, expect, it } from 'vitest';
import { ZoneSession } from '../../../src/sim/guild/ZoneSession';
import type { ZoneDefinition } from '../../../src/sim/guild/ZoneDefinition';

const TEST_ZONE: ZoneDefinition = {
  identifier: 'test_zone',
  displayName: 'Test Zone',
  description: 'A zone used only in tests.',
  entryLocationIdentifier: 'gate',
  locations: [
    { identifier: 'gate', displayName: 'Gate', kind: 'landmark', position: { x: 0, y: 0.5 } },
    { identifier: 'crossing', displayName: 'Crossing', kind: 'landmark', position: { x: 0.3, y: 0.5 } },
    { identifier: 'grove', displayName: 'Grove', kind: 'landmark', position: { x: 0.6, y: 0.2 } },
    { identifier: 'bridge', displayName: 'Bridge', kind: 'landmark', position: { x: 0.6, y: 0.8 } },
    { identifier: 'tavern', displayName: 'Tavern', kind: 'tavern', position: { x: 1, y: 0.5 } },
  ],
  roads: [
    { fromLocationIdentifier: 'gate', toLocationIdentifier: 'crossing' },
    { fromLocationIdentifier: 'crossing', toLocationIdentifier: 'grove' },
    { fromLocationIdentifier: 'crossing', toLocationIdentifier: 'bridge' },
    { fromLocationIdentifier: 'grove', toLocationIdentifier: 'tavern' },
    { fromLocationIdentifier: 'bridge', toLocationIdentifier: 'tavern' },
  ],
  roamingGroups: [
    {
      identifier: 'wolf_pack',
      patrolRoute: ['crossing', 'grove', 'bridge'],
      monsterIdentifiers: ['twisted_wolf'],
      minimumEnemyCount: 1,
      maximumEnemyCount: 2,
    },
  ],
  battleMapIdentifier: 'forest_clearing',
  monsterLevelRange: { minimumLevel: 2, maximumLevel: 3 },
  rewardGoldPerEncounter: 20,
};

describe('ZoneSession', () => {
  it('starts the player on the entry location and groups at their first patrol stop', () => {
    const session = new ZoneSession(TEST_ZONE);
    expect(session.getPlayerLocationIdentifier()).toBe('gate');
    expect(session.getActiveRoamingGroupLocations()).toEqual([
      { groupIdentifier: 'wolf_pack', locationIdentifier: 'crossing' },
    ]);
  });

  it('advances every active group one patrol stop per player move', () => {
    const session = new ZoneSession(TEST_ZONE);
    session.movePlayerTo('crossing');
    expect(session.getActiveRoamingGroupLocations()).toEqual([
      { groupIdentifier: 'wolf_pack', locationIdentifier: 'grove' },
    ]);
    session.movePlayerTo('grove');
    expect(session.getActiveRoamingGroupLocations()).toEqual([
      { groupIdentifier: 'wolf_pack', locationIdentifier: 'bridge' },
    ]);
  });

  it('loops the patrol route back to the start', () => {
    const session = new ZoneSession(TEST_ZONE);
    session.movePlayerTo('crossing');
    session.movePlayerTo('grove');
    session.movePlayerTo('tavern');
    expect(session.getActiveRoamingGroupLocations()).toEqual([
      { groupIdentifier: 'wolf_pack', locationIdentifier: 'crossing' },
    ]);
  });

  it('reports a collision when the player and a group end up on the same location', () => {
    // The pack starts at 'crossing' and steps to 'grove' on this same move —
    // landing on 'grove' is where the collision happens, not the pack's old stop.
    const session = new ZoneSession(TEST_ZONE);
    const result = session.movePlayerTo('grove');
    expect(result.collidedGroupIdentifier).toBe('wolf_pack');
    expect(result.enteredTavern).toBe(false);
  });

  it('does not collide when the player walks onto a location the group just left', () => {
    const session = new ZoneSession(TEST_ZONE);
    const result = session.movePlayerTo('crossing');
    expect(result.collidedGroupIdentifier).toBeUndefined();
  });

  it('reports entering the tavern', () => {
    // Patrol stops are crossing(0) -> grove(1) -> bridge(2), advancing once
    // per move; routing gate -> crossing -> grove -> tavern keeps the
    // player one stop behind the pack the whole way (group is at grove
    // when the player arrives at crossing, at bridge when the player
    // arrives at grove, at crossing when the player arrives at the tavern).
    const session = new ZoneSession(TEST_ZONE);
    session.movePlayerTo('crossing');
    const midResult = session.movePlayerTo('grove');
    expect(midResult.collidedGroupIdentifier).toBeUndefined();
    const tavernResult = session.movePlayerTo('tavern');
    expect(tavernResult.collidedGroupIdentifier).toBeUndefined();
    expect(tavernResult.enteredTavern).toBe(true);
  });

  it('removes a defeated group from collisions and from the active locations list', () => {
    const session = new ZoneSession(TEST_ZONE);
    session.markGroupDefeated('wolf_pack');
    const result = session.movePlayerTo('crossing');
    expect(result.collidedGroupIdentifier).toBeUndefined();
    expect(session.getActiveRoamingGroupLocations()).toEqual([]);
  });
});
