import { Battle, type BattleOutcome } from '../sim/battle/Battle';
import { SeededRandomNumberGenerator } from '../sim/SeededRandomNumberGenerator';
import { findRosterMember, type GuildState } from '../sim/guild/GuildState';
import { hasZoneBeenStocked, restockStore } from '../sim/guild/StoreStock';
import { reputationTierForQuestCount } from '../sim/guild/ReputationTier';
import { isZoneAccessibleAtTier } from '../sim/guild/ZoneAccess';
import { findWorldTravelRoute } from '../sim/guild/WorldTravel';
import { isMemberDispatched } from '../sim/guild/DispatchQuest';
import { applyBattleSpoils } from '../sim/guild/BattleSpoils';
import { DISPATCH_QUESTS } from '../content/dispatchQuests';
import { EQUIPMENT } from '../content/equipment';
import { completeQuestOnBoard, questIdentifiersForZone, refillQuestBoard } from '../sim/guild/QuestBoard';
import { createUnitsForQuestBattle, type UnitContentTables } from '../sim/guild/QuestBattleAssembly';
import { createUnitsForEncounterBattle } from '../sim/guild/EncounterBattleAssembly';
import { generateEncounterEnemySpawns } from '../sim/guild/EncounterGeneration';
import { averageRosterLevel, generateRecruitOffers } from '../sim/guild/RecruitGeneration';
import type { ZoneDefinition } from '../sim/guild/ZoneDefinition';
import type { Unit } from '../sim/units/Unit';
import type { SaveGameStorage } from '../platform/SaveGameStorage';
import { BASE_CLASSES } from '../content/baseClasses';
import { ADVANCED_CLASSES } from '../content/advancedClasses';
import { ITEMS } from '../content/items';
import { BATTLE_MAPS, type BattleMapEntry } from '../content/maps/battleMapRegistry';
import { MONSTERS } from '../content/monsters';
import { QUESTS } from '../content/quests';
import { RACES } from '../content/races';
import { RECRUIT_NAMES_BY_RACE } from '../content/recruitNames';
import { ZONES } from '../content/zones';
import { STARTING_ZONE_IDENTIFIER, WORLD_ROADS } from '../content/zones/worldMap';
import { SKILLS } from '../content/skills';
import { createNewGuild } from '../content/newGame';
import { UserInterfaceSounds } from '../ui/UserInterfaceSounds';
import { buildBattleSpoilsSummaryLines } from '../ui/BattleSpoilsSummary';
import { GuildMenu, type GuildMenuCallbacks } from '../ui/guild/GuildMenu';
import { buildZoneGuardDialogue } from '../ui/overworld/ZoneGuardDialogue';
import { ModalDialog } from '../ui/village/ModalDialog';
import { OverworldScreen } from '../ui/overworld/OverworldScreen';
import type { ZoneContentTables } from '../ui/overworld/zone/TownScreen';
import { BattleController, type BattleConclusion } from './BattleController';
import { GuildCommands } from './GuildCommands';
import { ZoneController } from './ZoneController';

const RANDOM_SEED_BIT_MASK = 0x7fffffff;
/** How long the guild token walks one world road segment (zone to zone). */
const WORLD_TRAVEL_SEGMENT_MILLISECONDS = 650;

type GameScene = 'overworld' | 'zone' | 'battle';

/**
 * The composition root: owns the guild state, the scenes (overworld /
 * zone / battle) and the wiring between them. Menu-driven guild commands
 * live in GuildCommands; a concluded battle's payout rules live in
 * sim/guild/BattleSpoils.
 */
