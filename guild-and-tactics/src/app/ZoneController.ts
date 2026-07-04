import { findShortestZoneRoute } from '../sim/graph/ZoneRoadGraph';
import type { GuildState } from '../sim/guild/GuildState';
import type { ZoneDefinition } from '../sim/guild/ZoneDefinition';
import { ZoneSession } from '../sim/guild/ZoneSession';
import type { EquipmentSlot } from '../sim/items/EquipmentDefinition';
import type { BaseClassIdentifier, ClassIdentifier } from '../sim/units/Unit';
import type { UserInterfaceSounds } from '../ui/UserInterfaceSounds';
import type { MemberContentTables } from '../ui/village/presenters/MemberPresenters';
import { ZoneScreen } from '../ui/overworld/zone/ZoneScreen';
import { TownScreen, type ZoneContentTables } from '../ui/overworld/zone/TownScreen';

/** How long the party token walks one road segment inside a zone. */
const ZONE_WALK_SEGMENT_MILLISECONDS = 550;

export interface ZoneControllerCallbacks {
  onOpenGuildMenu: () => void;
  onReturnToWorldMap: () => void;
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onStartDispatch: (dispatchQuestIdentifier: string, memberIdentifier: string) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onBuyEquipment: (equipmentIdentifier: string) => void;
  onSellEquipment: (equipmentIdentifier: string) => void;
  onRoamingGroupCaught: (roamingGroupIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onHireRecruit: (recruitMemberIdentifier: string) => void;
  onEquipItem: (memberIdentifier: string, equipmentIdentifier: string) => void;
  onUnequipSlot: (memberIdentifier: string, slot: EquipmentSlot) => void;
  onChangeClass: (memberIdentifier: string, classIdentifier: ClassIdentifier) => void;
  onSetSecondarySkillClass: (memberIdentifier: string, classIdentifier: BaseClassIdentifier | undefined) => void;
}

type ZoneVisitMode = 'exploring' | 'town';

/**
 * Drives one zone visit: owns the pure ZoneSession (player + patrol state)
 * and two DOM screens sharing the same root — the walkable ZoneScreen and
 * the TownScreen reached by stepping onto a tavern location. On a click
 * while exploring, computes the route once via findShortestZoneRoute, then
 * steps through it one location at a time so the player can watch roaming
 * groups patrol — mirrors BattleController's role for the tactical grid,
 * just for exploration instead of combat.
 */
export class ZoneController {
  private readonly zone: ZoneDefinition;
  private readonly callbacks: ZoneControllerCallbacks;
  private readonly session: ZoneSession;
  private readonly screen: ZoneScreen;
  private readonly townScreen: TownScreen;
  private cancelWalkAnimation: (() => void) | undefined;
  private guild: GuildState;
  private isMoving = false;
  private mode: ZoneVisitMode = 'exploring';

  constructor(
    rootElement: HTMLElement,
    zone: ZoneDefinition,
    sounds: UserInterfaceSounds,
    content: ZoneContentTables,
    memberContent: MemberContentTables,
    guild: GuildState,
    callbacks: ZoneControllerCallbacks,
  ) {
    this.zone = zone;
    this.guild = guild;
    this.callbacks = callbacks;
    this.session = new ZoneSession(zone);
    this.screen = new ZoneScreen(rootElement, sounds, memberContent, {
      onLocationClicked: (locationIdentifier) => this.handleLocationClicked(locationIdentifier),
      onOpenGuildMenu: callbacks.onOpenGuildMenu,
      onReturnToWorldMap: callbacks.onReturnToWorldMap,
    });
    this.townScreen = new TownScreen(rootElement, sounds, content, {
      onLeaveTown: () => this.leaveTown(),
      onEmbarkQuest: callbacks.onEmbarkQuest,
      onStartDispatch: callbacks.onStartDispatch,
      onBuyItem: callbacks.onBuyItem,
      onSellItem: callbacks.onSellItem,
      onBuyEquipment: callbacks.onBuyEquipment,
      onSellEquipment: callbacks.onSellEquipment,
      onHireRecruit: callbacks.onHireRecruit,
      onEquipItem: callbacks.onEquipItem,
      onUnequipSlot: callbacks.onUnequipSlot,
      onChangeClass: callbacks.onChangeClass,
      onSetSecondarySkillClass: callbacks.onSetSecondarySkillClass,
    });
    this.renderScreen();
  }

