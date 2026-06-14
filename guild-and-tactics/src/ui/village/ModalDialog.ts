import type { UserInterfaceSounds } from '../UserInterfaceSounds';

/**
 * One reusable modal layer for the village (quest postings, character
 * sheets). Closes on the backdrop, the × button, or Escape unless
 * opened with closeable: false.
 */
export class ModalDialog {
  private readonly backdropElement: HTMLDivElement;
  private readonly contentElement: HTMLDivElement;
  private readonly sounds: UserInterfaceSounds;
  private onCloseCallback: (() => void) | undefined;
  private closeable = true;

  constructor(parentElement: HTMLElement, sounds: UserInterfaceSounds) {
    this.sounds = sounds;
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'modal-backdrop hidden';
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'modal-content';
    this.backdropElement.appendChild(this.contentElement);
    parentElement.appendChild(this.backdropElement);

    this.backdropElement.addEventListener('click', (clickEvent) => {
      if (this.closeable && clickEvent.target === this.backdropElement) {
        this.close();
      }
    });
    window.addEventListener('keydown', (keyEvent) => {
      if (this.closeable && keyEvent.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  isOpen(): boolean {
    return !this.backdropElement.classList.contains('hidden');
  }

  /** Shows the given content; onClose fires for every way of closing. */
  open(content: HTMLElement, onClose?: () => void, options?: { closeable?: boolean }): void {
    this.closeable = options?.closeable ?? true;
    this.onCloseCallback = onClose;
    this.contentElement.replaceChildren(...this.buildChildren(content));
    this.backdropElement.classList.remove('hidden');
  }

  /** Replaces the content while open (used to refresh after state changes). */
  refreshContent(content: HTMLElement): void {
    if (this.isOpen()) {
      this.contentElement.replaceChildren(...this.buildChildren(content));
    }
  }

  close(): void {
    if (!this.isOpen()) {
      return;
    }
    this.sounds.playMenuCancel();
    this.backdropElement.classList.add('hidden');
    this.contentElement.replaceChildren();
    this.onCloseCallback?.();
    this.onCloseCallback = undefined;
  }

  /** Closes without playing the cancel sound — used for programmatic transitions (e.g. embarking). */
  forceClose(): void {
    if (!this.isOpen()) {
      return;
    }
    this.backdropElement.classList.add('hidden');
    this.contentElement.replaceChildren();
    this.onCloseCallback?.();
    this.onCloseCallback = undefined;
  }

  private buildChildren(content: HTMLElement): Node[] {
    return this.closeable ? [this.buildCloseButton(), content] : [content];
  }

  private buildCloseButton(): HTMLButtonElement {
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-button';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => this.close());
    return closeButton;
  }
}
