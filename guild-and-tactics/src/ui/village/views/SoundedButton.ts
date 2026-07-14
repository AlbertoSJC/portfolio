import type { UserInterfaceSounds } from '@/ui/UserInterfaceSounds';

export interface SoundedButtonOptions {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
  playsCancelSound?: boolean;
  className?: string;
}

export function createSoundedButton(
  sounds: UserInterfaceSounds,
  options: SoundedButtonOptions,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = options.label;
  button.disabled = options.isDisabled ?? false;
  if (options.className !== undefined) {
    button.className = options.className;
  }
  button.addEventListener('mouseenter', () => {
    if (!button.disabled) {
      sounds.playMenuHover();
    }
  });
  button.addEventListener('click', () => {
    if (options.playsCancelSound === true) {
      sounds.playMenuCancel();
    } else {
      sounds.playMenuConfirm();
    }
    options.onClick();
  });
  return button;
}