export class GameController {
  private readonly battleRootElement: HTMLElement;
  private readonly battleCanvas: HTMLCanvasElement;
  private readonly overworldRootElement: HTMLElement;
  private readonly zoneRootElement: HTMLElement;
  private readonly saveGameStorage: SaveGameStorage;
  private readonly randomNumberGenerator: SeededRandomNumberGenerator;
  private readonly sounds = new UserInterfaceSounds();
  private readonly guildCommands: GuildCommands;
  private readonly characterCallbacks: GuildMenuCallbacks;
  private readonly guildMenuModal: ModalDialog;
  private readonly guardDialogueModal: ModalDialog;
  private readonly guildMenu: GuildMenu;
  private readonly overworldScreen: OverworldScreen;
  private readonly zoneContentTables: ZoneContentTables;
  private readonly unitContentTables: UnitContentTables;
  private guild: GuildState;
  private currentScene: GameScene = 'overworld';
  private activeBattleController: BattleController | undefined;
  private activeBattle: Battle | undefined;
  private activeQuestIdentifier: string | undefined;
  private activeRoamingGroupIdentifier: string | undefined;
  private activeZoneController: ZoneController | undefined;
  private activeZoneIdentifier: string | undefined;
  private deployedMemberIdentifiers: string[] = [];
  private isTravellingOnWorldMap = false;

  constructor(
    battleRootElement: HTMLElement,
    battleCanvas: HTMLCanvasElement,
    overworldRootElement: HTMLElement,
    zoneRootElement: HTMLElement,
    saveGameStorage: SaveGameStorage,
  ) {
    this.battleRootElement = battleRootElement;
    this.battleCanvas = battleCanvas;
    this.overworldRootElement = overworldRootElement;
    this.zoneRootElement = zoneRootElement;
    this.saveGameStorage = saveGameStorage;
    this.randomNumberGenerator = new SeededRandomNumberGenerator(Date.now() & RANDOM_SEED_BIT_MASK);

    this.guild = this.saveGameStorage.loadGuildSave() ?? createNewGuild(this.randomNumberGenerator);
    // Saves from before world travel existed (or naming a since-removed
    // zone) place the guild at the starting zone.
    if (this.guild.currentZoneIdentifier === undefined || ZONES[this.guild.currentZoneIdentifier] === undefined) {
      this.guild.currentZoneIdentifier = STARTING_ZONE_IDENTIFIER;
    }
    const bootTier = reputationTierForQuestCount(this.guild.completedQuestCount);
    for (const zone of Object.values(ZONES)) {
      // Saves from before a zone existed (or from before per-zone stock/boards
      // existed at all) start that zone with full shelves and a fresh board.
      if (!hasZoneBeenStocked(this.guild, zone.identifier)) {
        restockStore(this.guild, zone.identifier, ITEMS, EQUIPMENT, bootTier);
      }
      // Boards refill unconditionally: refillQuestBoard is self-healing, so
      // this also prunes rank-gated quests from pre-gating saves and offers
      // newly added or newly unlocked quests without a completion in the zone.
      refillQuestBoard(
        this.guild,
        zone.identifier,
        questIdentifiersForZone(zone, QUESTS, bootTier),
        this.randomNumberGenerator,
      );
    }
    this.saveGameStorage.persistGuildSave(this.guild);

    this.guildCommands = new GuildCommands(this.guild, () => this.persistAndRefresh());
    this.characterCallbacks = {
      onHireRecruit: (recruitMemberIdentifier) => this.guildCommands.hireRecruit(recruitMemberIdentifier),
      onEquipItem: (memberIdentifier, equipmentIdentifier) =>
        this.guildCommands.equipItem(memberIdentifier, equipmentIdentifier),
      onUnequipSlot: (memberIdentifier, slot) => this.guildCommands.unequipSlot(memberIdentifier, slot),
      onChangeClass: (memberIdentifier, classIdentifier) =>
        this.guildCommands.changeClass(memberIdentifier, classIdentifier),
      onSetSecondarySkillClass: (memberIdentifier, classIdentifier) =>
        this.guildCommands.setSecondarySkillClass(memberIdentifier, classIdentifier),
    };

    this.guildMenuModal = new ModalDialog(document.body, this.sounds);
    this.guardDialogueModal = new ModalDialog(document.body, this.sounds);
    this.guildMenu = new GuildMenu(
      this.sounds,
      {
        races: RACES,
        baseClasses: BASE_CLASSES,
        advancedClasses: ADVANCED_CLASSES,
        equipment: EQUIPMENT,
        skills: SKILLS,
        items: ITEMS,
      },
      this.characterCallbacks,
      {
        onOpen: (content) => this.guildMenuModal.open(content, undefined, { closeable: true }),
        onUpdate: (content) => this.guildMenuModal.refreshContent(content),
      },
    );

    this.overworldScreen = new OverworldScreen(overworldRootElement, this.sounds, ZONES, WORLD_ROADS, {
      onZoneSelected: (zoneIdentifier) => this.travelToZone(zoneIdentifier),
      onOpenGuildMenu: () => this.guildMenu.open(this.guild),
    });

    this.zoneContentTables = {
      quests: QUESTS,
      dispatchQuests: DISPATCH_QUESTS,
      items: ITEMS,
      equipment: EQUIPMENT,
      battleMapsByIdentifier: BATTLE_MAPS,
      races: RACES,
      baseClasses: BASE_CLASSES,
      advancedClasses: ADVANCED_CLASSES,
      skills: SKILLS,
    };
    this.unitContentTables = {
      races: RACES,
      baseClasses: BASE_CLASSES,
      advancedClasses: ADVANCED_CLASSES,
      monsters: MONSTERS,
      equipment: EQUIPMENT,
    };

    this.showOverworld();
  }

