import type { Battle, BattleOutcome } from '../sim/battle/Battle';
import type { BattleEvent } from '../sim/battle/BattleEvents';
import { planEnemyTurn } from '../sim/battle/EnemyArtificialIntelligence';
import { ITEM_USE_RANGE } from '../sim/battle/combatConstants';
import { isPositionInsideMap } from '../sim/grid/BattleMap';
import type { CardinalDirection, GridPosition } from '../sim/grid/GridPosition';
import {
  ALL_CARDINAL_DIRECTIONS,
  arePositionsEqual,
  directionFromTo,
  manhattanDistance,
  stepInDirection,
} from '../sim/grid/GridPosition';
import {
  BattleRenderer,
  type BattleViewState,
  type TileHighlightKind,
} from '../render/BattleRenderer';
import { BattleHud, type ActionMenuMode } from '../ui/BattleHud';
import { formatBattleEventAsLogLine } from '../ui/CombatLogFormatting';
import type { UserInterfaceSounds } from '../ui/UserInterfaceSounds';

const ENEMY_ACTION_DELAY_MILLISECONDS = 450;

type InteractionPhase =
  | 'unitCommands'
  | 'choosingMoveDestination'
  | 'choosingActionTarget'
  | 'choosingFacing'
  | 'enemyActing'
  | 'battleOver';

/** What the player is aiming: a skill or a consumable item. */
type ChosenAction = { kind: 'skill'; identifier: string } | { kind: 'item'; identifier: string };

/** What the outcome overlay shows when the battle ends. */
export interface BattleConclusion {
  summaryLines: string[];
  continueButtonLabel: string;
  onContinue: () => void;
}

/**
 * Owns the player interaction state machine and drives enemy turns for one
 * battle. All rule decisions stay in the Battle; this class only sequences
 * input, rendering, sound, and timing. The GameController creates one per
 * quest and disposes it afterwards.
 */
