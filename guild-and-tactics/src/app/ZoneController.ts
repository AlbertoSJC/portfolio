import type { GridPosition } from '../sim/grid/GridPosition';
import { findShortestZonePath } from '../sim/grid/ZonePathfinding';
import type { GuildState } from '../sim/guild/GuildState';
import type { ZoneDefinition } from '../sim/guild/ZoneDefinition';
import { ZoneSession } from '../sim/guild/ZoneSession';
import type { UserInterfaceSounds } from '../ui/UserInterfaceSounds';
import type { MemberContentTables } from '../ui/village/presenters/MemberPresenters';
import { ZoneScreen } from '../ui/overworld/zone/ZoneScreen';
import { TownScreen, type ZoneContentTables } from '../ui/overworld/zone/TownScreen';

const STEP_DELAY_MILLISECONDS = 160;

export interface ZoneControllerCallbacks {
  onOpenGuildMenu: () => void;
  onReturnToWorldMap: () => void;
  onEmbarkQuest: (questIdentifier: string, deployedMemberIdentifiers: string[]) => void;
  onBuyItem: (itemIdentifier: string) => void;
  onSellItem: (itemIdentifier: string) => void;
  onBuyEquipment: (equipmentIdentifier: string) => void;
  onSellEquipment: (equipmentIdentifier: string) => void;
  onRoamingGroupCaught: (roamingGroupIdentifier: string, deployedMemberIdentifiers: string[]) => void;
}

type ZoneVisitMode = 'exploring' | 'town';

/**
 * Drives one zone visit: owns the pure ZoneSession (player + patrol state)
 * and two DOM screens sharing the same root — the walkable ZoneScreen and
 * the TownScreen reached by stepping onto the tavern tile. On a click
 * while exploring, computes the path once via ZonePathfinding, then steps
 * through it one cell at a time so the player can watch roaming groups
 * patrol — mirrors BattleController's role for the tactical grid, just
 * for exploration instead of combat.
 */
export class ZoneController {
  private readonly zone: ZoneDefinition;
  private readonly callbacks: ZoneControllerCallbacks;
  private readonly session: ZoneSession;
  private readonly screen: ZoneScreen;
  private readonly townScreen: TownScreen;
  private readonly pendingTimeoutIdentifiers: number[] = [];
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
      onCellClicked: (position) => this.handleCellClicked(position),
      onOpenGuildMenu: callbacks.onOpenGuildMenu,
      onReturnToWorldMap: callbacks.onReturnToWorldMap,
    });
    this.townScreen = new TownScreen(rootElement, sounds, content, {
      onOpenGuildMenu: callbacks.onOpenGuildMenu,
      onLeaveTown: () => this.leaveTown(),
      onEmbarkQuest: callbacks.onEmbarkQuest,
      onBuyItem: callbacks.onBuyItem,
      onSellItem: callbacks.onSellItem,
      onBuyEquipment: callbacks.onBuyEquipment,
      onSellEquipment: callbacks.onSellEquipment,
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
    for (const timeoutIdentifier of this.pendingTimeoutIdentifiers) {
      window.clearTimeout(timeoutIdentifier);
    }
  }

  private renderScreen(): void {
    if (this.mode === 'town') {
      this.townScreen.render(this.zone, this.guild);
      return;
    }
    this.screen.render(
      this.zone,
      this.guild,
      this.session.getPlayerPosition(),
      this.session.getActiveRoamingGroupPositions(),
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

  private handleCellClicked(target: GridPosition): void {
    if (this.isMoving) {
      return;
    }
    const path = findShortestZonePath(
      this.session.getPlayerPosition(),
      target,
      this.zone.explorationGridWidth,
      this.zone.explorationGridHeight,
      this.zone.obstacleTiles,
    );
    if (path === undefined || path.length === 0) {
      return;
    }
    this.isMoving = true;
    this.stepAlongPath(path, 0);
  }

  private stepAlongPath(path: readonly GridPosition[], stepIndex: number): void {
    const nextPosition = path[stepIndex];
    if (nextPosition === undefined) {
      this.isMoving = false;
      return;
    }
    const result = this.session.movePlayerTo(nextPosition);
    this.screen.rerenderGrid(this.session.getPlayerPosition(), this.session.getActiveRoamingGroupPositions());

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
    if (stepIndex + 1 >= path.length) {
      this.isMoving = false;
      return;
    }
    this.pendingTimeoutIdentifiers.push(
      window.setTimeout(() => this.stepAlongPath(path, stepIndex + 1), STEP_DELAY_MILLISECONDS),
    );
  }

  private handleCollision(roamingGroupIdentifier: string): void {
    this.screen.openCollisionMuster(`${this.zone.displayName}: something blocks the way!`, (deployedMemberIdentifiers) => {
      this.callbacks.onRoamingGroupCaught(roamingGroupIdentifier, deployedMemberIdentifiers);
    });
  }
}