  private showOverworld(): void {
    this.activeBattleController?.dispose();
    this.activeBattleController = undefined;
    this.activeBattle = undefined;
    this.activeQuestIdentifier = undefined;
    this.activeRoamingGroupIdentifier = undefined;
    this.activeZoneController?.dispose();
    this.activeZoneController = undefined;
    this.activeZoneIdentifier = undefined;
    this.battleRootElement.classList.add('hidden');
    this.zoneRootElement.classList.add('hidden');
    this.overworldRootElement.classList.remove('hidden');
    this.currentScene = 'overworld';
    this.overworldScreen.render(this.guild);
  }

  /**
   * The FFTA2-style World Map travel rule: the guild stands at one zone and
   * walks the road network to another — it cannot jump across the map. The
   * route only ever crosses zones the guild's reputation may enter, so a
   * locked zone is never a corridor; a locked destination is refused by the
   * roadwatch dialogue before a single step is taken.
   */
  private travelToZone(destinationZoneIdentifier: string): void {
    if (this.isTravellingOnWorldMap) {
      return;
    }
    const destinationZone = ZONES[destinationZoneIdentifier];
    if (destinationZone === undefined) {
      return;
    }
    const currentTier = reputationTierForQuestCount(this.guild.completedQuestCount);
    if (!isZoneAccessibleAtTier(destinationZone, currentTier)) {
      this.guardDialogueModal.open(
        buildZoneGuardDialogue(destinationZone, currentTier, this.sounds, () =>
          this.guardDialogueModal.forceClose(),
        ),
      );
      return;
    }

    const currentZoneIdentifier = this.guild.currentZoneIdentifier ?? STARTING_ZONE_IDENTIFIER;
    if (destinationZoneIdentifier === currentZoneIdentifier) {
      this.showZone(destinationZoneIdentifier);
      return;
    }
    const route = findWorldTravelRoute(currentZoneIdentifier, destinationZoneIdentifier, WORLD_ROADS, (zoneIdentifier) => {
      const zone = ZONES[zoneIdentifier];
      return zone !== undefined && isZoneAccessibleAtTier(zone, currentTier);
    });
    if (route === undefined || route.length === 0) {
      return;
    }
    this.isTravellingOnWorldMap = true;
    this.stepAlongWorldRoute(route, 0);
  }

