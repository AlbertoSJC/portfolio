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
import { equipItemOnMember, unequipMemberSlot } from '../sim/guild/MemberEquipment';
import {
  sellPriceForEquipment,
  type EquipmentSlot,
} from '../sim/items/EquipmentDefinition';
import { EQUIPMENT } from '../content/equipment';
import { completeQuestOnBoard } from '../sim/guild/QuestBoard';
import { createUnitsForQuestBattle } from '../sim/guild/QuestBattleAssembly';
import { averageRosterLevel, generateRecruitOffers } from '../sim/guild/RecruitGeneration';
import {
  applyExperienceGain,
  experienceForDefeatingEnemy,
} from '../sim/progression/ExperienceAndLevels';
import { sellPriceForItem } from '../sim/items/ConsumableItemDefinition';
import type { SaveGameStorage } from '../platform/SaveGameStorage';
import { BASE_CLASSES } from '../content/baseClasses';
import { ITEMS } from '../content/items';
import { BATTLE_MAPS } from '../content/maps/battleMapRegistry';
import { MONSTERS } from '../content/monsters';
import { QUESTS } from '../content/quests';
import { RACES } from '../content/races';
import { RECRUIT_NAMES_BY_RACE } from '../content/recruitNames';
import { SKILLS } from '../content/skills';
import { createNewGuild } from '../content/newGame';
import { UserInterfaceSounds } from '../ui/UserInterfaceSounds';
import { VillageScreen } from '../ui/village/VillageScreen';
import { BattleController, type BattleConclusion } from './BattleController';

const RANDOM_SEED_BIT_MASK = 0x7fffffff;

/**
 * The top of the game: owns the guild state, the save storage, and the
 * village ↔ battle scene switch. Every state change is persisted through
 * the SaveGameStorage platform boundary.
 */
export class GameController {
  private readonly battleRootElement: HTMLElement;
  private readonly battleCanvas: HTMLCanvasElement;
  private readonly villageRootElement: HTMLElement;
  private readonly saveGameStorage: SaveGameStorage;
  private readonly randomNumberGenerator: SeededRandomNumberGenerator;
  private readonly sounds = new UserInterfaceSounds();
  private readonly villageScreen: VillageScreen;
  private guild: GuildState;
  private activeBattleController: BattleController | undefined;
  private activeQuestIdentifier: string | undefined;
  private activeBattle: Battle | undefined;
  private deployedMemberIdentifiers: string[] = [];

  constructor(
    battleRootElement: HTMLElement,
    battleCanvas: HTMLCanvasElement,
    villageRootElement: HTMLElement,
    saveGameStorage: SaveGameStorage,
  ) {
    this.battleRootElement = battleRootElement;
    this.battleCanvas = battleCanvas;
    this.villageRootElement = villageRootElement;
    this.saveGameStorage = saveGameStorage;
    this.randomNumberGenerator = new SeededRandomNumberGenerator(Date.now() & RANDOM_SEED_BIT_MASK);

    this.guild = this.saveGameStorage.loadGuildSave() ?? createNewGuild(this.randomNumberGenerator);
    this.saveGameStorage.persistGuildSave(this.guild);

    this.villageScreen = new VillageScreen(
      villageRootElement,
      this.sounds,
      {
        quests: QUESTS,
        items: ITEMS,
        equipment: EQUIPMENT,
        battleMapsByIdentifier: BATTLE_MAPS,
        races: RACES,
        baseClasses: BASE_CLASSES,
      },
      {
        onEmbarkQuest: (questIdentifier, memberIdentifiers) =>
          this.embarkOnQuest(questIdentifier, memberIdentifiers),
        onBuyItem: (itemIdentifier) => this.buyItem(itemIdentifier),
        onSellItem: (itemIdentifier) => this.sellItem(itemIdentifier),
        onBuyEquipment: (equipmentIdentifier) => this.buyEquipment(equipmentIdentifier),
        onSellEquipment: (equipmentIdentifier) => this.sellEquipment(equipmentIdentifier),
        onHireRecruit: (recruitMemberIdentifier) => this.hireRecruit(recruitMemberIdentifier),
        onEquipItem: (memberIdentifier, equipmentIdentifier) =>
          this.equipItem(memberIdentifier, equipmentIdentifier),
        onUnequipSlot: (memberIdentifier, slot) => this.unequipSlot(memberIdentifier, slot),
      },
    );

    this.showVillage();
  }

  // ── Scene switching ──────────────────────────────────────────────────

  private showVillage(): void {
    this.activeBattleController?.dispose();
    this.activeBattleController = undefined;
    this.activeBattle = undefined;
    this.activeQuestIdentifier = undefined;
    this.battleRootElement.classList.add('hidden');
    this.villageRootElement.classList.remove('hidden');
    this.villageScreen.render(this.guild);
  }

  private showBattle(): void {
    this.villageRootElement.classList.add('hidden');
    this.battleRootElement.classList.remove('hidden');
  }

  // ── Village actions ──────────────────────────────────────────────────

  private buyItem(itemIdentifier: string): void {
    const item = ITEMS[itemIdentifier];
    if (item === undefined || !spendGold(this.guild, item.priceInGold)) {
      return;
    }
    addConsumable(this.guild, itemIdentifier, 1);
    this.persistAndRerenderVillage();
  }

