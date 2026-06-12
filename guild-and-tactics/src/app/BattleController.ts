import { Battle } from '../sim/battle/Battle';
import type { BattleEvent } from '../sim/battle/BattleEvents';
import { planEnemyTurn } from '../sim/battle/EnemyArtificialIntelligence';
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
import { UserInterfaceSounds } from '../ui/UserInterfaceSounds';

const ENEMY_ACTION_DELAY_MILLISECONDS = 450;

type InteractionPhase =
  | 'unitCommands'
  | 'choosingMoveDestination'
  | 'choosingSkillTarget'
  | 'choosingFacing'
  | 'enemyActing'
  | 'battleOver';

/**
 * Owns the player interaction state machine and drives enemy turns.
 * All rule decisions stay in the Battle; this class only sequences input,
 * rendering, sound, and timing.
 */
export class BattleController {
  private battle: Battle;
  private readonly createBattle: () => Battle;
  private readonly renderer: BattleRenderer;
  private readonly hud: BattleHud;
  private readonly sounds = new UserInterfaceSounds();
  private phase: InteractionPhase = 'unitCommands';
  private highlightedTiles: GridPosition[] = [];
  private highlightKind: TileHighlightKind | undefined;
  /** Tiles shown while hovering a skill/Move button, before committing. */
  private previewTiles: GridPosition[] = [];
  private previewKind: TileHighlightKind | undefined;
  private hoveredTile: GridPosition | undefined;
  private chosenSkillIdentifier: string | undefined;
  /** Which chooser arrow the cursor is over while picking end-of-turn facing. */
  private hoveredFacingDirection: CardinalDirection | undefined;
  /** Unit hovered in the turn-order strip, marked on the map. */
  private spotlightedUnitIdentifier: string | undefined;

  constructor(canvas: HTMLCanvasElement, createBattle: () => Battle) {
    this.createBattle = createBattle;
    this.battle = createBattle();
    this.renderer = new BattleRenderer(canvas);
    this.renderer.sizeCanvasToMap(this.battle);
    this.hud = new BattleHud(
      {
        onMoveChosen: () => this.beginChoosingMoveDestination(),
        onSkillChosen: (skillIdentifier) => this.beginChoosingSkillTarget(skillIdentifier),
        onEndTurnChosen: () => this.beginChoosingFacing(),
        onCancelChosen: () => this.returnToUnitCommands(),
        onMovePreviewStart: () => this.showMovePreview(),
        onSkillPreviewStart: (skillIdentifier) => this.showSkillPreview(skillIdentifier),
        onPreviewEnd: () => this.clearPreview(),
        onTurnOrderUnitHoverStart: (unitIdentifier) => this.spotlightUnit(unitIdentifier),
        onTurnOrderUnitHoverEnd: () => this.clearUnitSpotlight(),
      },
      this.sounds,
    );

    canvas.addEventListener('click', (clickEvent) => this.handleCanvasClick(clickEvent));
    canvas.addEventListener('mousemove', (moveEvent) => this.handleCanvasHover(moveEvent));

    this.hud.appendCombatLogLine('Creatures of the Darkness block the road north!');
    this.startTurnForActiveUnit();
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

  private renderEverythingIncludingMenu(): void {
    this.renderEverything();
    this.hud.renderActionMenu(this.battle, this.phaseAsMenuMode());
  }

  /** While aiming an area skill, show exactly which tiles the burst would cover. */
  private areaOfEffectPreviewTiles(): GridPosition[] {
    if (
      this.phase !== 'choosingSkillTarget' ||
      this.chosenSkillIdentifier === undefined ||
      this.hoveredTile === undefined
    ) {
      return [];
    }
    const hoveredTile = this.hoveredTile;
    const skill = this.battle.getSkillByIdentifier(this.chosenSkillIdentifier);
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
      case 'choosingSkillTarget':
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
      case 'skillUsed':
      case 'turnEnded':
        return;
    }
  }

  private startTurnForActiveUnit(): void {
    const outcome = this.battle.getBattleOutcome();
    if (outcome !== 'ongoing') {
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
        : this.tilesWithinRangeOfActiveUnit(skill.targetingRange);
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

  private beginChoosingSkillTarget(skillIdentifier: string): void {
    if (this.phase !== 'unitCommands') {
      return;
    }
    this.previewTiles = [];
    const skill = this.battle.getSkillByIdentifier(skillIdentifier);
    const activeUnit = this.battle.getActiveUnit();
    if (skill.targetingRange === 0) {
      // Self-targeted skills need no tile choice.
      this.logEvents(this.battle.useSkillWithActiveUnit(skillIdentifier, activeUnit.position));
      this.afterPlayerAction();
      return;
    }
    this.chosenSkillIdentifier = skillIdentifier;
    this.highlightedTiles = this.tilesWithinRangeOfActiveUnit(skill.targetingRange);
    this.highlightKind = 'targeting';
    this.phase = 'choosingSkillTarget';
    this.renderEverythingIncludingMenu();
  }

  private tilesWithinRangeOfActiveUnit(targetingRange: number): GridPosition[] {
    const activeUnit = this.battle.getActiveUnit();
    const tilesInRange: GridPosition[] = [];
    for (let row = 0; row < this.battle.map.heightInTiles; row += 1) {
      for (let column = 0; column < this.battle.map.widthInTiles; column += 1) {
        const candidate = { column, row };
        const distance = manhattanDistance(activeUnit.position, candidate);
        if (distance > 0 && distance <= targetingRange) {
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
    this.chosenSkillIdentifier = undefined;
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
    if (this.phase === 'choosingSkillTarget' && this.chosenSkillIdentifier !== undefined) {
      const isHighlighted = this.highlightedTiles.some(
        (tile) => tile.column === clickedTile.column && tile.row === clickedTile.row,
      );
      if (!isHighlighted) {
        this.sounds.playMenuCancel();
        this.returnToUnitCommands();
        return;
      }
      this.logEvents(this.battle.useSkillWithActiveUnit(this.chosenSkillIdentifier, clickedTile));
      this.chosenSkillIdentifier = undefined;
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
      window.setTimeout(step, ENEMY_ACTION_DELAY_MILLISECONDS * (stepIndex + 1));
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
    this.hud.showOutcomeOverlay(outcome, () => this.restartBattle());
  }

  private restartBattle(): void {
    this.hud.hideOutcomeOverlay();
    this.battle = this.createBattle();
    this.renderer.sizeCanvasToMap(this.battle);
    this.hud.appendCombatLogLine('— A new skirmish begins —');
    this.startTurnForActiveUnit();
  }

  private clearHighlights(): void {
    this.highlightedTiles = [];
    this.highlightKind = undefined;
    this.previewTiles = [];
    this.previewKind = undefined;
  }
}