  private stepAlongWorldRoute(route: readonly string[], stepIndex: number): void {
    const nextZoneIdentifier = route[stepIndex];
    const fromZoneIdentifier = this.guild.currentZoneIdentifier;
    if (nextZoneIdentifier === undefined || fromZoneIdentifier === undefined) {
      this.isTravellingOnWorldMap = false;
      return;
    }
    this.overworldScreen.animateTravelStep(
      fromZoneIdentifier,
      nextZoneIdentifier,
      WORLD_TRAVEL_SEGMENT_MILLISECONDS,
      () => {
        this.guild.currentZoneIdentifier = nextZoneIdentifier;
        if (stepIndex + 1 < route.length) {
          this.stepAlongWorldRoute(route, stepIndex + 1);
          return;
        }
        this.isTravellingOnWorldMap = false;
        this.saveGameStorage.persistGuildSave(this.guild);
        this.showZone(nextZoneIdentifier);
      },
    );
  }

  private showZone(zoneIdentifier: string): void {
    const requestedZone = ZONES[zoneIdentifier];
    const currentTier = reputationTierForQuestCount(this.guild.completedQuestCount);
    if (requestedZone !== undefined && !isZoneAccessibleAtTier(requestedZone, currentTier)) {
      this.guardDialogueModal.open(
        buildZoneGuardDialogue(requestedZone, currentTier, this.sounds, () =>
          this.guardDialogueModal.forceClose(),
        ),
      );
      return;
    }

    this.activeBattleController?.dispose();
    this.activeBattleController = undefined;
    this.activeBattle = undefined;
    this.activeQuestIdentifier = undefined;
    this.activeRoamingGroupIdentifier = undefined;
    this.battleRootElement.classList.add('hidden');
    this.overworldRootElement.classList.add('hidden');
    this.zoneRootElement.classList.remove('hidden');
    this.currentScene = 'zone';

    if (this.activeZoneController !== undefined && this.activeZoneIdentifier === zoneIdentifier) {
      this.activeZoneController.refreshGuild(this.guild);
      return;
    }
    const zone = ZONES[zoneIdentifier];
    if (zone === undefined) {
      this.showOverworld();
      return;
    }
    this.activeZoneController?.dispose();
    this.activeZoneIdentifier = zoneIdentifier;
    this.activeZoneController = new ZoneController(
      this.zoneRootElement,
      zone,
      this.sounds,
      this.zoneContentTables,
      this.zoneContentTables,
      this.guild,
      {
        ...this.characterCallbacks,
        onOpenGuildMenu: () => this.guildMenu.open(this.guild),
        onReturnToWorldMap: () => this.showOverworld(),
        onEmbarkQuest: (questIdentifier, memberIdentifiers) => this.embarkOnQuest(questIdentifier, memberIdentifiers),
        onStartDispatch: (dispatchQuestIdentifier, memberIdentifier) =>
          this.guildCommands.startDispatchQuest(dispatchQuestIdentifier, memberIdentifier),
        onBuyItem: (itemIdentifier) => this.guildCommands.buyItem(this.activeZoneIdentifier, itemIdentifier),
        onSellItem: (itemIdentifier) => this.guildCommands.sellItem(itemIdentifier),
        onBuyEquipment: (equipmentIdentifier) =>
          this.guildCommands.buyEquipment(this.activeZoneIdentifier, equipmentIdentifier),
        onSellEquipment: (equipmentIdentifier) => this.guildCommands.sellEquipment(equipmentIdentifier),
        onRoamingGroupCaught: (roamingGroupIdentifier, deployedMemberIdentifiers) =>
          this.catchRoamingGroup(roamingGroupIdentifier, deployedMemberIdentifiers),
      },
    );
  }

  private showBattle(): void {
    this.overworldRootElement.classList.add('hidden');
    this.zoneRootElement.classList.add('hidden');
    this.battleRootElement.classList.remove('hidden');
    this.currentScene = 'battle';
  }

  /** Persists, refreshes the Guild menu if open, and refreshes whichever screen is currently showing. */
  private persistAndRefresh(): void {
    this.saveGameStorage.persistGuildSave(this.guild);
    this.guildMenu.refresh(this.guild);
    if (this.currentScene === 'zone') {
      this.activeZoneController?.refreshGuild(this.guild);
    } else if (this.currentScene === 'overworld') {
      this.overworldScreen.render(this.guild);
    }
  }

