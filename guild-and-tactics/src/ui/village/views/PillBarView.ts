import type { UserInterfaceSounds } from '@/ui/UserInterfaceSounds';
import { createElementWithClass } from './DomPrimitives';

export interface PillBarEntry<EntryIdentifier extends string> {
  identifier: EntryIdentifier;
  label: string;
}

export function renderPillBar<EntryIdentifier extends string>(args: {
  entries: readonly PillBarEntry<EntryIdentifier>[];
  activeIdentifier: EntryIdentifier;
  className: string;
  sounds: UserInterfaceSounds;
  onSelect: (identifier: EntryIdentifier) => void;
}): HTMLElement {
  const pillBar = createElementWithClass('nav', args.className);
  for (const entry of args.entries) {
    const pillButton = document.createElement('button');
    pillButton.textContent = entry.label;
    pillButton.className = entry.identifier === args.activeIdentifier ? 'is-active' : '';
    pillButton.addEventListener('mouseenter', () => args.sounds.playMenuHover());
    pillButton.addEventListener('click', () => {
      args.sounds.playMenuConfirm();
      args.onSelect(entry.identifier);
    });
    pillBar.appendChild(pillButton);
  }
  return pillBar;
}