  /** Re-renders after guild state changes elsewhere (buying, embarking) without moving the party. */
  refreshGuild(guild: GuildState): void {
    this.guild = guild;
    this.renderScreen();
  }

  /** Call on a won fight — that roaming group won't reappear for the rest of this visit. */
  markRoamingGroupDefeated(roamingGroupIdentifier: string): void {
    this.session.markGroupDefeated(roamingGroupIdentifier);
    this.renderScreen();
  }

  dispose(): void {
    this.cancelWalkAnimation?.();
    this.cancelWalkAnimation = undefined;
  }

  private renderScreen(): void {
    if (this.mode === 'town') {
      this.townScreen.render(this.zone, this.guild);
      return;
    }
    this.screen.render(
      this.zone,
      this.guild,
      this.session.getPlayerLocationIdentifier(),
      this.session.getActiveRoamingGroupLocations(),
    );
  }

  private enterTown(): void {
    this.mode = 'town';
    this.renderScreen();
    this.townScreen.openTavern();
  }

  private leaveTown(): void {
    this.mode = 'exploring';
    this.renderScreen();
  }

  private handleLocationClicked(targetLocationIdentifier: string): void {
    if (this.isMoving) {
      return;
    }
    const currentLocationIdentifier = this.session.getPlayerLocationIdentifier();
    if (targetLocationIdentifier === currentLocationIdentifier) {
      // Clicking the location you're already standing on (e.g. re-entering
      // a tavern after leaving it) finds an empty route, since there's
      // nowhere to walk — re-arrive at it directly instead, which still
      // ticks roaming groups once and re-checks collision/tavern, exactly
      // like a normal step would.
      this.isMoving = true;
      this.stepAlongRoute([targetLocationIdentifier], 0);
      return;
    }
    const route = findShortestZoneRoute(currentLocationIdentifier, targetLocationIdentifier, this.zone.roads);
    if (route === undefined || route.length === 0) {
      return;
    }
    this.isMoving = true;
    this.stepAlongRoute(route, 0);
  }

  private stepAlongRoute(route: readonly string[], stepIndex: number): void {
    const nextLocationIdentifier = route[stepIndex];
    if (nextLocationIdentifier === undefined) {
      this.isMoving = false;
      return;
    }
    const playerFromLocationIdentifier = this.session.getPlayerLocationIdentifier();
    const groupFromLocations = this.session.getActiveRoamingGroupLocations();
    const result = this.session.movePlayerTo(nextLocationIdentifier);

    // The sim has already resolved the step; the walk animation is purely
    // presentational, so collisions and tavern arrivals only surface once
    // the tokens visibly meet.
    this.cancelWalkAnimation = this.screen.animateWalkStep(
      playerFromLocationIdentifier,
      groupFromLocations,
      this.session.getPlayerLocationIdentifier(),
      this.session.getActiveRoamingGroupLocations(),
      ZONE_WALK_SEGMENT_MILLISECONDS,
      () => {
        this.cancelWalkAnimation = undefined;
        if (result.collidedGroupIdentifier !== undefined) {
          this.isMoving = false;
          this.handleCollision(result.collidedGroupIdentifier);
          return;
        }
        if (result.enteredTavern) {
          this.isMoving = false;
          this.enterTown();
          return;
        }
        if (stepIndex + 1 >= route.length) {
          this.isMoving = false;
          return;
        }
        this.stepAlongRoute(route, stepIndex + 1);
      },
    );
  }

  private handleCollision(roamingGroupIdentifier: string): void {
    this.screen.openCollisionMuster(`${this.zone.displayName}: something blocks the way!`, (deployedMemberIdentifiers) => {
      this.callbacks.onRoamingGroupCaught(roamingGroupIdentifier, deployedMemberIdentifiers);
    });
  }
}