  private embarkOnQuest(questIdentifier: string, memberIdentifiers: string[]): void {
    const quest = QUESTS[questIdentifier];
    const mapEntry = quest === undefined ? undefined : BATTLE_MAPS[quest.battleMapIdentifier];
    if (quest === undefined || mapEntry === undefined || this.activeZoneIdentifier === undefined) {
      return;
    }
    const deployedMembers = this.deployableMembers(memberIdentifiers);
    if (deployedMembers.length === 0) {
      return;
    }

    const units = createUnitsForQuestBattle(quest, deployedMembers, mapEntry.deploymentTiles, this.unitContentTables);
    this.activeQuestIdentifier = questIdentifier;
    this.startBattle(mapEntry, units, memberIdentifiers, quest.displayName, false, (outcome) =>
      this.concludeQuestBattle(outcome),
    );
  }

  private catchRoamingGroup(roamingGroupIdentifier: string, deployedMemberIdentifiers: string[]): void {
    const zoneIdentifier = this.activeZoneIdentifier;
    const zone = zoneIdentifier === undefined ? undefined : ZONES[zoneIdentifier];
    const roamingGroup = zone?.roamingGroups.find((group) => group.identifier === roamingGroupIdentifier);
    const mapEntry = zone === undefined ? undefined : BATTLE_MAPS[zone.battleMapIdentifier];
    if (zone === undefined || roamingGroup === undefined || mapEntry === undefined) {
      return;
    }
    const deployedMembers = this.deployableMembers(deployedMemberIdentifiers);
    if (deployedMembers.length === 0) {
      return;
    }

    const enemySpawns = generateEncounterEnemySpawns(
      roamingGroup,
      mapEntry.encounterSpawnTiles,
      zone.monsterLevelRange,
      this.randomNumberGenerator,
    );
    const units = createUnitsForEncounterBattle(enemySpawns, deployedMembers, mapEntry.deploymentTiles, this.unitContentTables);
    this.activeRoamingGroupIdentifier = roamingGroupIdentifier;
    this.startBattle(mapEntry, units, deployedMemberIdentifiers, zone.displayName, true, (outcome) =>
      this.concludeZoneEncounterBattle(outcome),
    );
  }

  /** Roster members eligible for deployment — unknown or dispatched members are dropped. */
  private deployableMembers(memberIdentifiers: readonly string[]) {
    return memberIdentifiers
      .map((memberIdentifier) => findRosterMember(this.guild, memberIdentifier))
      .filter((member) => member !== undefined)
      .filter((member) => !isMemberDispatched(this.guild, member.identifier));
  }

  /** Builds and shows a battle, then hooks up its conclusion callback. Shared by quest and roaming-group fights. */
  private startBattle(
    mapEntry: BattleMapEntry,
    units: Unit[],
    deployedMemberIdentifiers: string[],
    combatLogLabel: string,
    isFleeingPermitted: boolean,
    onConcluded: (outcome: Exclude<BattleOutcome, 'ongoing'>) => BattleConclusion,
  ): void {
    const battle = new Battle(
      mapEntry.map,
      units,
      SKILLS,
      this.randomNumberGenerator.nextIntegerBetween(0, RANDOM_SEED_BIT_MASK),
      ITEMS,
      this.guild.consumableInventory,
      isFleeingPermitted,
    );

    this.activeBattle = battle;
    this.deployedMemberIdentifiers = deployedMemberIdentifiers;
    this.showBattle();
    this.activeBattleController = new BattleController(this.battleCanvas, battle, this.sounds, onConcluded);
    this.activeBattleController.appendCombatLogLine(`— ${combatLogLabel} —`);
  }

