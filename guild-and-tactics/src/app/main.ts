import { BrowserLocalStorageSaveGameStorage } from '../platform/SaveGameStorage';
import { GameController } from './GameController';

function requiredElement<ElementType extends HTMLElement>(elementId: string): ElementType {
  const element = document.getElementById(elementId);
  if (element === null) {
    throw new Error(`Missing required element "#${elementId}"`);
  }
  return element as ElementType;
}

function startGame(): void {
  const battleCanvas = requiredElement<HTMLCanvasElement>('battle-canvas');
  if (!(battleCanvas instanceof HTMLCanvasElement)) {
    throw new Error('#battle-canvas is not a canvas element');
  }
  new GameController(
    requiredElement('battle-root'),
    battleCanvas,
    requiredElement('village-root'),
    new BrowserLocalStorageSaveGameStorage(window.localStorage),
  );
}

startGame();