  private sellItem(itemIdentifier: string): void {
    const item = ITEMS[itemIdentifier];
    if (item === undefined || !removeConsumable(this.guild, itemIdentifier, 1)) {
      return;
    }
    this.guild.gold += sellPriceForItem(item);
    this.persistAndRerenderVillage();
  }

  private buyEquipment(equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !spendGold(this.guild, equipment.priceInGold)) {
      return;
    }
    addEquipmentPiece(this.guild, equipmentIdentifier);
    this.persistAndRerenderVillage();
  }

  private sellEquipment(equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !removeEquipmentPiece(this.guild, equipmentIdentifier)) {
      return;
    }
    this.guild.gold += sellPriceForEquipment(equipment);
    this.persistAndRerenderVillage();
  }

  private equipItem(memberIdentifier: string, equipmentIdentifier: string): void {
    const equipment = EQUIPMENT[equipmentIdentifier];
    if (equipment === undefined || !equipItemOnMember(this.guild, memberIdentifier, equipment)) {
      return;
    }
    this.persistAndRerenderVillage();
  }

  private unequipSlot(memberIdentifier: string, slot: EquipmentSlot): void {
    if (!unequipMemberSlot(this.guild, memberIdentifier, slot)) {
      return;
    }
    this.persistAndRerenderVillage();
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
    this.persistAndRerenderVillage();
  }

  private persistAndRerenderVillage(): void {
    this.saveGameStorage.persistGuildSave(this.guild);
    this.villageScreen.render(this.guild);
  }

  // ── Quest battles ────────────────────────────────────────────────────

  private embarkOnQuest(questIdentifier: string, memberIdentifiers: string[]): void {
    const quest = QUESTS[questIdentifier];
    const mapEntry = quest === undefined ? undefined : BATTLE_MAPS[quest.battleMapIdentifier];
    if (quest === undefined || mapEntry === undefined) {
      return;
    }
    const deployedMembers = memberIdentifiers
      .map((memberIdentifier) => findRosterMember(this.guild, memberIdentifier))
      .filter((member) => member !== undefined);
    if (deployedMembers.length === 0) {
      return;
    }

    const units = createUnitsForQuestBattle(quest, deployedMembers, mapEntry.deploymentTiles, {
      races: RACES,
      baseClasses: BASE_CLASSES,
      monsters: MONSTERS,
      equipment: EQUIPMENT,
    });
    const battle = new Battle(
      mapEntry.map,
      units,
      SKILLS,
      this.randomNumberGenerator.nextIntegerBetween(0, RANDOM_SEED_BIT_MASK),
      ITEMS,
      this.guild.consumableInventory,
    );

    this.activeQuestIdentifier = questIdentifier;
    this.activeBattle = battle;
    this.deployedMemberIdentifiers = memberIdentifiers;
    this.showBattle();
    this.activeBattleController = new BattleController(
      this.battleCanvas,
      battle,
      this.sounds,
      (outcome) => this.concludeQuestBattle(outcome),
    );
    this.activeBattleController.appendCombatLogLine(`— ${quest.displayName} —`);
  }

  /** Applies rewards and experience, saves, and describes it all for the overlay. */
  private concludeQuestBattle(outcome: Exclude<BattleOutcome, 'ongoing'>): BattleConclusion {
    const quest =
      this.activeQuestIdentifier === undefined ? undefined : QUESTS[this.activeQuestIdentifier];
    const battle = this.activeBattle;
    if (quest === undefined || battle === undefined) {
      return {
        summaryLines: [],
        continueButtonLabel: "Return to Wanderer's Rest",
        onContinue: () => this.showVillage(),
      };
    }

    // Consumables used in battle stay used, win or lose.
    this.guild.consumableInventory = battle.getRemainingItemPouch();

    const killExperience = battle.defeatedEnemyLevels.reduce(
      (experienceSum, enemyLevel) => experienceSum + experienceForDefeatingEnemy(enemyLevel),
      0,
    );
    // Defeat means a retreat: kill experience is kept, the reward is not (PRD §5).
    const experiencePerMember = killExperience + (outcome === 'victory' ? quest.rewardExperience : 0);

    const summaryLines: string[] = [];
    if (outcome === 'victory') {
      this.guild.gold += quest.rewardGold;
      summaryLines.push(`Reward: ${quest.rewardGold} gold`);
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
      completeQuestOnBoard(
        this.guild,
        quest.identifier,
        Object.keys(QUESTS),
        this.randomNumberGenerator,
      );
      // New faces drift into the hall after every job well done.
      this.guild.recruitsOnOffer = generateRecruitOffers(
        this.randomNumberGenerator,
        RACES,
        RECRUIT_NAMES_BY_RACE,
        averageRosterLevel(this.guild.roster.map((member) => member.level)),
      );
    }

    this.saveGameStorage.persistGuildSave(this.guild);
    return {
      summaryLines,
      continueButtonLabel: "Return to Wanderer's Rest",
      onContinue: () => this.showVillage(),
    };
  }
}