export class BattleController {
  private readonly battle: Battle;
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: BattleRenderer;
  private readonly hud: BattleHud;
  private readonly sounds: UserInterfaceSounds;
  private readonly onBattleFinished: (outcome: Exclude<BattleOutcome, 'ongoing'>) => BattleConclusion;
  private readonly boundHandleCanvasClick: (clickEvent: MouseEvent) => void;
  private readonly boundHandleCanvasHover: (moveEvent: MouseEvent) => void;
  private readonly pendingTimeoutIdentifiers: number[] = [];
  private phase: InteractionPhase = 'unitCommands';
  private highlightedTiles: GridPosition[] = [];
  private highlightKind: TileHighlightKind | undefined;
  /** Tiles shown while hovering a skill/item/Move button, before committing. */
  private previewTiles: GridPosition[] = [];
  private previewKind: TileHighlightKind | undefined;
  private hoveredTile: GridPosition | undefined;
  private chosenAction: ChosenAction | undefined;
  /** Which chooser arrow the cursor is over while picking end-of-turn facing. */
  private hoveredFacingDirection: CardinalDirection | undefined;
  /** Unit hovered in the turn-order strip, marked on the map. */
  private spotlightedUnitIdentifier: string | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    battle: Battle,
    sounds: UserInterfaceSounds,
    onBattleFinished: (outcome: Exclude<BattleOutcome, 'ongoing'>) => BattleConclusion,
  ) {
    this.canvas = canvas;
    this.battle = battle;
    this.sounds = sounds;
    this.onBattleFinished = onBattleFinished;
    this.renderer = new BattleRenderer(canvas);
    this.renderer.sizeCanvasToMap(this.battle);
    this.hud = new BattleHud(
      {
        onMoveChosen: () => this.beginChoosingMoveDestination(),
        onSkillChosen: (skillIdentifier) =>
          this.beginChoosingActionTarget({ kind: 'skill', identifier: skillIdentifier }),
        onItemChosen: (itemIdentifier) =>
          this.beginChoosingActionTarget({ kind: 'item', identifier: itemIdentifier }),
        onEndTurnChosen: () => this.beginChoosingFacing(),
        onCancelChosen: () => this.returnToUnitCommands(),
        onMovePreviewStart: () => this.showMovePreview(),
        onSkillPreviewStart: (skillIdentifier) => this.showSkillPreview(skillIdentifier),
        onItemPreviewStart: () => this.showItemPreview(),
        onPreviewEnd: () => this.clearPreview(),
        onTurnOrderUnitHoverStart: (unitIdentifier) => this.spotlightUnit(unitIdentifier),
        onTurnOrderUnitHoverEnd: () => this.clearUnitSpotlight(),
      },
      this.sounds,
    );

    this.boundHandleCanvasClick = (clickEvent) => this.handleCanvasClick(clickEvent);
    this.boundHandleCanvasHover = (moveEvent) => this.handleCanvasHover(moveEvent);
    canvas.addEventListener('click', this.boundHandleCanvasClick);
    canvas.addEventListener('mousemove', this.boundHandleCanvasHover);

    this.startTurnForActiveUnit();
  }

  /** Detaches listeners and cancels queued enemy steps when leaving the battle. */
  dispose(): void {
    this.canvas.removeEventListener('click', this.boundHandleCanvasClick);
    this.canvas.removeEventListener('mousemove', this.boundHandleCanvasHover);
    for (const timeoutIdentifier of this.pendingTimeoutIdentifiers) {
      window.clearTimeout(timeoutIdentifier);
    }
    this.hud.hideOutcomeOverlay();
  }

  appendCombatLogLine(logLine: string): void {
    this.hud.appendCombatLogLine(logLine);
  }

  private buildViewState(): BattleViewState {
    const showPreviewInsteadOfHighlights =
      this.phase === 'unitCommands' && this.previewTiles.length > 0;
    const isChoosingFacing = this.phase === 'choosingFacing';
    return {
      highlightedTiles: showPreviewInsteadOfHighlights ? this.previewTiles : this.highlightedTiles,
      highlightKind: showPreviewInsteadOfHighlights ? this.previewKind : this.highlightKind,
      areaPreviewTiles: this.areaOfEffectPreviewTiles(),
      hoveredTile: this.hoveredTile,
      ...(this.spotlightedUnitIdentifier === undefined
        ? {}
        : { spotlightedUnitIdentifier: this.spotlightedUnitIdentifier }),
      ...(isChoosingFacing
        ? {
            facingChooser: { hoveredDirection: this.hoveredFacingDirection },
            activeUnitFacingPreview: this.hoveredFacingDirection,
          }
        : {}),
    };
  }

  /**
   * Redraws the canvas without rebuilding the HUD panels. Used while the
   * cursor sits inside a HUD element — rebuilding the element under the
   * cursor would swallow its mouseleave event.
   */
  private renderBattleCanvasOnly(): void {
    this.renderer.render(this.battle, this.buildViewState());
  }

  private renderEverything(): void {
    this.renderBattleCanvasOnly();
    this.hud.renderTurnOrderStrip(this.battle);
    this.hud.renderActiveUnitPanel(this.battle.getActiveUnit());
  }

  private renderEverythingIncludingMenu(): void {
    this.renderEverything();
    this.hud.renderActionMenu(this.battle, this.phaseAsMenuMode());
  }

  // ── Turn-order strip spotlight ───────────────────────────────────────

  private spotlightUnit(unitIdentifier: string): void {
    this.spotlightedUnitIdentifier = unitIdentifier;
    this.hud.renderInspectedUnitPanel(this.battle.getUnitByIdentifier(unitIdentifier));
    this.renderBattleCanvasOnly();
  }

  private clearUnitSpotlight(): void {
    this.spotlightedUnitIdentifier = undefined;
    this.hud.renderInspectedUnitPanel(undefined);
    this.renderBattleCanvasOnly();
  }

  /** While aiming an area skill, show exactly which tiles the burst would cover. */
  private areaOfEffectPreviewTiles(): GridPosition[] {
    if (
      this.phase !== 'choosingActionTarget' ||
      this.chosenAction?.kind !== 'skill' ||
      this.hoveredTile === undefined
    ) {
      return [];
    }
    const hoveredTile = this.hoveredTile;
    const skill = this.battle.getSkillByIdentifier(this.chosenAction.identifier);
    if (skill.areaOfEffectRadius === 0) {
      return [];
    }
    const hoveredTileIsInRange = this.highlightedTiles.some(
      (tile) => tile.column === hoveredTile.column && tile.row === hoveredTile.row,
    );
    if (!hoveredTileIsInRange) {
      return [];
    }
    const coveredTiles: GridPosition[] = [];
    for (let row = 0; row < this.battle.map.heightInTiles; row += 1) {
      for (let column = 0; column < this.battle.map.widthInTiles; column += 1) {
        const candidate = { column, row };
        if (manhattanDistance(candidate, hoveredTile) <= skill.areaOfEffectRadius) {
          coveredTiles.push(candidate);
        }
      }
    }
    return coveredTiles;
  }

  private phaseAsMenuMode(): ActionMenuMode {
    switch (this.phase) {
      case 'unitCommands':
        return 'unitCommands';
      case 'choosingMoveDestination':
      case 'choosingActionTarget':
        return 'choosingTarget';
      case 'choosingFacing':
        return 'choosingFacing';
      case 'enemyActing':
        return 'enemyActing';
      case 'battleOver':
        return 'battleOver';
    }
  }

  private logEvents(events: readonly BattleEvent[]): void {
    for (const event of events) {
      this.playSoundForEvent(event);
      const logLine = formatBattleEventAsLogLine(this.battle, event);
      if (logLine !== undefined) {
        this.hud.appendCombatLogLine(logLine);
      }
    }
  }

  private playSoundForEvent(event: BattleEvent): void {
    switch (event.kind) {
      case 'unitMoved':
        this.sounds.playMovement();
        return;
      case 'damageDealt':
        this.sounds.playDamageImpact(event.wasCriticalHit);
        return;
      case 'attackMissed':
        this.sounds.playAttackMissed();
        return;
      case 'healingReceived':
        this.sounds.playHealingChime();
        return;
      case 'manaRestored':
      case 'statModifierApplied':
        this.sounds.playBuffApplied();
        return;
      case 'unitKnockedOut':
        this.sounds.playKnockoutSting();
        return;
      case 'turnStarted':
        this.sounds.playTurnStart();
        return;
      case 'battleEnded':
        if (event.outcome === 'victory') {
          this.sounds.playVictoryFanfare();
        } else {
          this.sounds.playDefeatSting();
        }
        return;
      case 'itemUsed':
      case 'skillUsed':
      case 'turnEnded':
        return;
    }
  }

  private startTurnForActiveUnit(): void {
    if (this.battle.getBattleOutcome() !== 'ongoing') {
      this.finishBattle();
      return;
    }
    this.spotlightedUnitIdentifier = undefined;
    const activeUnit = this.battle.getActiveUnit();
    if (activeUnit.team === 'enemy') {
      this.phase = 'enemyActing';
      this.clearHighlights();
      this.renderEverythingIncludingMenu();
      this.runEnemyTurn();
      return;
    }
    this.phase = 'unitCommands';
    this.clearHighlights();
    this.renderEverythingIncludingMenu();
  }

  // ── Hover previews ───────────────────────────────────────────────────

  private showMovePreview(): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    this.previewTiles = this.battle.getReachableTilesForActiveUnit();
    this.previewKind = 'movement';
    this.renderEverything();
  }

  private showSkillPreview(skillIdentifier: string): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    const skill = this.battle.getSkillByIdentifier(skillIdentifier);
    this.previewTiles =
      skill.targetingRange === 0
        ? [this.battle.getActiveUnit().position]
        : this.tilesWithinRangeOfActiveUnit(skill.targetingRange, false);
    this.previewKind = 'targeting';
    this.renderEverything();
  }

  private showItemPreview(): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    this.previewTiles = this.tilesWithinRangeOfActiveUnit(ITEM_USE_RANGE, true);
    this.previewKind = 'targeting';
    this.renderEverything();
  }

  private clearPreview(): void {
    this.previewTiles = [];
    this.previewKind = undefined;
    this.renderEverything();
  }

  // ── Player input ─────────────────────────────────────────────────────

  private beginChoosingMoveDestination(): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    this.previewTiles = [];
    this.highlightedTiles = this.battle.getReachableTilesForActiveUnit();
    this.highlightKind = 'movement';
    this.phase = 'choosingMoveDestination';
    this.renderEverythingIncludingMenu();
  }

  private beginChoosingActionTarget(chosenAction: ChosenAction): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    this.previewTiles = [];
    const activeUnit = this.battle.getActiveUnit();
    if (chosenAction.kind === 'skill') {
      const skill = this.battle.getSkillByIdentifier(chosenAction.identifier);
      if (skill.targetingRange === 0) {
        // Self-targeted skills need no tile choice.
        this.logEvents(this.battle.useSkillWithActiveUnit(chosenAction.identifier, activeUnit.position));
        this.afterPlayerAction();
        return;
      }
      this.highlightedTiles = this.tilesWithinRangeOfActiveUnit(skill.targetingRange, false);
    } else {
      this.highlightedTiles = this.tilesWithinRangeOfActiveUnit(ITEM_USE_RANGE, true);
    }
    this.chosenAction = chosenAction;
    this.highlightKind = 'targeting';
    this.phase = 'choosingActionTarget';
    this.renderEverythingIncludingMenu();
  }

  private tilesWithinRangeOfActiveUnit(
    targetingRange: number,
    includeOwnTile: boolean,
  ): GridPosition[] {
    const activeUnit = this.battle.getActiveUnit();
    const tilesInRange: GridPosition[] = [];
    for (let row = 0; row < this.battle.map.heightInTiles; row += 1) {
      for (let column = 0; column < this.battle.map.widthInTiles; column += 1) {
        const candidate = { column, row };
        const distance = manhattanDistance(activeUnit.position, candidate);
        const minimumDistance = includeOwnTile ? 0 : 1;
        if (distance >= minimumDistance && distance <= targetingRange) {
          tilesInRange.push(candidate);
        }
      }
    }
    return tilesInRange;
  }

  private beginChoosingFacing(): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    this.phase = 'choosingFacing';
    this.hoveredFacingDirection = undefined;
    this.clearHighlights();
    this.renderEverythingIncludingMenu();
  }

  private finishTurnWithFacing(facing: CardinalDirection): void {
    if (this.phase !== 'choosingFacing') {
      return;
    }
    this.hoveredFacingDirection = undefined;
    this.logEvents(this.battle.endActiveUnitTurn(facing));
    this.startTurnForActiveUnit();
  }

  /** The chooser arrow (if any) sitting on the given grid position. */
  private facingDirectionAtPosition(position: GridPosition): CardinalDirection | undefined {
    const activeUnitPosition = this.battle.getActiveUnit().position;
    return ALL_CARDINAL_DIRECTIONS.find((direction) =>
      arePositionsEqual(stepInDirection(activeUnitPosition, direction), position),
    );
  }

  private returnToUnitCommands(): void {
    if (this.phase === 'battleOver' || this.phase === 'enemyActing') {
      return;
    }
    this.chosenAction = undefined;
    this.phase = 'unitCommands';
    this.clearHighlights();
    this.renderEverythingIncludingMenu();
  }

  private handleCanvasClick(clickEvent: MouseEvent): void {
    if (this.phase === 'choosingFacing') {
      // Facing arrows may point off the map edge, so use the unbounded position.
      const clickedDirection = this.facingDirectionAtPosition(
        this.gridPositionFromMouseEvent(clickEvent),
      );
      if (clickedDirection !== undefined) {
        this.sounds.playMenuConfirm();
        this.finishTurnWithFacing(clickedDirection);
      }
      return;
    }
    const clickedTile = this.tileFromMouseEvent(clickEvent);
    if (clickedTile === undefined) {
      return;
    }
    if (this.phase === 'choosingMoveDestination') {
      const isHighlighted = this.highlightedTiles.some(
        (tile) => tile.column === clickedTile.column && tile.row === clickedTile.row,
      );
      if (!isHighlighted) {
        this.sounds.playMenuCancel();
        this.returnToUnitCommands();
        return;
      }
      this.logEvents(this.battle.moveActiveUnit(clickedTile));
      this.afterPlayerAction();
      return;
    }
    if (this.phase === 'choosingActionTarget' && this.chosenAction !== undefined) {
      const isHighlighted = this.highlightedTiles.some(
        (tile) => tile.column === clickedTile.column && tile.row === clickedTile.row,
      );
      if (!isHighlighted) {
        this.sounds.playMenuCancel();
        this.returnToUnitCommands();
        return;
      }
      if (this.chosenAction.kind === 'item') {
        const targetUnit = this.battle.getLivingUnitAtPosition(clickedTile);
        if (targetUnit === undefined || targetUnit.team !== this.battle.getActiveUnit().team) {
          this.sounds.playMenuCancel();
          this.returnToUnitCommands();
          return;
        }
        this.logEvents(this.battle.useItemWithActiveUnit(this.chosenAction.identifier, clickedTile));
      } else {
        this.logEvents(this.battle.useSkillWithActiveUnit(this.chosenAction.identifier, clickedTile));
      }
      this.chosenAction = undefined;
      this.afterPlayerAction();
    }
  }

  private afterPlayerAction(): void {
    if (this.battle.getBattleOutcome() !== 'ongoing') {
      this.finishBattle();
      return;
    }
    const activeUnit = this.battle.getActiveUnit();
    if (activeUnit.hasMovedThisTurn && activeUnit.hasActedThisTurn) {
      // Nothing left to do: go straight to the facing choice, FFTA-style.
      this.phase = 'choosingFacing';
      this.hoveredFacingDirection = undefined;
      this.clearHighlights();
      this.renderEverythingIncludingMenu();
      return;
    }
    this.returnToUnitCommands();
  }

  private handleCanvasHover(moveEvent: MouseEvent): void {
    if (this.phase === 'choosingFacing') {
      const hoveredDirection = this.facingDirectionAtPosition(
        this.gridPositionFromMouseEvent(moveEvent),
      );
      if (hoveredDirection !== this.hoveredFacingDirection) {
        if (hoveredDirection !== undefined) {
          this.sounds.playMenuHover();
        }
        this.hoveredFacingDirection = hoveredDirection;
        this.renderEverything();
      }
      return;
    }
    const hovered = this.tileFromMouseEvent(moveEvent);
    const hoverChanged =
      hovered?.column !== this.hoveredTile?.column || hovered?.row !== this.hoveredTile?.row;
    if (!hoverChanged) {
      return;
    }
    this.hoveredTile = hovered;
    const hoveredUnit =
      hovered === undefined ? undefined : this.battle.getLivingUnitAtPosition(hovered);
    this.hud.renderInspectedUnitPanel(hoveredUnit);
    this.renderEverything();
  }

  /** Grid position under the cursor, even outside the map bounds. */
  private gridPositionFromMouseEvent(mouseEvent: MouseEvent): GridPosition {
    const canvas = mouseEvent.currentTarget as HTMLCanvasElement;
    const canvasBounds = canvas.getBoundingClientRect();
    const canvasX = ((mouseEvent.clientX - canvasBounds.left) / canvasBounds.width) * canvas.width;
    const canvasY = ((mouseEvent.clientY - canvasBounds.top) / canvasBounds.height) * canvas.height;
    return this.renderer.canvasPointToGridPosition(canvasX, canvasY);
  }

  private tileFromMouseEvent(mouseEvent: MouseEvent): GridPosition | undefined {
    const gridPosition = this.gridPositionFromMouseEvent(mouseEvent);
    return isPositionInsideMap(this.battle.map, gridPosition) ? gridPosition : undefined;
  }

  // ── Enemy turns ──────────────────────────────────────────────────────

  private runEnemyTurn(): void {
    const enemyUnit = this.battle.getActiveUnit();
    const turnPlan = planEnemyTurn(this.battle, enemyUnit);

    const scheduledSteps: (() => void)[] = [];
    if (turnPlan.moveDestination !== undefined) {
      const moveDestination = turnPlan.moveDestination;
      scheduledSteps.push(() => {
        this.logEvents(this.battle.moveActiveUnit(moveDestination));
        this.renderEverything();
      });
    }
    if (turnPlan.skillIdentifier !== undefined && turnPlan.skillTargetTile !== undefined) {
      const skillIdentifier = turnPlan.skillIdentifier;
      const skillTargetTile = turnPlan.skillTargetTile;
      scheduledSteps.push(() => {
        this.logEvents(this.battle.useSkillWithActiveUnit(skillIdentifier, skillTargetTile));
        this.renderEverything();
      });
    }
    scheduledSteps.push(() => {
      if (this.battle.getBattleOutcome() !== 'ongoing') {
        this.finishBattle();
        return;
      }
      const nearestOpponent = this.battle.findNearestLivingOpponent(enemyUnit);
      const finalFacing =
        nearestOpponent === undefined
          ? enemyUnit.facing
          : directionFromTo(enemyUnit.position, nearestOpponent.position);
      this.logEvents(this.battle.endActiveUnitTurn(finalFacing));
      this.startTurnForActiveUnit();
    });

    scheduledSteps.forEach((step, stepIndex) => {
      this.pendingTimeoutIdentifiers.push(
        window.setTimeout(step, ENEMY_ACTION_DELAY_MILLISECONDS * (stepIndex + 1)),
      );
    });
  }

  // ── Battle end ───────────────────────────────────────────────────────

  private finishBattle(): void {
    const outcome = this.battle.getBattleOutcome();
    if (outcome === 'ongoing') {
      return;
    }
    this.phase = 'battleOver';
    this.clearHighlights();
    this.renderEverythingIncludingMenu();
    const conclusion = this.onBattleFinished(outcome);
    this.hud.showOutcomeOverlay(
      outcome,
      conclusion.summaryLines,
      conclusion.continueButtonLabel,
      conclusion.onContinue,
    );
  }

  private clearHighlights(): void {
    this.highlightedTiles = [];
    this.highlightKind = undefined;
    this.previewTiles = [];
    this.previewKind = undefined;
  }
}
