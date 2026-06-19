import { Battle, type BattleOutcome } from '../sim/battle/Battle';
import { SeededRandomNumberGenerator } from '../sim/SeededRandomNumberGenerator';
import {
  addConsumable,
  addEquipmentPiece,
  findRosterMember,
  hasRoomInRoster,
  removeConsumable,
  removeEquipmentPiece,
  spendGold,
  type GuildState,
} from '../sim/guild/GuildState';
import { changeMemberClass } from '../sim/guild/ClassChange';
import type { BaseClassIdentifier } from '../sim/units/Unit';
import { equipItemOnMember, unequipMemberSlot } from '../sim/guild/MemberEquipment';
import { hasZoneBeenStocked, restockStore, storeStockOf, takeOneFromStoreStock } from '../sim/guild/StoreStock';
import { reputationTierForQuestCount } from '../sim/guild/ReputationTier';
import type { ClassIdentifier } from '../sim/units/Unit';
import {
  sellPriceForEquipment,
  type EquipmentSlot,
} from '../sim/items/EquipmentDefinition';
import { EQUIPMENT } from '../content/equipment';
import { completeQuestOnBoard, questIdentifiersForZone, refillQuestBoard } from '../sim/guild/QuestBoard';
import { createUnitsForQuestBattle, type UnitContentTables } from '../sim/guild/QuestBattleAssembly';
import { createUnitsForEncounterBattle } from '../sim/guild/EncounterBattleAssembly';
import { generateEncounterEnemySpawns } from '../sim/guild/EncounterGeneration';
import { averageRosterLevel, generateRecruitOffers } from '../sim/guild/RecruitGeneration';
import type { ZoneDefinition } from '../sim/guild/ZoneDefinition';
import type { Unit } from '../sim/units/Unit';
import {
  applyExperienceGain,
  experienceForDefeatingEnemy,
} from '../sim/progression/ExperienceAndLevels';
import { sellPriceForItem } from '../sim/items/ConsumableItemDefinition';
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
import { SKILLS } from '../content/skills';
import { createNewGuild } from '../content/newGame';
import { UserInterfaceSounds } from '../ui/UserInterfaceSounds';
import { GuildMenu } from '../ui/guild/GuildMenu';
import { OverworldScreen } from '../ui/overworld/OverworldScreen';
import type { ZoneContentTables } from '../ui/overworld/zone/TownScreen';
import { BattleController, type BattleConclusion } from './BattleController';
import { ZoneController } from './ZoneController';

const RANDOM_SEED_BIT_MASK = 0x7fffffff;

function canAffordAndInStock(
  guild: GuildState,
  zoneIdentifier: string,
  priceInGold: number,
  itemIdentifier: string,
): boolean {
  return guild.gold >= priceInGold && storeStockOf(guild, zoneIdentifier, itemIdentifier) > 0;
}

type GameScene = 'overworld' | 'zone' | 'battle';