  private concludeQuestBattle(outcome: Exclude<BattleOutcome, 'ongoing'>): BattleConclusion {
    const quest =
      this.activeQuestIdentifier === undefined ? undefined : QUESTS[this.activeQuestIdentifier];
    if (quest === undefined) {
      return {
        summaryLines: [],
        continueButtonLabel: 'Return to the Overworld',
        onContinue: () => this.showOverworld(),
      };
    }
    return this.buildBattleConclusion(outcome, quest.rewardGold, quest.rewardExperience, (zone) => {
      completeQuestOnBoard(
        this.guild,
        zone.identifier,
        quest.identifier,
        questIdentifiersForZone(zone, QUESTS, reputationTierForQuestCount(this.guild.completedQuestCount)),
        this.randomNumberGenerator,
      );
      const tier = reputationTierForQuestCount(this.guild.completedQuestCount);
      // A tier-up unlocks harder quest ranks on EVERY zone's board, not just
      // the one the completed quest came from.
      for (const eachZone of Object.values(ZONES)) {
        refillQuestBoard(
          this.guild,
          eachZone.identifier,
          questIdentifiersForZone(eachZone, QUESTS, tier),
          this.randomNumberGenerator,
        );
      }
      restockStore(this.guild, zone.identifier, ITEMS, EQUIPMENT, tier);
      this.guild.recruitsOnOffer = generateRecruitOffers(
        this.randomNumberGenerator,
        RACES,
        RECRUIT_NAMES_BY_RACE,
        averageRosterLevel(this.guild.roster.map((member) => member.level)),
        tier,
      );
    });
  }

  private concludeZoneEncounterBattle(outcome: Exclude<BattleOutcome, 'ongoing'>): BattleConclusion {
    const zoneIdentifier = this.activeZoneIdentifier;
    const zone = zoneIdentifier === undefined ? undefined : ZONES[zoneIdentifier];
    const roamingGroupIdentifier = this.activeRoamingGroupIdentifier;
    return this.buildBattleConclusion(outcome, zone?.rewardGoldPerEncounter ?? 0, 0, () => {
      if (roamingGroupIdentifier !== undefined) {
        this.activeZoneController?.markRoamingGroupDefeated(roamingGroupIdentifier);
      }
    });
  }

  /**
   * Applies the battle's spoils to the guild (sim/guild/BattleSpoils owns
   * the PRD §5 payout rules), runs the victory-only side effects, persists,
   * and returns the overlay content. Shared by quest and roaming-group fights.
   */
  private buildBattleConclusion(
    outcome: Exclude<BattleOutcome, 'ongoing'>,
    goldRewardOnVictory: number,
    bonusExperienceOnVictory: number,
    onVictory: (zone: ZoneDefinition) => void,
  ): BattleConclusion {
    const zoneIdentifier = this.activeZoneIdentifier;
    const zone = zoneIdentifier === undefined ? undefined : ZONES[zoneIdentifier];
    const battle = this.activeBattle;
    if (zone === undefined || battle === undefined) {
      return {
        summaryLines: [],
        continueButtonLabel: 'Return to the Overworld',
        onContinue: () => this.showOverworld(),
      };
    }

    const spoilsReport = applyBattleSpoils(
      this.guild,
      {
        outcome,
        goldRewardOnVictory,
        bonusExperienceOnVictory,
        defeatedEnemyLevels: battle.defeatedEnemyLevels,
        deployedMemberIdentifiers: this.deployedMemberIdentifiers,
        skillUseCountsByMemberIdentifier: Object.fromEntries(
          this.deployedMemberIdentifiers.map((memberIdentifier) => [
            memberIdentifier,
            battle.getSkillUseCountsForUnit(memberIdentifier),
          ]),
        ),
        remainingItemPouch: battle.getRemainingItemPouch(),
      },
      EQUIPMENT,
      DISPATCH_QUESTS,
      this.randomNumberGenerator,
    );

    if (outcome === 'victory') {
      onVictory(zone);
    }

    this.saveGameStorage.persistGuildSave(this.guild);
    return {
      summaryLines: buildBattleSpoilsSummaryLines(spoilsReport, SKILLS),
      continueButtonLabel: `Return to ${zone.displayName}`,
      onContinue: () => this.showZone(zone.identifier),
    };
  }
}
