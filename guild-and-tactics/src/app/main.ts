import { Battle } from '../sim/battle/Battle';
import { SKILLS } from '../content/skills';
import { createDemoBattleUnits } from '../content/demoBattle';
import { FOREST_CLEARING_MAP } from '../content/maps/forestClearing';
import { BattleController } from './BattleController';

const RANDOM_SEED_BIT_MASK = 0x7fffffff;

function createDemoBattle(): Battle {
  const randomSeed = Date.now() & RANDOM_SEED_BIT_MASK;
  return new Battle(FOREST_CLEARING_MAP, createDemoBattleUnits(), SKILLS, randomSeed);
}

function startGame(): void {
  const canvas = document.getElementById('battle-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Missing #battle-canvas element');
  }
  new BattleController(canvas, createDemoBattle);
}

startGame();