export class GameController {
  private readonly battleRootElement: HTMLElement;
  private readonly battleCanvas: HTMLCanvasElement;
  private readonly overworldRootElement: HTMLElement;
  private readonly zoneRootElement: HTMLElement;
  private readonly saveGameStorage: SaveGameStorage;
  private readonly randomNumberGenerator: SeededRandomNumberGenerator;
  private readonly sounds = new UserInterfaceSounds();
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
    const bootTier = reputationTierForQuestCount(this.guild.completedQuestCount);
    for (const zone of Object.values(ZONES)) {
      // Saves from before a zone existed (or from before per-zone stock/boards
      // existed at all) start that zone with full shelves and a fresh board.
      if (!hasZoneBeenStocked(this.guild, zone.identifier)) {
        restockStore(this.guild, zone.identifier, ITEMS, EQUIPMENT, bootTier);
      }
      if (this.guild.questIdentifiersOnBoard[zone.identifier] === undefined) {
        refillQuestBoard(this.guild, zone.identifier, questIdentifiersForZone(zone, QUESTS), this.randomNumberGenerator);
      }
    }
    this.saveGameStorage.persistGuildSave(this.guild);

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
      {
        onHireRecruit: (recruitMemberIdentifier) => this.hireRecruit(recruitMemberIdentifier),
        onEquipItem: (memberIdentifier, equipmentIdentifier) => this.equipItem(memberIdentifier, equipmentIdentifier),
        onUnequipSlot: (memberIdentifier, slot) => this.unequipSlot(memberIdentifier, slot),
        onChangeClass: (memberIdentifier, classIdentifier) => this.changeClass(memberIdentifier, classIdentifier),
        onSetSecondarySkillClass: (memberIdentifier, classIdentifier) =>
          this.setSecondarySkillClass(memberIdentifier, classIdentifier),
      },
    );

    this.overworldScreen = new OverworldScreen(overworldRootElement, this.sounds, ZONES, {
      onEnterZone: (zoneIdentifier) => this.showZone(zoneIdentifier),
      onOpenGuildMenu: () => this.guildMenu.open(this.guild),
    });

    this.zoneContentTables = {
      quests: QUESTS,
      items: ITEMS,
      equipment: EQUIPMENT,
      battleMapsByIdentifier: BATTLE_MAPS,
      races: RACES,
      baseClasses: BASE_CLASSES,
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

  private showZone(zoneIdentifier: string): void {
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
        onOpenGuildMenu: () => this.guildMenu.open(this.guild),
        onReturnToWorldMap: () => this.showOverworld(),
        onEmbarkQuest: (questIdentifier, memberIdentifiers) => this.embarkOnQuest(questIdentifier, memberIdentifiers),
        onBuyItem: (itemIdentifier) => this.buyItem(itemIdentifier),
        onSellItem: (itemIdentifier) => this.sellItem(itemIdentifier),
        onBuyEquipment: (equipmentIdentifier) => this.buyEquipment(equipmentIdentifier),
        onSellEquipment: (equipmentIdentifier) => this.sellEquipment(equipmentIdentifier),
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

  private buyItem(itemIdentifier: string): void {
    const item = ITEMS[itemIdentifier];
    const zoneIdentifier = this.activeZoneIdentifier;
    if (zoneIdentifier === undefined || item === undefined || !canAffordAndInStock(this.guild, zoneIdentifier, item.priceInGold, itemIdentifier)) {
      return;
    }
    takeOneFromStoreStock(this.guild, zoneIdentifier, itemIdentifier);
    spendGold(this.guild, item.priceInGold);
    addConsumable(this.guild, itemIdentifier, 1);
    this.persistAndRefresh();
  }

  private sellItem(itemIdentifier: string): void {
    const item = ITEMS[itemIdentifier];
    if (item === undefined || !removeConsumable(this.guild, itemIdentifier, 1)) {
      return;
    }
    this.guild.gold += sellPriceForItem(item);
    this.persistAndRefresh();
  }

  private buyEquipment(equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    const zoneIdentifier = this.activeZoneIdentifier;
    if (
      zoneIdentifier === undefined ||
      equipment === undefined ||
      !canAffordAndInStock(this.guild, zoneIdentifier, equipment.priceInGold, equipmentIdentifier)
    ) {
      return;
    }
    takeOneFromStoreStock(this.guild, zoneIdentifier, equipmentIdentifier);
    spendGold(this.guild, equipment.priceInGold);
    addEquipmentPiece(this.guild, equipmentIdentifier);
    this.persistAndRefresh();
  }

  private sellEquipment(equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !removeEquipmentPiece(this.guild, equipmentIdentifier)) {
      return;
    }
    this.guild.gold += sellPriceForEquipment(equipment);
    this.persistAndRefresh();
  }

  private changeClass(memberIdentifier: string, classIdentifier: ClassIdentifier): void {
    if (!changeMemberClass(this.guild, memberIdentifier, classIdentifier, RACES, ADVANCED_CLASSES, EQUIPMENT)) {
      return;
    }
    this.persistAndRefresh();
  }

  private setSecondarySkillClass(
    memberIdentifier: string,
    classIdentifier: BaseClassIdentifier | undefined,
  ): void {
    const member = findRosterMember(this.guild, memberIdentifier);
    if (member === undefined) return;
    member.secondarySkillClassIdentifier = classIdentifier;
    this.persistAndRefresh();
  }

  private equipItem(memberIdentifier: string, equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !equipItemOnMember(this.guild, memberIdentifier, equipment)) {
      return;
    }
    this.persistAndRefresh();
  }

  private unequipSlot(memberIdentifier: string, slot: EquipmentSlot): void {
    if (!unequipMemberSlot(this.guild, memberIdentifier, slot)) {
      return;
    }
    this.persistAndRefresh();
  }

  private hireRecruit(recruitMemberIdentifier: string): void {
    const recruitOffer = this.guild.recruitsOnOffer.find(
      (offer) => offer.member.identifier === recruitMemberIdentifier,
    );
    if (recruitOffer === undefined || !hasRoomInRoster(this.guild)) {
      return;
    }
    if (!spendGold(this.guild, recruitOffer.hireCostInGold)) {
      return;
    }
    this.guild.roster.push(recruitOffer.member);
    this.guild.recruitsOnOffer = this.guild.recruitsOnOffer.filter(
      (offer) => offer.member.identifier !== recruitMemberIdentifier,
    );
    this.persistAndRefresh();
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
    const deployedMembers = memberIdentifiers
      .map((memberIdentifier) => findRosterMember(this.guild, memberIdentifier))
      .filter((member) => member !== undefined);
    if (deployedMembers.length === 0) {
      return;
    }

    const units = createUnitsForQuestBattle(quest, deployedMembers, mapEntry.deploymentTiles, this.unitContentTables);
    this.activeQuestIdentifier = questIdentifier;
    this.startBattle(mapEntry, units, memberIdentifiers, quest.displayName, (outcome) =>
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
    const deployedMembers = deployedMemberIdentifiers
      .map((memberIdentifier) => findRosterMember(this.guild, memberIdentifier))
      .filter((member) => member !== undefined);
    if (deployedMembers.length === 0) {
      return;
    }

    const enemySpawns = generateEncounterEnemySpawns(roamingGroup, zone.encounterSpawnTiles, this.randomNumberGenerator);
    const units = createUnitsForEncounterBattle(enemySpawns, deployedMembers, mapEntry.deploymentTiles, this.unitContentTables);
    this.activeRoamingGroupIdentifier = roamingGroupIdentifier;
    this.startBattle(mapEntry, units, deployedMemberIdentifiers, zone.displayName, (outcome) =>
      this.concludeZoneEncounterBattle(outcome),
    );
  }

  /** Builds and shows a battle, then hooks up its conclusion callback. Shared by quest and roaming-group fights. */
  private startBattle(
    mapEntry: BattleMapEntry,
    units: Unit[],
    deployedMemberIdentifiers: string[],
    combatLogLabel: string,
    onConcluded: (outcome: Exclude<BattleOutcome, 'ongoing'>) => BattleConclusion,
  ): void {
    const battle = new Battle(
      mapEntry.map,
      units,
      SKILLS,
      this.randomNumberGenerator.nextIntegerBetween(0, RANDOM_SEED_BIT_MASK),
      ITEMS,
      this.guild.consumableInventory,
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
        questIdentifiersForZone(zone, QUESTS),
        this.randomNumberGenerator,
      );
      const tier = reputationTierForQuestCount(this.guild.completedQuestCount);
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
   * Shared victory/defeat resolution for both quest and roaming-group
   * battles: kill XP always, gold + `onVictory` side effects only on a
   * win, defeat keeps kill XP but forfeits the reward (PRD §5). Returns to
   * the zone the fight started from.
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

    this.guild.consumableInventory = battle.getRemainingItemPouch();

    const killExperience = battle.defeatedEnemyLevels.reduce(
      (experienceSum, enemyLevel) => experienceSum + experienceForDefeatingEnemy(enemyLevel),
      0,
    );
    const experiencePerMember = killExperience + (outcome === 'victory' ? bonusExperienceOnVictory : 0);

    const summaryLines: string[] = [];
    if (outcome === 'victory') {
      this.guild.gold += goldRewardOnVictory;
      summaryLines.push(`Reward: ${goldRewardOnVictory} gold`);
    } else {
      summaryLines.push('The guild retreats — no reward, but experience is kept.');
    }
    summaryLines.push(
      `${battle.defeatedEnemyLevels.length} foes defeated · ${experiencePerMember} XP per member`,
    );

    for (const memberIdentifier of this.deployedMemberIdentifiers) {
      const member = findRosterMember(this.guild, memberIdentifier);
      if (member === undefined) {
        continue;
      }
      const levelsGained = applyExperienceGain(member, experiencePerMember);
      if (levelsGained > 0) {
        summaryLines.push(`${member.displayName} is now level ${member.level}!`);
      }
    }

    if (outcome === 'victory') {
      onVictory(zone);
    }

    this.saveGameStorage.persistGuildSave(this.guild);
    return {
      summaryLines,
      continueButtonLabel: `Return to ${zone.displayName}`,
      onContinue: () => this.showZone(zone.identifier),
    };
  }
}
